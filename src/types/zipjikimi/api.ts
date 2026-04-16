/**
 * @file api.ts
 * @description 집지킴이 API Routes 공통 응답 형식 (CLAUDE.md 4.7)
 * @module types/zipjikimi
 */

/** 성공 응답 */
export interface ZjApiSuccess<T> {
  success: true;
  data: T;
  cached: boolean;
  timestamp: string;
}

/** 실패 응답 */
export interface ZjApiError {
  success: false;
  error: string;
  code: string;
}

/** API Routes 에서 사용하는 통합 응답 타입 */
export type ZjApiResponse<T> = ZjApiSuccess<T> | ZjApiError;
