/**
 * @file api/building/route.ts
 * @description F02 건축물대장 조회 Route — 국토부 API + Supabase 캐시(7d)
 * @api GET /api/building?sigungu=11110&bjdong=10100&bun=0001&ji=0068
 *      또는 GET /api/building?address=서울 종로구 세종대로 175 (자동 해석)
 * @module app/(zipjikimi)/api/building
 */

import { NextResponse } from "next/server";
import { fetchBuildingRegister } from "@/lib/zipjikimi/api/building";
import { resolveAddress } from "@/lib/zipjikimi/utils/address";
import { getCached, setCached } from "@/lib/zipjikimi/utils/cache";
import type { ZjBuildingRecord } from "@/types/zipjikimi/building";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

export async function GET(
  req: Request,
): Promise<NextResponse<ZjApiResponse<ZjBuildingRecord[]>>> {
  const url = new URL(req.url);
  const address = url.searchParams.get("address")?.trim();
  let sigungu = url.searchParams.get("sigungu")?.trim();
  let bjdong = url.searchParams.get("bjdong")?.trim();
  let bun = url.searchParams.get("bun")?.trim() || "0000";
  let ji = url.searchParams.get("ji")?.trim() || "0000";
  let platGb = url.searchParams.get("platGb")?.trim() || "0";

  // address 주어지면 카카오로 자동 해석
  if (address && (!sigungu || !bjdong)) {
    try {
      const resolved = await resolveAddress(address);
      sigungu = resolved.regionCode;
      bjdong = resolved.bjdongCode;
      bun = resolved.bun ?? bun;
      ji = resolved.ji ?? ji;
      platGb = resolved.platGbCd ?? platGb;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { success: false, error: message, code: "ADDRESS_RESOLVE_FAILED" },
        { status: 400 },
      );
    }
  }

  if (!sigungu || !/^\d{5}$/.test(sigungu) || !bjdong || !/^\d{5}$/.test(bjdong)) {
    return NextResponse.json(
      {
        success: false,
        error: "sigungu(5)·bjdong(5) 파라미터가 필요합니다. 또는 address 를 전달하세요.",
        code: "INVALID_PARAMS",
      },
      { status: 400 },
    );
  }

  const cacheKey = { address: `${sigungu}-${bjdong}-${bun}-${ji}-${platGb}` };

  const cached = await getCached<ZjBuildingRecord[]>("zj_building_cache", cacheKey);
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const records = await fetchBuildingRegister({
      sigunguCd: sigungu,
      bjdongCd: bjdong,
      bun,
      ji,
      platGbCd: platGb,
    });

    await setCached("zj_building_cache", {
      ...cacheKey,
      sigungu_code: sigungu,
      bjdong_code: bjdong,
      response_data: records,
    });

    return NextResponse.json({
      success: true,
      data: records,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ZJ] /api/building 실패:", message);
    return NextResponse.json(
      { success: false, error: message, code: "FETCH_FAILED" },
      { status: 502 },
    );
  }
}
