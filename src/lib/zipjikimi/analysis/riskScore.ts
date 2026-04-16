/**
 * @file riskScore.ts
 * @description 종합 위험 스코어 — 4개 축 가중 합산 (0~100점, 높을수록 위험)
 *   - 가격 신호 (적정성)
 *   - 전세가율 (전세일 때만)
 *   - 건물 노후도
 *   - 최근 6개월 가격 추세
 * @module lib/zipjikimi/analysis
 */

import type { ZjTransactionRecord } from "@/types/zipjikimi/transaction";
import type { ZjRiskLevel } from "@/types/zipjikimi/property";
import type { ZjAdequacyResult } from "./priceAdequacy";

export interface ZjRiskScoreInput {
  /** F03 적정성 결과 (없으면 해당 점수 낮게 처리) */
  adequacy?: ZjAdequacyResult;
  /** 건물 준공년도 (노후도) */
  builtYear?: number;
  /** 매매 실거래 레코드 (추세 계산) */
  saleRecords?: ZjTransactionRecord[];
  /** 계약 유형 — "매매" 면 전세가율 축 배제, 전세·월세는 동일 */
  compareType: "매매" | "전세" | "월세";
}

export interface ZjRiskScoreBreakdown {
  price: number;
  jeonseRatio: number;
  buildingAge: number;
  priceTrend: number;
}

export interface ZjRiskScoreResult {
  totalScore: number;
  level: ZjRiskLevel;
  breakdown: ZjRiskScoreBreakdown;
  actions: string[];
  summary: string;
  /** 계산 데이터 충분성 */
  complete: boolean;
}

function scorePrice(adequacy?: ZjAdequacyResult): number {
  if (!adequacy || adequacy.confidence === "부족") return 5;
  switch (adequacy.level) {
    case "위험":
      return 22;
    case "다소높음":
      return 12;
    case "저평가의심":
      return 15; // 다른 이유로 의심
    case "적정":
    default:
      return 3;
  }
}

function scoreJeonse(adequacy?: ZjAdequacyResult): number {
  if (!adequacy?.jeonseRatio) return 5; // 데이터 부족 중립
  switch (adequacy.jeonseRatio.risk) {
    case "위험":
      return 25;
    case "주의":
      return 15;
    case "안전":
    default:
      return 3;
  }
}

function scoreBuildingAge(builtYear?: number): number {
  if (builtYear === undefined) return 5;
  const years = new Date().getFullYear() - builtYear;
  if (years >= 35) return 22;
  if (years >= 25) return 15;
  if (years >= 15) return 8;
  return 2;
}

/** 최근 6개월 평균 vs 이전 6개월 평균 추세 */
function scoreTrend(records?: ZjTransactionRecord[]): number {
  if (!records || records.length < 6) return 5;
  const now = Date.now();
  const sixMonthsMs = 6 * 30 * 24 * 60 * 60 * 1000;
  const recent: number[] = [];
  const prior: number[] = [];
  for (const r of records) {
    const date = new Date(r.dealYear, r.dealMonth - 1, r.dealDay ?? 15).getTime();
    const age = now - date;
    const price = r.salePrice ?? r.deposit;
    if (!price) continue;
    if (age <= sixMonthsMs) recent.push(price);
    else if (age <= 2 * sixMonthsMs) prior.push(price);
  }
  if (recent.length < 2 || prior.length < 2) return 5;
  const r = recent.reduce((a, b) => a + b, 0) / recent.length;
  const p = prior.reduce((a, b) => a + b, 0) / prior.length;
  const change = (r - p) / p;
  if (change <= -0.1) return 20;
  if (change <= -0.03) return 10;
  if (change < 0.03) return 5;
  return 3;
}

/**
 * 간이 위험 스코어 — 입력 없이 건축년도 + 가격추세만으로 산출 (0~100).
 * 2축만 사용하므로 ×2 스케일링.
 */
export function computeQuickRiskScore(
  builtYear?: number,
  saleRecords?: ZjTransactionRecord[],
): ZjRiskScoreResult {
  const ageScore = scoreBuildingAge(builtYear);
  const trendScore = scoreTrend(saleRecords);
  const total = Math.round(((ageScore + trendScore) * 100) / 50);
  let level: ZjRiskLevel;
  if (total >= 75) level = "매우위험";
  else if (total >= 50) level = "위험";
  else if (total >= 25) level = "주의";
  else level = "안전";

  const actions: string[] = [];
  if (ageScore >= 20) actions.push("재건축·안전진단 이력 및 누수·구조 현장 점검");
  else if (ageScore >= 10) actions.push("노후 설비 점검 (보일러·배관·방수)");
  if (trendScore >= 15) actions.push("최근 6개월 가격 하락 추세 — 1~2개월 관망 고려");
  if (actions.length === 0) actions.push("특별한 경고 없음");

  return {
    totalScore: total,
    level,
    breakdown: {
      price: 0,
      jeonseRatio: 0,
      buildingAge: ageScore,
      priceTrend: trendScore,
    },
    actions,
    summary: `간이 위험도 ${total}점 / 100 — ${level} (노후도 + 추세만)`,
    complete: false,
  };
}

export function computeRiskScore(input: ZjRiskScoreInput): ZjRiskScoreResult {
  const priceScore = scorePrice(input.adequacy);
  const jeonseScore =
    input.compareType === "매매" ? 0 : scoreJeonse(input.adequacy);
  const ageScore = scoreBuildingAge(input.builtYear);
  const trendScore = scoreTrend(input.saleRecords);

  // 매매는 전세가율 축 없음 → 나머지 3개 축을 100점 만점으로 스케일 (×4/3)
  const rawTotal = priceScore + jeonseScore + ageScore + trendScore;
  const total =
    input.compareType === "매매"
      ? Math.round(((priceScore + ageScore + trendScore) * 100) / 75)
      : rawTotal;

  let level: ZjRiskLevel;
  if (total >= 75) level = "매우위험";
  else if (total >= 50) level = "위험";
  else if (total >= 25) level = "주의";
  else level = "안전";

  const actions: string[] = [];
  if (priceScore >= 20) actions.push("시장 대비 고평가 — 네고 또는 다른 매물 재검토");
  else if (priceScore >= 10) actions.push("가격 협상 여지 확인 권장");
  if (input.adequacy?.level === "저평가의심")
    actions.push("이례적 저가 — 등기부등본·현장 직접 확인 필수");
  if (jeonseScore >= 20)
    actions.push("🔴 전세보증보험(HUG) 필수 — 가입 불가 시 계약 재고");
  else if (jeonseScore >= 10)
    actions.push("전세보증보험 가입 권장 + 선순위채권 등기부 확인");
  if (ageScore >= 20)
    actions.push("재건축·안전진단 이력 및 누수·구조 현장 점검");
  else if (ageScore >= 10) actions.push("노후 설비 점검 (보일러·배관·방수)");
  if (trendScore >= 15)
    actions.push("최근 6개월 가격 하락 추세 — 1~2개월 관망 고려");
  if (actions.length === 0) actions.push("특별한 경고 없음 — 계약 진행 가능");

  const summary = `종합 위험도 ${total}점 / 100 — ${level}`;

  return {
    totalScore: total,
    level,
    breakdown: {
      price: priceScore,
      jeonseRatio: jeonseScore,
      buildingAge: ageScore,
      priceTrend: trendScore,
    },
    actions,
    summary,
    complete: !!input.adequacy && input.adequacy.confidence !== "부족",
  };
}
