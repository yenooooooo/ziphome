/**
 * @file priceAdequacy.ts
 * @description F03 — 보증금/매매가 적정성 판단 (개선판)
 *   - 면적 ±20% + 건축년도 ±5년 매칭 (건축년도 있을 때)
 *   - 표본 수 기반 신뢰도 (높음/보통/낮음/부족)
 *   - 4단계 판정 (적정/다소높음/위험/저평가의심)
 *   - 전세가율: 동일 면적 매매 평균 기준으로 재계산
 * @module lib/zipjikimi/analysis
 */

import type {
  ZjTransactionRecord,
  ZjTransactionSummary,
} from "@/types/zipjikimi/transaction";
import type { ZjPriceAdequacy } from "@/types/zipjikimi/property";

export type ZjConfidence = "높음" | "보통" | "낮음" | "부족";

export interface ZjAdequacyInput {
  /** 보증금 (매매는 매매가, 전세는 전세보증금, 월세는 월세보증금) */
  inputPriceMan: number;
  /** 월세 (월세 비교 시만) */
  inputMonthlyRentMan?: number;
  areaM2: number;
  /** 계약/건물 준공년도 (있으면 ±5년 필터 적용) */
  builtYear?: number;
  compareType: "매매" | "전세" | "월세";
  /** 비교 대상 (매매/전세/월세 각각의 요약) */
  compareSummary: ZjTransactionSummary;
  /** 전세가율 계산용 매매 요약 (전세·월세 비교 시 필요) */
  saleSummary?: ZjTransactionSummary;
  /** 월세 환산용 전환율 (소수, 예: 0.055). 미제공 시 기본 5.5% */
  conversionRate?: number;
}

export interface ZjAdequacyResult {
  level: ZjPriceAdequacy;
  marketAverage?: number;
  /** 비교에 사용된 표본 수 */
  sampleCount: number;
  confidence: ZjConfidence;
  /** 입력값 - 시장평균 차이 비율 (+ 는 비쌈) */
  diffRatio?: number;
  /** 전세가율 — 전세/월세 모두. 월세는 "환산" 기준 (참고용) */
  jeonseRatio?: { ratio: number; risk: "안전" | "주의" | "위험" };
  /** 전세가율 계산 기준 (면적필터 / 전체) */
  jeonseRatioBasis?: "면적필터" | "전체평균";
  /** 월세 계약 전용 — 실제 보증금 원금 회수 비율 (보증금/매매평균) */
  depositRecoveryRatio?: { ratio: number; risk: "안전" | "주의" | "위험" };
  /** 필터 조건 설명 */
  filterDescription: string;
  /** 상세 해설 */
  note: string;
}

/** 면적 ±areaTol, 건축년도 ±yearTol (year 있을 때만) */
function filterComparables(
  records: ZjTransactionRecord[],
  areaM2: number,
  builtYear?: number,
  areaTol = 0.2,
  yearTol = 5,
): ZjTransactionRecord[] {
  const min = areaM2 * (1 - areaTol);
  const max = areaM2 * (1 + areaTol);
  return records.filter((r) => {
    if (typeof r.areaM2 !== "number") return false;
    if (r.areaM2 < min || r.areaM2 > max) return false;
    if (builtYear !== undefined && typeof r.builtYear === "number") {
      if (Math.abs(r.builtYear - builtYear) > yearTol) return false;
    }
    return true;
  });
}

function toConfidence(n: number): ZjConfidence {
  if (n >= 10) return "높음";
  if (n >= 5) return "보통";
  if (n >= 3) return "낮음";
  return "부족";
}

/** 전세가율 등급 */
export function calcJeonseRatio(
  depositMan: number,
  saleAverageMan: number,
): { ratio: number; risk: "안전" | "주의" | "위험" } {
  const ratio = depositMan / saleAverageMan;
  let risk: "안전" | "주의" | "위험";
  if (ratio >= 0.8) risk = "위험";
  else if (ratio >= 0.6) risk = "주의";
  else risk = "안전";
  return { ratio, risk };
}

/** 환산보증금 = 보증금 + (월세 × 12 / 전환율) */
function toEffectiveDeposit(
  depositMan: number,
  monthlyRentMan: number | undefined,
  rate: number,
): number {
  const m = monthlyRentMan ?? 0;
  if (m <= 0 || rate <= 0) return depositMan;
  return Math.round(depositMan + (m * 12) / rate);
}

