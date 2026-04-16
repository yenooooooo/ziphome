/**
 * @file fraudDetection.ts
 * @description F17 — 사기 위험 탐지 (등기부 없이도 작동하는 1차 필터)
 *   기존 F01+F03 데이터 조합으로 위험 신호 자동 감지.
 * @module lib/zipjikimi/analysis
 */

import type { ZjTransactionSummary } from "@/types/zipjikimi/transaction";

export interface ZjFraudSignal {
  id: string;
  label: string;
  severity: "info" | "warning" | "danger";
  detail: string;
}

export interface ZjFraudDetectionResult {
  level: "안전" | "주의" | "위험";
  signals: ZjFraudSignal[];
}

export interface ZjFraudDetectionInput {
  /** 전세가율 (전체 평균 기준, 선택) */
  jeonseRatio?: number;
  /** 최근 가격 변동률 (소수, +상승/-하락) */
  priceChangeRate?: number;
  /** 사용자 입력 보증금 대비 시장 diff */
  priceDiffRatio?: number;
  /** 건물 노후도 (년) */
  buildingAge?: number;
  /** 매매 거래 건수 (최근 12개월) */
  saleCount?: number;
  /** 소유권 이전 빈도 (등기부 있을 때) */
  ownershipChanges?: number;
}

/**
 * 기존 데이터로 사기 위험 신호 감지.
 * 등기부등본(F14) 없이도 1차 판별 가능.
 */
export function detectFraudSignals(input: ZjFraudDetectionInput): ZjFraudDetectionResult {
  const signals: ZjFraudSignal[] = [];

  // 1) 전세가율 90%+ → 깡통전세 극고위험
  if (input.jeonseRatio !== undefined && input.jeonseRatio >= 0.9) {
    signals.push({
      id: "jeonse-ratio-extreme",
      label: "깡통전세 극고위험",
      severity: "danger",
      detail: `전세가율 ${Math.round(input.jeonseRatio * 100)}% — 매매가 대비 전세 보증금이 90% 이상. 보증금 회수 불가 위험 매우 높음.`,
    });
  } else if (input.jeonseRatio !== undefined && input.jeonseRatio >= 0.8) {
    signals.push({
      id: "jeonse-ratio-high",
      label: "깡통전세 주의",
      severity: "warning",
      detail: `전세가율 ${Math.round(input.jeonseRatio * 100)}% — HUG 전세보증보험 필수 검토.`,
    });
  }

  // 2) 가격 급락 10%+ → 투매/경매 우려
  if (input.priceChangeRate !== undefined && input.priceChangeRate <= -0.1) {
    signals.push({
      id: "price-crash",
      label: "시세 급락",
      severity: "warning",
      detail: `최근 6개월 시세 ${Math.abs(Math.round(input.priceChangeRate * 100))}% 하락. 하락장 진입 가능성 — 보증금 방어력 약화.`,
    });
  }

  // 3) 이례적 저평가 (-20%)
  if (input.priceDiffRatio !== undefined && input.priceDiffRatio < -0.2) {
    signals.push({
      id: "undervalued-suspicious",
      label: "이례적 저가",
      severity: "warning",
      detail: `시장 평균 대비 ${Math.abs(Math.round(input.priceDiffRatio * 100))}% 저렴 — 하자·급매·사기 미끼 가능성. 현장+등기부 반드시 확인.`,
    });
  }

  // 4) 노후 건물 (35년+) + 전세
  if (input.buildingAge !== undefined && input.buildingAge >= 35) {
    signals.push({
      id: "old-building",
      label: "고노후 건물",
      severity: "warning",
      detail: `준공 ${input.buildingAge}년 — 재건축 예상 시 임차인 퇴거 위험. 안전진단 결과 확인.`,
    });
  }

  // 5) 거래 희소 (12개월 5건 미만)
  if (input.saleCount !== undefined && input.saleCount < 5) {
    signals.push({
      id: "low-volume",
      label: "거래 희소 지역",
      severity: "info",
      detail: `최근 1년 매매 거래 ${input.saleCount}건 — 시세 판단 불확실, 감정평가 참고 권장.`,
    });
  }

  // 6) 소유권 빈번 이전 (5년 내 3회+, 등기부 있을 때)
  if (input.ownershipChanges !== undefined && input.ownershipChanges >= 3) {
    signals.push({
      id: "frequent-transfer",
      label: "소유권 빈번 이전",
      severity: "danger",
      detail: `5년 내 소유권 ${input.ownershipChanges}회 이전 — 전세 사기 패턴(갭투자 매매 후 전세 불이행) 의심.`,
    });
  }

  let level: ZjFraudDetectionResult["level"];
  if (signals.some((s) => s.severity === "danger")) level = "위험";
  else if (signals.some((s) => s.severity === "warning")) level = "주의";
  else level = "안전";

  return { level, signals };
}

/**
 * 기존 요약 데이터에서 입력값 추출 → detectFraudSignals 호출.
 */
export function detectFraudFromSummaries(
  saleSummary?: ZjTransactionSummary,
  jeonseSummary?: ZjTransactionSummary,
  buildingAge?: number,
): ZjFraudDetectionResult {
  // 전세가율 (전세 평균 / 매매 평균)
  const jeonseRatio =
    jeonseSummary?.avgDeposit && saleSummary?.avgPrice
      ? jeonseSummary.avgDeposit / saleSummary.avgPrice
      : undefined;

  // 최근 6개월 가격 변동
  let priceChangeRate: number | undefined;
  if (saleSummary && saleSummary.records.length >= 10) {
    const now = Date.now();
    const sixM = 6 * 30 * 24 * 60 * 60 * 1000;
    const recent: number[] = [];
    const prior: number[] = [];
    for (const r of saleSummary.records) {
      const d = new Date(r.dealYear, r.dealMonth - 1, r.dealDay ?? 15).getTime();
      const p = r.salePrice ?? r.deposit;
      if (!p) continue;
      if (now - d <= sixM) recent.push(p);
      else if (now - d <= 2 * sixM) prior.push(p);
    }
    if (recent.length >= 2 && prior.length >= 2) {
      const rAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const pAvg = prior.reduce((a, b) => a + b, 0) / prior.length;
      priceChangeRate = (rAvg - pAvg) / pAvg;
    }
  }

  return detectFraudSignals({
    jeonseRatio,
    priceChangeRate,
    buildingAge,
    saleCount: saleSummary?.count,
  });
}
