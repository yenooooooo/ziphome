/**
 * @file brokerageFeeTable.ts
 * @description 중개수수료 법정 요율표 (공인중개사법 시행규칙 별표 1, 2021.10.19 개정 → 2026년 현재 유효)
 * @see https://www.law.go.kr/LSW/lsBylInfoPLinkR.do?lsiSeq=237014&bylNo=0001
 * @module constants/zipjikimi
 */

/** 주거용(아파트/빌라/단독) 매매 요율 구간 */
export const ZJ_FEE_SALE_RESIDENTIAL = [
  { min: 0, max: 5_000, ratePct: 0.6, cap: 250_000 },
  { min: 5_000, max: 20_000, ratePct: 0.5, cap: 800_000 },
  { min: 20_000, max: 90_000, ratePct: 0.4, cap: null },
  { min: 90_000, max: 120_000, ratePct: 0.5, cap: null },
  { min: 120_000, max: 150_000, ratePct: 0.6, cap: null },
  { min: 150_000, max: Infinity, ratePct: 0.7, cap: null },
] as const;

/** 주거용 임대차 (전세·월세 환산) 요율 구간 */
export const ZJ_FEE_RENT_RESIDENTIAL = [
  { min: 0, max: 5_000, ratePct: 0.5, cap: 200_000 },
  { min: 5_000, max: 10_000, ratePct: 0.4, cap: 300_000 },
  { min: 10_000, max: 60_000, ratePct: 0.3, cap: null },
  { min: 60_000, max: 120_000, ratePct: 0.4, cap: null },
  { min: 120_000, max: 150_000, ratePct: 0.5, cap: null },
  { min: 150_000, max: Infinity, ratePct: 0.6, cap: null },
] as const;

/** 오피스텔(주거 전용 85㎡ 이하 + 부대시설) 요율 — 매매 0.5%, 임대차 0.4% */
export const ZJ_FEE_OFFICETEL = {
  sale: 0.5,
  rent: 0.4,
} as const;

/** 기타 (오피스텔 대형, 상가/토지/단독주택 중 일부) 상한 — 0.9% 이내 협의 */
export const ZJ_FEE_OTHER_MAX_RATE_PCT = 0.9;
