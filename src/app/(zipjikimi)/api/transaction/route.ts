/**
 * @file api/transaction/route.ts
 * @description F01 실거래가 조회 Route — 국토부 API + Supabase 캐시(24h)
 * @api GET /api/transaction?region=11110&months=6&type=아파트&category=매매
 * @module app/(zipjikimi)/api/transaction
 *
 * 쿼리 파라미터:
 *   region      법정동 5자리 (필수)
 *   months      최근 N개월 (기본 6)
 *   type        부동산 유형 (기본 "아파트")
 *   category    거래 종류 (기본 "매매")
 */

import { NextResponse } from "next/server";
import { fetchTransactionsMulti } from "@/lib/zipjikimi/api/transaction";
import { summarize } from "@/lib/zipjikimi/analysis/transactionSummary";
import { recentMonths } from "@/lib/zipjikimi/utils/date";
import { getCached, setCached } from "@/lib/zipjikimi/utils/cache";
import type {
  ZjPropertyType,
  ZjDealCategory,
  ZjTransactionSummary,
} from "@/types/zipjikimi/transaction";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

const VALID_TYPES: ZjPropertyType[] = [
  "아파트",
  "오피스텔",
  "연립다세대",
  "단독다가구",
];
const VALID_CATEGORIES: ZjDealCategory[] = ["매매", "전월세"];

export async function GET(req: Request): Promise<NextResponse<ZjApiResponse<ZjTransactionSummary>>> {
  const url = new URL(req.url);
  const region = url.searchParams.get("region")?.trim();
  const monthsParam = url.searchParams.get("months");
  const typeParam = (url.searchParams.get("type") as ZjPropertyType) || "아파트";
  const categoryParam =
    (url.searchParams.get("category") as ZjDealCategory) || "매매";

  if (!region || !/^\d{5}$/.test(region)) {
    return NextResponse.json(
      {
        success: false,
        error: "region 파라미터는 법정동 코드 5자리여야 합니다.",
        code: "INVALID_REGION",
      },
      { status: 400 },
    );
  }
  if (!VALID_TYPES.includes(typeParam)) {
    return NextResponse.json(
      { success: false, error: `type 파라미터가 유효하지 않습니다.`, code: "INVALID_TYPE" },
      { status: 400 },
    );
  }
  if (!VALID_CATEGORIES.includes(categoryParam)) {
    return NextResponse.json(
      { success: false, error: `category 파라미터가 유효하지 않습니다.`, code: "INVALID_CATEGORY" },
      { status: 400 },
    );
  }

  const months = Math.min(Math.max(Number(monthsParam) || 6, 1), 24);
  const yearMonths = recentMonths(months);

  // 캐시 키: region + 최근 months YYYYMM 범위의 첫 달 + 마지막 달 + type + category
  const cacheKey = {
    region_code: region,
    year_month: `${yearMonths[0]}-${yearMonths[yearMonths.length - 1]}:${typeParam}:${categoryParam}`,
    transaction_type: `${typeParam}-${categoryParam}`,
  };

  // ---- 1) 캐시 조회 ----
  const cached = await getCached<ZjTransactionSummary>("zj_transaction_cache", cacheKey);
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  }

  // ---- 2) 원본 API 호출 ----
  try {
    const records = await fetchTransactionsMulti(region, yearMonths, typeParam, categoryParam);
    const summary = summarize(records);

    // ---- 3) 캐시 저장 (TTL 24h 테이블 DEFAULT) ----
    await setCached("zj_transaction_cache", {
      ...cacheKey,
      response_data: summary,
      record_count: summary.count,
    });

    return NextResponse.json({
      success: true,
      data: summary,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ZJ] /api/transaction 실패:", message);
    return NextResponse.json(
      {
        success: false,
        error: `실거래가 조회에 실패했습니다: ${message}`,
        code: "FETCH_FAILED",
      },
      { status: 502 },
    );
  }
}
