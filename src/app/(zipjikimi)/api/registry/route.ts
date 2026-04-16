/**
 * @file api/registry/route.ts
 * @description F14 등기부등본 Route — 에이픽 키 없으면 게이팅
 * @api GET /api/registry?address=서울 ...
 * @module app/(zipjikimi)/api/registry
 */

import { NextResponse } from "next/server";
import {
  hasApickKey,
  fetchRegistryAnalysis,
} from "@/lib/zipjikimi/api/registry";
import type { ZjRegistryAnalysis } from "@/types/zipjikimi/registry";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

export async function GET(
  req: Request,
): Promise<NextResponse<ZjApiResponse<ZjRegistryAnalysis>>> {
  const url = new URL(req.url);
  const address = url.searchParams.get("address")?.trim();

  if (!address) {
    return NextResponse.json({
      success: false,
      error: "address 파라미터가 필요합니다.",
      code: "MISSING_ADDRESS",
    });
  }

  if (!hasApickKey()) {
    return NextResponse.json({
      success: false,
      error: "등기부등본 조회는 에이픽(Apick) API 키가 필요합니다. Phase 3 실사용 시점에 .env.local에 ZJ_APICK_API_KEY를 추가하세요.",
      code: "APICK_KEY_MISSING",
    });
  }

  try {
    const data = await fetchRegistryAnalysis(address);
    return NextResponse.json({
      success: true,
      data,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      error: message,
      code: "FETCH_FAILED",
    });
  }
}
