/**
 * @file registry.ts
 * @description 등기부등본 관련 타입 (F14)
 * @module types/zipjikimi
 */

/** 등기부등본 위험 요소 */
export interface ZjRegistryWarning {
  type: "mortgage" | "seizure" | "provisionalSeizure" | "provisionalRegistration" | "frequentTransfer" | "jeonseRight";
  label: string;
  severity: "info" | "warning" | "danger";
  detail: string;
}

/** 등기부등본 분석 결과 */
export interface ZjRegistryAnalysis {
  /** 소유자명 */
  ownerName?: string;
  /** 소유자 일치 여부 (임대인과 대조) */
  ownerMatch?: boolean | null;
  /** 근저당 총액 (만원) */
  mortgageTotal?: number;
  /** 근저당 상세 */
  mortgageDetails?: Array<{
    creditor: string;
    amount: number;
    date?: string;
  }>;
  /** 압류 존재 */
  seizureExists: boolean;
  /** 가압류 존재 */
  provisionalSeizure: boolean;
  /** 가등기 존재 */
  provisionalRegistration: boolean;
  /** 전세권 설정 */
  jeonseRightExists: boolean;
  /** 소유권 이전 횟수 (최근 5년) */
  ownershipChanges?: number;
  /** 등기부 위험 등급 */
  riskLevel: "안전" | "주의" | "위험" | "매우위험";
  /** 위험 요소 목록 */
  warnings: ZjRegistryWarning[];
  /** API 비용 (원) */
  apiCost?: number;
}
