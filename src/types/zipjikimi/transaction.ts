/**
 * @file transaction.ts
 * @description 실거래가 관련 타입 (F01)
 * @module types/zipjikimi
 */

/** 부동산 유형 */
export type ZjPropertyType = "아파트" | "오피스텔" | "연립다세대" | "단독다가구";

/** 매매/전세/월세 (국토부 API는 매매와 전월세 엔드포인트가 분리됨) */
export type ZjDealCategory = "매매" | "전월세";

/**
 * 정규화된 실거래 레코드 — 모든 부동산 유형/거래유형을 이 구조로 통일
 *   금액 단위: 만원
 */
export interface ZjTransactionRecord {
  propertyType: ZjPropertyType;
  dealCategory: ZjDealCategory;
  /** 계약 유형 (전월세 API에서만 — "전세" | "월세") */
  rentType?: "전세" | "월세";
  dealYear: number;
  dealMonth: number;
  dealDay?: number;
  /** 매매가 (매매만) */
  salePrice?: number;
  /** 보증금 (전월세) */
  deposit?: number;
  /** 월세 (월세 계약 시) */
  monthlyRent?: number;
  areaM2?: number;
  floor?: number;
  builtYear?: number;
  buildingName?: string;
  /** 법정동 이름 (예: "평동") */
  dong?: string;
  /** 지번 */
  jibun?: string;
  /** 법정동 코드 5자리 (시군구) */
  regionCode: string;
  /** 계약 유형 구분 — "신규" | "갱신" (v2 API) */
  contractType?: string;
}

/** F01 API Route 쿼리 파라미터 */
export interface ZjTransactionQuery {
  regionCode: string;       // 법정동 5자리
  months?: number;          // 최근 N개월 (기본 6)
  propertyType?: ZjPropertyType;
  dealCategory?: ZjDealCategory;
}

/** F01 응답: 분석용 요약 + 원시 레코드 */
export interface ZjTransactionSummary {
  count: number;
  avgPrice?: number;        // 매매 평균 (만원)
  maxPrice?: number;
  minPrice?: number;
  avgDeposit?: number;      // 전월세 보증금 평균
  records: ZjTransactionRecord[];
}
