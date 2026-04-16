/**
 * @file brokerageFee.ts
 * @description F06 — 중개수수료 법정 상한 계산기 (2026년 기준)
 * @module lib/zipjikimi/calc
 */

import {
  ZJ_FEE_SALE_RESIDENTIAL,
  ZJ_FEE_RENT_RESIDENTIAL,
  ZJ_FEE_OFFICETEL,
  ZJ_FEE_OTHER_MAX_RATE_PCT,
} from "@/constants/zipjikimi/brokerageFeeTable";

export type ZjFeePropertyCategory = "주거" | "오피스텔" | "기타";

export interface ZjFeeInput {
  /** 거래 유형 */
  dealType: "매매" | "전세" | "월세";
  /** 매매가 또는 보증금 (만원) */
  depositMan: number;
  /** 월세 (만원) — 월세 거래만 */
  monthlyRentMan?: number;
  /** 주거/오피스텔/기타 */
  propertyCategory?: ZjFeePropertyCategory;
}

export interface ZjFeeResult {
  /** 거래금액 (환산 보증금 기준, 만원) */
  baseAmountMan: number;
  /** 적용 요율 (%) */
  ratePct: number;
  /** 산정된 상한 수수료 (원) */
  maxFeeWon: number;
  /** 적용된 한도 (원) — null 이면 한도 없음 */
  cap: number | null;
  /** 참고 설명 */
  note: string;
}

/**
 * 월세 계약의 거래금액 = 보증금 + (월세 × 100).
 * 단, 환산액이 5천만원 미만이면 보증금 + (월세 × 70) 으로 재계산.
 */
export function computeBaseAmount(input: ZjFeeInput): number {
  if (input.dealType !== "월세") return input.depositMan;
  const monthly = input.monthlyRentMan ?? 0;
  const first = input.depositMan + monthly * 100;
  if (first >= 5_000) return first;
  return input.depositMan + monthly * 70;
}

/** 주거용 매매 요율 조회 */
function lookupSaleRate(amountMan: number) {
  return ZJ_FEE_SALE_RESIDENTIAL.find(
    (r) => amountMan >= r.min && amountMan < r.max,
  );
}

/** 주거용 임대차 요율 조회 */
function lookupRentRate(amountMan: number) {
  return ZJ_FEE_RENT_RESIDENTIAL.find(
    (r) => amountMan >= r.min && amountMan < r.max,
  );
}

/**
 * 중개수수료 법정 상한 계산.
 * @returns 거래금액/요율/상한/한도
 */
export function computeBrokerageFee(input: ZjFeeInput): ZjFeeResult {
  const baseMan = computeBaseAmount(input);
  const baseWon = baseMan * 10_000;
  const category = input.propertyCategory ?? "주거";

  // 오피스텔: 고정 요율
  if (category === "오피스텔") {
    const ratePct = input.dealType === "매매" ? ZJ_FEE_OFFICETEL.sale : ZJ_FEE_OFFICETEL.rent;
    return {
      baseAmountMan: baseMan,
      ratePct,
      maxFeeWon: Math.floor((baseWon * ratePct) / 100),
      cap: null,
      note: `오피스텔 ${input.dealType} 고정 요율 ${ratePct}%`,
    };
  }

  // 기타 (상가/토지/대형 오피스텔): 0.9% 이내 협의
  if (category === "기타") {
    return {
      baseAmountMan: baseMan,
      ratePct: ZJ_FEE_OTHER_MAX_RATE_PCT,
      maxFeeWon: Math.floor((baseWon * ZJ_FEE_OTHER_MAX_RATE_PCT) / 100),
      cap: null,
      note: `상가/토지 등 — 최대 ${ZJ_FEE_OTHER_MAX_RATE_PCT}% 이내 협의`,
    };
  }

  // 주거용
  const tier =
    input.dealType === "매매" ? lookupSaleRate(baseMan) : lookupRentRate(baseMan);

  if (!tier) {
    return {
      baseAmountMan: baseMan,
      ratePct: 0,
      maxFeeWon: 0,
      cap: null,
      note: "해당 구간을 찾을 수 없습니다.",
    };
  }

  const calculated = Math.floor((baseWon * tier.ratePct) / 100);
  const applied = tier.cap !== null ? Math.min(calculated, tier.cap) : calculated;

  return {
    baseAmountMan: baseMan,
    ratePct: tier.ratePct,
    maxFeeWon: applied,
    cap: tier.cap,
    note:
      tier.cap !== null
        ? `요율 ${tier.ratePct}% / 한도 ${tier.cap.toLocaleString()}원`
        : `요율 ${tier.ratePct}% (한도 없음)`,
  };
}
