/**
 * @file api/address/route.ts
 * @description 주소 → 법정동 코드 + 좌표 + 지번 변환 (카카오 로컬 API 래퍼)
 * @api GET /api/address?q=서울 종로구 세종대로 175
 * @module app/(zipjikimi)/api/address
 */

import { NextResponse } from "next/server";
import { resolveAddress } from "@/lib/zipjikimi/utils/address";
import type { ZjAddressResolved } from "@/lib/zipjikimi/utils/address";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

export async function GET(
  req: Request,
): Promise<NextResponse<ZjApiResponse<ZjAddressResolved>>> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { success: false, error: "q 파라미터(주소)가 필요합니다.", code: "MISSING_QUERY" },
      { status: 400 },
    );
  }

  try {
    const data = await resolveAddress(q);
    return NextResponse.json({
      success: true,
      data,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // 404 대신 200 + success:false 로 반환 → 브라우저 콘솔 에러 로그 방지
    // 실제 에러는 클라이언트에서 toast로 표시
    return NextResponse.json({
      success: false,
      error: message,
      code: "RESOLVE_FAILED",
    });
  }
}
