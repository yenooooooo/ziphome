/**
 * @file conversionRate.ts
 * @description F04 — 전월세 전환 계산기
 *   전환율 = 한국은행 기준금리 + 대통령령 가산율 (2026년 기준 2.0%)
 *   주택임대차보호법 제7조의2, 시행령 제9조
 * @module lib/zipjikimi/calc
 */

/** 2026년 기준 전월세전환율 가산율 (주택임대차보호법 시행령) */
export const ZJ_CONVERSION_SURCHARGE = 0.02; // 2%

/**
 * 전환율 계산: 기준금리 + 가산율.
 * @param baseRatePct 기준금리 (연 %, 예: 3.5)
 * @param surchargePct 가산율 (기본 2%)
 * @returns 연 전환율 (소수, 예: 0.055)
 */
export function computeConversionRate(
  baseRatePct: number,
  surchargePct = ZJ_CONVERSION_SURCHARGE * 100,
): number {
  return (baseRatePct + surchargePct) / 100;
}

/**
 * 전세 → 월세 변환.
 * 월세 = (전세보증금 - 전환후 보증금) × 전환율 / 12
 *
 * @param jeonseDepositMan 순수 전세 보증금 (만원)
 * @param keptDepositMan 전환 후에도 남길 보증금 (만원)
 * @param annualRate 전환율 (소수)
 * @returns 월세 (만원/월)
 */
export function jeonseToMonthly(
  jeonseDepositMan: number,
  keptDepositMan: number,
  annualRate: number,
): { monthlyRentMan: number; keptDepositMan: number } {
  if (jeonseDepositMan <= keptDepositMan) {
    return { monthlyRentMan: 0, keptDepositMan };
  }
  const diff = jeonseDepositMan - keptDepositMan;
  const monthly = (diff * annualRate) / 12;
  return {
    monthlyRentMan: Math.round(monthly * 100) / 100,
    keptDepositMan,
  };
}

/**
 * 월세 → 전세 환산 (환산 보증금).
 * 환산보증금 = 월세 × 12 / 전환율 + 현재 보증금
 */
export function monthlyToJeonseEquivalent(
  depositMan: number,
  monthlyRentMan: number,
  annualRate: number,
): number {
  if (annualRate <= 0) return depositMan;
  return Math.round(depositMan + (monthlyRentMan * 12) / annualRate);
}
