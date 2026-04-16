/**
 * @file insuranceCheck.ts
 * @description F05 — 전세보증보험 가입 가능 여부 + 보증료 계산 (HUG 기준 간이)
 * @module lib/zipjikimi/calc
 *
 * @note HUG(주택도시보증공사) 전세보증금반환보증 기준 (2026년):
 *   - 수도권(서울/경기/인천): 보증금 7억 이하
 *   - 비수도권: 보증금 5억 이하
 *   - 반전세: 환산보증금 = 보증금 + 월세×12/전환율 (7억/5억 기준 동일)
 *   - 부채비율 = (선순위담보 + 보증금) / 주택가액 ≤ 100%
 *   - 보증료율: 아파트 연 0.115~0.128%, 그외 연 0.154% (평균, 실제는 주택유형×보증금 구간)
 */

export type ZjRegionGroup = "수도권" | "비수도권";
export type ZjHouseType = "아파트" | "오피스텔" | "단독다가구" | "연립다세대";

export interface ZjInsuranceInput {
  /** 보증금 (만원) */
  depositMan: number;
  /** 월세 (만원) — 반전세일 때 */
  monthlyRentMan?: number;
  /** 주택 유형 */
  houseType: ZjHouseType;
  /** 지역 그룹 */
  region: ZjRegionGroup;
  /** 선순위 담보 (근저당 등, 만원) */
  priorLienMan?: number;
  /** 주택가액 (공시가격 또는 매매시세, 만원) */
  housePriceMan?: number;
  /** 전월세 전환율 (소수, 예: 0.055) — 반전세 환산용 */
  conversionRate?: number;
  /** 계약 기간 (일) — 기본 730 (2년) */
  contractDays?: number;
}

export interface ZjInsuranceResult {
  eligible: boolean;
  /** 환산 보증금 (만원) */
  effectiveDepositMan: number;
  /** 부채비율 (0~1) — 계산 불가 시 null */
  debtRatio: number | null;
  /** 연간 보증료율 (%) — 추정 */
  annualRatePct: number;
  /** 계약 전체 보증료 (원) */
  premiumWon: number;
  /** 불가 사유/경고 */
  reasons: string[];
}

/** HUG 보증금 한도 (만원) */
const HUG_LIMIT: Record<ZjRegionGroup, number> = {
  수도권: 70_000,
  비수도권: 50_000,
};

/** 주택유형별 HUG 추정 보증료율 (연 %) — 실제는 구간별이지만 평균값 사용 */
const HUG_RATE_PCT: Record<ZjHouseType, number> = {
  아파트: 0.122,
  오피스텔: 0.128,
  연립다세대: 0.154,
  단독다가구: 0.154,
};

/**
 * 전세보증보험 판정 + 보증료 계산.
 */
export function checkInsuranceEligibility(input: ZjInsuranceInput): ZjInsuranceResult {
  const {
    depositMan,
    monthlyRentMan = 0,
    houseType,
    region,
    priorLienMan = 0,
    housePriceMan,
    conversionRate = 0.055,
    contractDays = 730,
  } = input;

  // 환산 보증금 (반전세)
  const monthlyAnnual = monthlyRentMan * 12;
  const effectiveDepositMan =
    monthlyRentMan > 0 && conversionRate > 0
      ? Math.round(depositMan + monthlyAnnual / conversionRate)
      : depositMan;

  const reasons: string[] = [];

  // 1) 보증금 한도
  const limit = HUG_LIMIT[region];
  const overLimit = effectiveDepositMan > limit;
  if (overLimit) {
    reasons.push(
      `환산 보증금 ${effectiveDepositMan.toLocaleString()}만원 > ${region} 한도 ${limit.toLocaleString()}만원`,
    );
  }

  // 2) 부채비율 (선순위담보 + 보증금) / 주택가액 ≤ 100%
  let debtRatio: number | null = null;
  if (housePriceMan && housePriceMan > 0) {
    debtRatio = (priorLienMan + effectiveDepositMan) / housePriceMan;
    if (debtRatio > 1) {
      reasons.push(
        `부채비율 ${(debtRatio * 100).toFixed(1)}% > 100% (선순위+보증금이 주택가액 초과)`,
      );
    } else if (debtRatio > 0.8) {
      reasons.push(
        `부채비율 ${(debtRatio * 100).toFixed(1)}% — 가입은 가능하나 위험도 높음.`,
      );
    }
  }

  // 3) 보증료 계산
  const annualRatePct = HUG_RATE_PCT[houseType];
  const effectiveDepositWon = effectiveDepositMan * 10_000;
  const premiumWon = Math.round(
    effectiveDepositWon * (annualRatePct / 100) * (contractDays / 365),
  );

  // 4) eligible 판정 (한도 내 + 부채비율 ≤ 100%)
  const eligible = !overLimit && (debtRatio === null || debtRatio <= 1);

  return {
    eligible,
    effectiveDepositMan,
    debtRatio,
    annualRatePct,
    premiumWon,
    reasons,
  };
}
