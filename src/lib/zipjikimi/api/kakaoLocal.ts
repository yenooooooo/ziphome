/**
 * @file kakaoLocal.ts
 * @description 카카오 로컬 API (카테고리 검색) — F09 주변 편의시설
 * @api https://dapi.kakao.com/v2/local/search/category.json
 * @see https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-category
 * @module lib/zipjikimi/api
 *
 * @note 카카오 카테고리 그룹 코드:
 *   SW8 지하철역 / BK9 은행 / PS3 유치원 / SC4 학교 / AC5 학원 / PK6 주차장
 *   OL7 주유소·충전소 / SW8 지하철역 / BK9 은행 / CS2 편의점 / MT1 대형마트
 *   HP8 병원 / PM9 약국 / CE7 카페 / CT1 문화시설 / AT4 관광명소 / FD6 음식점
 */

import type { ZjFacility, ZjFacilityCategory } from "@/types/zipjikimi/map";

const BASE = "https://dapi.kakao.com/v2/local/search/category.json";

/** 우리 카테고리 → 카카오 그룹 코드 매핑 */
const CATEGORY_CODE: Record<ZjFacilityCategory, string> = {
  subway: "SW8",
  bus: "", // 버스정류장은 별도 API (공공데이터 버스정류소 마스터) — 미구현 시 빈 문자열
  convenience: "CS2",
  mart: "MT1",
  hospital: "HP8",
  school: "SC4",
  cafe: "CE7",
  pharmacy: "PM9",
};

export interface ZjKakaoCategorySearchOptions {
  /** 중심 좌표 */
  latitude: number;
  longitude: number;
  /** 반경 (m), 기본 1000 (최대 20000) */
  radiusM?: number;
  /** 페이지 크기 (1-15, 기본 15) */
  size?: number;
}

/**
 * 특정 카테고리 시설을 반경 내에서 조회.
 */
export async function fetchNearbyByCategory(
  category: ZjFacilityCategory,
  opts: ZjKakaoCategorySearchOptions,
): Promise<ZjFacility[]> {
  const code = CATEGORY_CODE[category];
  if (!code) return []; // 미지원 카테고리

  const key = process.env.ZJ_KAKAO_REST_KEY;
  if (!key) throw new Error("[ZJ] ZJ_KAKAO_REST_KEY 환경변수가 없습니다.");

  const radius = Math.min(Math.max(opts.radiusM ?? 1000, 10), 20000);
  const size = Math.min(Math.max(opts.size ?? 15, 1), 15);

  const params = new URLSearchParams({
    category_group_code: code,
    x: String(opts.longitude),
    y: String(opts.latitude),
    radius: String(radius),
    sort: "distance",
    size: String(size),
  });

  const res = await fetch(`${BASE}?${params}`, {
    headers: {
      Authorization: `KakaoAK ${key}`,
      KA: "os/node lang/ko-KR origin/http://localhost",
    },
    next: { revalidate: 60 * 60 * 6 }, // 6h
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    let detail = "";
    try {
      const parsed = JSON.parse(bodyText) as { message?: string; errorType?: string };
      if (parsed.message) detail = `${parsed.errorType ?? ""} ${parsed.message}`.trim();
    } catch {
      detail = bodyText.slice(0, 200);
    }
    throw new Error(`[ZJ] 카카오 카테고리 검색 오류 (${res.status}): ${detail}`);
  }

  const json = (await res.json()) as {
    documents?: Array<{
      id?: string;
      place_name?: string;
      distance?: string;
      phone?: string;
      address_name?: string;
      road_address_name?: string;
      place_url?: string;
      x?: string;
      y?: string;
    }>;
  };

  return (json.documents ?? []).map((doc) => ({
    id: doc.id ?? "",
    name: doc.place_name ?? "",
    category,
    distanceM: Number(doc.distance ?? 0),
    phone: doc.phone || undefined,
    address: doc.address_name || undefined,
    roadAddress: doc.road_address_name || undefined,
    placeUrl: doc.place_url || undefined,
    latitude: doc.y ? Number(doc.y) : 0,
    longitude: doc.x ? Number(doc.x) : 0,
  }));
}

/**
 * 여러 카테고리를 병렬로 조회.
 */
export async function fetchNearbyFacilities(
  categories: ZjFacilityCategory[],
  opts: ZjKakaoCategorySearchOptions,
): Promise<Record<ZjFacilityCategory, ZjFacility[]>> {
  const results = await Promise.allSettled(
    categories.map((c) => fetchNearbyByCategory(c, opts)),
  );
  const out = {} as Record<ZjFacilityCategory, ZjFacility[]>;
  categories.forEach((c, i) => {
    const r = results[i];
    out[c] = r.status === "fulfilled" ? r.value : [];
    if (r.status === "rejected") {
      console.warn(`[ZJ] ${c} 카테고리 검색 실패:`, r.reason);
    }
  });
  return out;
}
