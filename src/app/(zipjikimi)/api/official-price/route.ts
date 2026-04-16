/**
 * @file api/official-price/route.ts
 * @description F07 공시가격 조회 Route — 현재는 단지코드 매칭 미구현 상태
 * @api GET /api/official-price?address=...&year=2026
 * @module app/(zipjikimi)/api/official-price
 *
 * @note 공시가격 API는 단지코드 기반이라 주소→단지코드 매핑이 필요함.
 *       Phase 1 에선 미구현 안내만 반환, 추후 단지코드 DB/API 추가 시 확장.
 */

import { NextResponse } from "next/server";
import type { ZjApiResponse } from "@/types/zipjikimi/api";
import type { ZjOfficialPriceRecord } from "@/lib/zipjikimi/api/officialPrice";

export async function GET(): Promise<
  NextResponse<ZjApiResponse<ZjOfficialPriceRecord[]>>
> {
  return NextResponse.json(
    {
      success: false,
      error:
        "공시가격 조회는 단지코드 매칭 작업이 남아있어 아직 연동되지 않았습니다. (F07 추후 구현)",
      code: "NOT_IMPLEMENTED",
    },
    { status: 501 },
  );
}
