/**
 * @file registry.ts
 * @description F14 — 등기부등본 열람 (에이픽 Apick API)
 * @api https://apick.app/dev_guide/iros1
 * @module lib/zipjikimi/api
 *
 * @note ⚠️ 유료 API (건당 900원). ZJ_APICK_API_KEY 없으면 호출하지 않고
 *          토스트로 안내. 개발 중에는 mock 데이터 사용.
 */

import type { ZjRegistryAnalysis } from "@/types/zipjikimi/registry";

/** 에이픽 키 존재 여부 */
export function hasApickKey(): boolean {
  return !!process.env.ZJ_APICK_API_KEY;
}

/**
 * 등기부등본 분석용 mock 데이터 — 실제 연동 전 UI 테스트용.
 */
export function getMockRegistryAnalysis(): ZjRegistryAnalysis {
  return {
    ownerName: "홍길동",
    ownerMatch: null,
    mortgageTotal: 15000,
    mortgageDetails: [
      { creditor: "○○은행", amount: 15000, date: "2023.03.15" },
    ],
    seizureExists: false,
    provisionalSeizure: false,
    provisionalRegistration: false,
    jeonseRightExists: false,
    ownershipChanges: 1,
    riskLevel: "주의",
    warnings: [
      {
        type: "mortgage",
        label: "근저당 설정",
        severity: "warning",
        detail: "○○은행 근저당 1.5억 설정 — 선순위 채권으로 보증금 회수 영향 가능",
      },
    ],
    apiCost: 900,
  };
}

/**
 * 등기부등본 열람 + 분석.
 * @note 현재는 에이픽 API 연동 스텁 — 키 있을 때만 실제 호출 예정.
 */
export async function fetchRegistryAnalysis(
  _address: string,
): Promise<ZjRegistryAnalysis> {
  const key = process.env.ZJ_APICK_API_KEY;
  if (!key) {
    throw new Error("APICK_KEY_MISSING");
  }

  // TODO: 에이픽 API 실제 연동
  //   1. 주소 → 부동산고유번호 조회 (에이픽 iros1)
  //   2. 부동산고유번호 → 등기부등본 열람 (에이픽 iros2)
  //   3. 응답 파싱 → ZjRegistryAnalysis 변환
  //   4. 위험 요소 자동 분석 (근저당+보증금 > 매매가 80% 등)

  // 현재: mock 반환
  return getMockRegistryAnalysis();
}
