/**
 * @file date.ts
 * @description 실거래가 API용 년월 계산 유틸 (YYYYMM 포맷)
 * @module lib/zipjikimi/utils
 */

/** Date → "YYYYMM" 문자열 */
export function toYearMonth(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}${m}`;
}

/** 현재 기준 최근 N개월 YYYYMM 배열 (오래된 순) */
export function recentMonths(count: number): string[] {
  const now = new Date();
  const arr: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push(toYearMonth(d));
  }
  return arr;
}

/** "YYYYMM" → Date (해당 월 1일) */
export function fromYearMonth(ym: string): Date {
  const y = Number(ym.slice(0, 4));
  const m = Number(ym.slice(4, 6));
  return new Date(y, m - 1, 1);
}
