/**
 * @file property.ts
 * @description 집지킴이 부동산 물건 타입 — Supabase zj_properties 테이블과 매핑
 * @module types/zipjikimi
 */

/** 거래 유형 */
export type ZjTransactionType = "매매" | "전세" | "월세";

/** 물건 상태 */
export type ZjPropertyStatus = "검토중" | "계약진행" | "계약완료" | "취소";

/** 위험도 등급 (CLAUDE.md 7.1 색상과 매핑) */
export type ZjRiskLevel = "안전" | "주의" | "위험" | "매우위험";

/** 보증금 적정성 등급 */
export type ZjPriceAdequacy = "적정" | "다소높음" | "위험" | "저평가의심";

/**
 * 관심 물건 (zj_properties 테이블)
 * @see DATABASE.sql — 1. 관심 물건
 */
export interface ZjProperty {
  id: string;
  address: string;
  addressDetail?: string | null;
  addressJibun?: string | null;
  /** 법정동 코드 (앞 5자리 = 시군구 코드, 실거래가 API용) */
  regionCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  transactionType: ZjTransactionType;
  /** 금액 단위: 만원 */
  deposit?: number | null;
  monthlyRent?: number | null;
  salePrice?: number | null;
  buildingName?: string | null;
  buildingUse?: string | null;
  buildingStructure?: string | null;
  totalFloors?: number | null;
  targetFloor?: number | null;
  areaM2?: number | null;
  builtYear?: number | null;
  riskLevel?: ZjRiskLevel | null;
  riskScore?: number | null;
  priceAdequacy?: ZjPriceAdequacy | null;
  /** 전세가율 = 전세보증금 / 매매가 (깡통전세 위험 지표) */
  jeonseRatio?: number | null;
  memo?: string | null;
  status: ZjPropertyStatus;
  createdAt: string;
  updatedAt: string;
}
