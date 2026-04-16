/**
 * @file api/land-use/route.ts
 * @description F11 용도지역 조회 Route — PNU 기반
 * @api GET /api/land-use?pnu=11110101001001 or ?address=서울 종로구 ...
 * @module app/(zipjikimi)/api/land-use
 */

import { NextResponse } from "next/server";
import { fetchLandUse, buildPnu, hasVworldKey } from "@/lib/zipjikimi/api/landUse";
import { resolveAddress } from "@/lib/zipjikimi/utils/address";
import type { ZjLandUseSummary } from "@/types/zipjikimi/landUse";
import type { ZjApiResponse } from "@/types/zipjikimi/api";


export async function GET(
  req: Request,
): Promise<NextResponse<ZjApiResponse<ZjLandUseSummary>>> {
  const url = new URL(req.url);
  let pnu = url.searchParams.get("pnu")?.trim();
  const address = url.searchParams.get("address")?.trim();

  if (!pnu && address) {
    try {
      const resolved = await resolveAddress(address);
      pnu = buildPnu(
        resolved.bCode,
        resolved.platGbCd ?? "0",
        resolved.bun ?? "0000",
        resolved.ji ?? "0000",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { success: false, error: message, code: "ADDRESS_RESOLVE_FAILED" },
        { status: 400 },
      );
    }
  }

  if (!pnu || pnu.length !== 19) {
    return NextResponse.json(
      { success: false, error: "pnu(19자리)가 필요합니다.", code: "INVALID_PNU" },
      { status: 400 },
    );
  }

  // VWorld 키 없으면 graceful 응답
  if (!hasVworldKey()) {
    return NextResponse.json({
      success: false,
      error:
        "용도지역 조회는 VWorld 무료 인증키가 필요합니다. (.env.local 에 ZJ_VWORLD_API_KEY 추가)",
      code: "VWORLD_KEY_MISSING",
    });
  }

  try {
    const data = await fetchLandUse({ pnu });
    return NextResponse.json({
      success: true,
      data,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ZJ] /api/land-use 실패:", message);
    // 502 대신 200 + success:false — 브라우저 콘솔 에러 최소화
    return NextResponse.json({
      success: false,
      error: message,
      code: "FETCH_FAILED",
    });
  }
}
// buildPnu re-export (기존 import 호환)
export { buildPnu };
