/**
 * @file landUse.ts
 * @description 토지이용규제 (용도지역) 타입 (F11)
 * @module types/zipjikimi
 */

/** 용도지역 분류 */
export type ZjLandZoneCategory =
  | "주거"
  | "상업"
  | "공업"
  | "녹지"
  | "관리"
  | "농림"
  | "자연환경보전"
  | "기타";

/** 용도지역 레코드 */
export interface ZjLandUseRecord {
  /** 용도지역명 (예: "제2종일반주거지역") */
  zoneName: string;
  /** 대분류 */
  category: ZjLandZoneCategory;
  /** 지구 (예: "경관지구") */
  districtName?: string;
  /** 구역 */
  areaName?: string;
  /** 저촉 여부 (지구/구역이 지정되어 있는지) */
  overlaps?: boolean;
  raw?: Record<string, unknown>;
}

/** F11 요약 응답 */
export interface ZjLandUseSummary {
  /** 주된 용도지역 (첫 번째) */
  primary?: ZjLandUseRecord;
  /** 모든 레코드 */
  records: ZjLandUseRecord[];
  /** PNU (19자리) */
  pnu?: string;
}
