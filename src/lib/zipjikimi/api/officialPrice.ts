/**
 * @file officialPrice.ts
 * @description F07 — 공동주택 공시가격 조회 (국토부 공공데이터포털)
 * @api 공공데이터포털 — 공동주택 공시가격 API
 * @see https://www.data.go.kr/dataset/3050651/openapi.do
 * @module lib/zipjikimi/api
 *
 * @note ⚠️ 공시가격 API는 "단지코드 (kaptCode)" 기반으로 조회하는 구조라
 *       단일 물건의 공시가격을 바로 가져오려면 단지코드를 먼저 매핑해야 함.
 *       현재는 스켈레톤만 제공 — 추후 단지코드 매칭 로직 포함 시 확장.
 */

import { fetchDataGoKrXml } from "./dataGoKr";

export interface ZjOfficialPriceRecord {
  /** 단지코드 */
  kaptCode: string;
  /** 단지명 */
  kaptName?: string;
  /** 공시기준일 (YYYYMMDD) */
  priceDate?: string;
  /** 공시가격 (원) */
  priceWon?: number;
  /** 전용면적 (㎡) */
  areaM2?: number;
  raw?: Record<string, unknown>;
}

/**
 * 단지코드 + 년도로 공시가격 조회.
 * @note 단지코드 매칭은 별도 API 필요 (AptListService3 등) — 현재는 미구현
 */
export async function fetchOfficialPriceByKaptCode(
  _kaptCode: string,
  _year: number,
): Promise<ZjOfficialPriceRecord[]> {
  // TODO(F07): 공시가격 API 엔드포인트 연동
  //   - 공동주택 공시가격: /1611000/AptListService3/getLttotPblancDetail or 유사
  //   - 단독주택 공시가격: 별도 엔드포인트
  //   - 단지코드 매칭: 국토부 아파트 단지코드 API 선행 호출 필요
  //
  //   현재는 스켈레톤 — UI에서는 "데모 데이터" 문구와 함께 표시
  void fetchDataGoKrXml; // unused import silencer — 실제 연동 시 활성화
  return [];
}