export function assessPriceAdequacy(input: ZjAdequacyInput): ZjAdequacyResult {
  const {
    inputPriceMan,
    inputMonthlyRentMan,
    areaM2,
    builtYear,
    compareType,
    compareSummary,
    saleSummary,
    conversionRate = 0.055,
  } = input;
  // 월세 비교 시 입력값은 환산보증금 기준으로 통일
  const effectiveInput =
    compareType === "월세"
      ? toEffectiveDeposit(inputPriceMan, inputMonthlyRentMan, conversionRate)
      : inputPriceMan;

  // 1차: 면적 + 건축년도 모두 적용
  const useYear = builtYear !== undefined;
  let comparable = filterComparables(
    compareSummary.records,
    areaM2,
    useYear ? builtYear : undefined,
  );
  let loosened = false;
  // 표본 5건 미만이면 건축년도 조건 완화
  if (useYear && comparable.length < 5) {
    comparable = filterComparables(compareSummary.records, areaM2);
    loosened = true;
  }

  const values = comparable
    .map((r) => {
      if (compareType === "매매") return r.salePrice;
      if (compareType === "월세")
        return r.deposit !== undefined
          ? toEffectiveDeposit(r.deposit, r.monthlyRent, conversionRate)
          : undefined;
      // 전세
      return r.deposit;
    })
    .filter((v): v is number => v !== undefined);

  const sampleCount = values.length;
  const confidence = toConfidence(sampleCount);

  const filterDescription =
    `면적 ${areaM2.toFixed(1)}㎡ ±20%` +
    (useYear && !loosened
      ? ` · 준공 ${builtYear! - 5}~${builtYear! + 5}년`
      : loosened
        ? " · 준공년도 조건 완화"
        : "");

  if (confidence === "부족") {
    return {
      level: "적정",
      sampleCount,
      confidence: "부족",
      filterDescription,
      note: `유사 거래가 ${sampleCount}건뿐이라 판단을 유보합니다. 더 넓은 기간·다른 유형 탭에서 재조회를 추천합니다.`,
    };
  }

  const avg = Math.round(values.reduce((a, b) => a + b, 0) / sampleCount);
  const diff = (effectiveInput - avg) / avg;

  let level: ZjPriceAdequacy;
  let note: string;
  if (diff > 0.15) {
    level = "위험";
    note = `시장 평균 대비 +${(diff * 100).toFixed(1)}%. 깡통전세/고평가 의심 — 네고 시도 또는 다른 매물 비교 권장.`;
  } else if (diff > 0.05) {
    level = "다소높음";
    note = `시장 평균 대비 +${(diff * 100).toFixed(1)}%. 네고 여지 확인.`;
  } else if (diff < -0.2) {
    level = "저평가의심";
    note = `시장 평균 대비 ${(diff * 100).toFixed(1)}%로 이례적으로 저렴. 하자·급매·사기 미끼 여부 확인 필수 — 등기부등본·현장 점검 권장.`;
  } else {
    level = "적정";
    note = `시장 평균 대비 ${diff >= 0 ? "+" : ""}${(diff * 100).toFixed(1)}%. 적정 수준.`;
  }

  if (confidence === "낮음") {
    note = `⚠️ 표본 ${sampleCount}건으로 신뢰도 낮음. ` + note;
  }

  // ---- 전세가율 + 보증금 회수 비율 (전세/월세만) ----
  let jeonseRatio: ZjAdequacyResult["jeonseRatio"];
  let jeonseRatioBasis: ZjAdequacyResult["jeonseRatioBasis"];
  let depositRecoveryRatio: ZjAdequacyResult["depositRecoveryRatio"];
  if ((compareType === "전세" || compareType === "월세") && saleSummary) {
    const saleComparable = filterComparables(
      saleSummary.records,
      areaM2,
      useYear ? builtYear : undefined,
    );
    const saleValues = saleComparable
      .map((r) => r.salePrice)
      .filter((v): v is number => v !== undefined);
    let saleAvg: number | undefined;
    if (saleValues.length >= 3) {
      saleAvg = saleValues.reduce((a, b) => a + b, 0) / saleValues.length;
      jeonseRatioBasis = "면적필터";
    } else if (saleSummary.avgPrice) {
      saleAvg = saleSummary.avgPrice;
      jeonseRatioBasis = "전체평균";
    }
    if (saleAvg) {
      // 환산 전세가율 (전세는 = 전세가율, 월세는 참고용)
      jeonseRatio = calcJeonseRatio(effectiveInput, saleAvg);
      // 월세: 실제 보증금 원금 회수 비율
      if (compareType === "월세") {
        const rRatio = inputPriceMan / saleAvg;
        let rRisk: "안전" | "주의" | "위험";
        if (rRatio >= 0.8) rRisk = "위험";
        else if (rRatio >= 0.5) rRisk = "주의";
        else rRisk = "안전";
        depositRecoveryRatio = { ratio: rRatio, risk: rRisk };
      }
    }
  }

  return {
    level,
    marketAverage: avg,
    sampleCount,
    confidence,
    diffRatio: diff,
    jeonseRatio,
    jeonseRatioBasis,
    depositRecoveryRatio,
    filterDescription,
    note,
  };
}

/** 유사 거래 레코드에서 "자주 나오는 평형" top N 추출 */
export function extractCommonAreas(
  records: ZjTransactionRecord[] | undefined,
  topN = 5,
): Array<{ areaM2: number; pyeong: number; count: number }> {
  if (!records || records.length === 0) return [];
  // 1㎡ 단위 반올림으로 버킷
  const bucket = new Map<number, number>();
  for (const r of records) {
    if (typeof r.areaM2 !== "number") continue;
    const key = Math.round(r.areaM2);
    bucket.set(key, (bucket.get(key) ?? 0) + 1);
  }
  return Array.from(bucket.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([areaM2, count]) => ({
      areaM2,
      pyeong: Math.round((areaM2 / 3.3058) * 10) / 10,
      count,
    }));
}
