/**
 * @file risk.ts
 * @description 위험도 평가 관련 타입 — Phase 3 안전 검증용
 * @module types/zipjikimi
 */

import type { ZjRiskLevel } from "./property";

/** 위험도 세부 점수 (각 0-100, 높을수록 위험) */
export interface ZjRiskBreakdown {
  price: number;
  building: number;
  registry: number;
  location: number;
  jeonseRatio: number;
}

/** 전체 위험도 평가 결과 */
export interface ZjRiskAssessment {
  propertyId: string;
  totalScore: number;
  level: ZjRiskLevel;
  summary: string;
  breakdown: ZjRiskBreakdown;
  details: Record<string, unknown>;
  assessedAt: string;
}
