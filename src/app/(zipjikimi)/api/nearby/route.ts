/**
 * @file api/nearby/route.ts
 * @description F09 주변 편의시설 조회 Route — 카카오 로컬 카테고리 검색
 * @api GET /api/nearby?lat=37.5&lng=127.0&radius=1000&categories=subway,convenience,mart
 * @module app/(zipjikimi)/api/nearby
 */

import { NextResponse } from "next/server";
import { fetchNearbyFacilities } from "@/lib/zipjikimi/api/kakaoLocal";
import type {
  ZjFacility,
  ZjFacilityCategory,
  ZjFacilitySummary,
} from "@/types/zipjikimi/map";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

interface ZjNearbyResponse {
  summary: ZjFacilitySummary[];
  facilities: Record<string, ZjFacility[]>;
}

const DEFAULT_CATEGORIES: ZjFacilityCategory[] = [
  "subway",
  "convenience",
  "mart",
  "hospital",
  "school",
  "cafe",
  "pharmacy",
];

export async function GET(
  req: Request,
): Promise<NextResponse<ZjApiResponse<ZjNearbyResponse>>> {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const radius = Number(url.searchParams.get("radius") || "1000");
  const catsParam = url.searchParams.get("categories");
  const categories = catsParam
    ? (catsParam.split(",").filter(Boolean) as ZjFacilityCategory[])
    : DEFAULT_CATEGORIES;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { success: false, error: "lat/lng 파라미터가 필요합니다.", code: "INVALID_COORD" },
      { status: 400 },
    );
  }

  try {
    const facilities = await fetchNearbyFacilities(categories, {
      latitude: lat,
      longitude: lng,
      radiusM: radius,
    });

    const summary: ZjFacilitySummary[] = categories.map((c) => {
      const list = facilities[c];
      const nearest = list[0];
      return {
        category: c,
        count: list.length,
        nearestDistanceM: nearest?.distanceM,
        nearestName: nearest?.name,
      };
    });

    return NextResponse.json({
      success: true,
      data: { summary, facilities },
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ZJ] /api/nearby 실패:", message);
    return NextResponse.json(
      { success: false, error: message, code: "FETCH_FAILED" },
      { status: 502 },
    );
  }
}
