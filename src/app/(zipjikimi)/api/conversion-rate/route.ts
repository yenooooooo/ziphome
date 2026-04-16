/**
 * @file api/conversion-rate/route.ts
 * @description F04 지원 — 한국은행 최신 기준금리 + 2% 가산율 기반 전환율 제공
 * @api GET /api/conversion-rate
 * @module app/(zipjikimi)/api/conversion-rate
 */

import { NextResponse } from "next/server";
import { fetchLatestBaseRate } from "@/lib/zipjikimi/api/ecos";
import {
  computeConversionRate,
  ZJ_CONVERSION_SURCHARGE,
} from "@/lib/zipjikimi/calc/conversionRate";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

interface ZjConversionRateResponse {
  baseRatePct: number;
  surchargePct: number;
  conversionRate: number;
  effectiveDate: string;
}

export async function GET(): Promise<
  NextResponse<ZjApiResponse<ZjConversionRateResponse>>
> {
  try {
    const base = await fetchLatestBaseRate();
    const surchargePct = ZJ_CONVERSION_SURCHARGE * 100;
    return NextResponse.json({
      success: true,
      data: {
        baseRatePct: base.rate,
        surchargePct,
        conversionRate: computeConversionRate(base.rate, surchargePct),
        effectiveDate: base.effectiveDate,
      },
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message, code: "FETCH_FAILED" },
      { status: 502 },
    );
  }
}
