/**
 * @file transactionSummary.ts
 * @description 실거래 레코드 배열 → 평균/최대/최소 요약 통계
 * @module lib/zipjikimi/analysis
 */

import type {
  ZjTransactionRecord,
  ZjTransactionSummary,
} from "@/types/zipjikimi/transaction";

/**
 * 실거래 레코드를 요약 통계로 변환.
 * 매매는 salePrice 기준, 전월세는 deposit 기준으로 평균/최대/최소 산출.
 */
export function summarize(records: ZjTransactionRecord[]): ZjTransactionSummary {
  const prices = records.map((r) => r.salePrice).filter((n): n is number => !!n);
  const deposits = records.map((r) => r.deposit).filter((n): n is number => !!n);

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : undefined;

  return {
    count: records.length,
    avgPrice: avg(prices),
    maxPrice: prices.length ? Math.max(...prices) : undefined,
    minPrice: prices.length ? Math.min(...prices) : undefined,
    avgDeposit: avg(deposits),
    records,
  };
}
