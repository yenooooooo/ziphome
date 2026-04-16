/**
 * @file map.ts
 * @description 지도/좌표/주변시설 타입 (F08~F09)
 * @module types/zipjikimi
 */

/** 경위도 좌표 */
export interface ZjLatLng {
  latitude: number;
  longitude: number;
}

/** 지도 마커 (공용) */
export interface ZjMapMarker extends ZjLatLng {
  id?: string;
  title?: string;
  /** 마커 색상 — primary / safe / caution / danger */
  variant?: "primary" | "safe" | "caution" | "danger";
}

/** 주변 편의시설 카테고리 */
export type ZjFacilityCategory =
  | "subway" // 지하철역
  | "bus" // 버스정류장
  | "convenience" // 편의점
  | "mart" // 대형마트
  | "hospital" // 병원
  | "school" // 학교
  | "cafe" // 카페
  | "pharmacy"; // 약국

/** 카카오 로컬 카테고리 검색 결과 */
export interface ZjFacility extends ZjLatLng {
  id: string;
  name: string;
  category: ZjFacilityCategory;
  /** 중심 좌표로부터 거리 (미터) */
  distanceM: number;
  /** 전화번호 */
  phone?: string;
  /** 도로명 주소 */
  roadAddress?: string;
  /** 지번 주소 */
  address?: string;
  /** 카카오 상세 페이지 URL */
  placeUrl?: string;
}

/** 카테고리별 요약 (개수 + 가장 가까운 거리) */
export interface ZjFacilitySummary {
  category: ZjFacilityCategory;
  count: number;
  nearestDistanceM?: number;
  nearestName?: string;
}
