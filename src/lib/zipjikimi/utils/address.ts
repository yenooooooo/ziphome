/**
 * @file address.ts
 * @description 주소 ↔ 좌표/법정동 변환 — 카카오 로컬 API 사용
 * @api 카카오 로컬 API — 주소 검색
 * @see https://developers.kakao.com/docs/latest/ko/local/dev-guide#address-coord
 * @module lib/zipjikimi/utils
 *
 * @note 실거래가 API에 필요한 "법정동 코드 5자리"는 카카오 응답의
 *       address.b_code 앞 5자리(= 시군구 코드). 카카오는 10자리 코드를 주지만
 *       data.go.kr 실거래가 API는 앞 5자리만 사용.
 */

const KAKAO_LOCAL_ADDRESS_URL =
  "https://dapi.kakao.com/v2/local/search/address.json";

export interface ZjAddressResolved {
  /** 입력 원문 */
  query: string;
  /** 지번 주소 */
  addressJibun?: string;
  /** 도로명 주소 */
  addressRoad?: string;
  /** 법정동 코드 10자리 (카카오 원본) */
  bCode: string;
  /** 법정동 코드 앞 5자리 (시군구) — 실거래가/건축물대장 LAWD_CD */
  regionCode: string;
  /** 법정동 코드 뒤 5자리 — 건축물대장 bjdongCd */
  bjdongCode: string;
  /** 시도 (예: "서울") */
  sido?: string;
  /** 시군구 (예: "종로구") */
  sigungu?: string;
  /** 법정동 명 */
  bname?: string;
  /** 지번 본번 (건축물대장 bun) */
  bun?: string;
  /** 지번 부번 (건축물대장 ji) */
  ji?: string;
  /** 대지 구분: "0"=대지 "1"=산 */
  platGbCd?: string;
  latitude: number;
  longitude: number;
}

/**
 * 주소 → 좌표 + 법정동 코드 변환.
 * @param address 지번 또는 도로명 주소
 * @returns 해결된 주소 정보 (첫 번째 매칭)
 * @throws 환경변수 미설정 또는 카카오 API 오류 시
 */
export async function resolveAddress(address: string): Promise<ZjAddressResolved> {
  const key = process.env.ZJ_KAKAO_REST_KEY;
  if (!key) {
    throw new Error(
      "[ZJ] ZJ_KAKAO_REST_KEY 환경변수가 설정되지 않았습니다.",
    );
  }

  const url = `${KAKAO_LOCAL_ADDRESS_URL}?query=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${key}`,
      // 카카오 REST 호출 시 필수 — os/origin 정보 없으면 AccessDeniedError
      KA: "os/node lang/ko-KR origin/http://localhost",
    },
    // 서버 측 캐싱 (Next.js): 24시간
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    // "지도/로컬" 서비스 비활성 / 키 권한 부족 등 상세 메시지 추출
    let detail = "";
    try {
      const parsed = JSON.parse(bodyText) as { message?: string; errorType?: string };
      if (parsed.message) detail = `${parsed.errorType ?? ""} ${parsed.message}`.trim();
    } catch {
      detail = bodyText.slice(0, 200);
    }
    throw new Error(
      `[ZJ] 카카오 로컬 API 오류 (${res.status}): ${detail || res.statusText}`,
    );
  }

  const json = (await res.json()) as {
    documents?: Array<{
      address_name?: string;
      road_address?: { address_name?: string } | null;
      address?: {
        address_name?: string;
        b_code?: string;
        region_1depth_name?: string;
        region_2depth_name?: string;
        region_3depth_name?: string;
        main_address_no?: string;
        sub_address_no?: string;
        mountain_yn?: string;
      } | null;
      x?: string;
      y?: string;
    }>;
  };

  const doc = json.documents?.[0];
  if (!doc || !doc.address?.b_code) {
    throw new Error(`[ZJ] 주소를 찾을 수 없습니다: "${address}"`);
  }

  const bCode = doc.address.b_code;

  return {
    query: address,
    addressJibun: doc.address.address_name,
    addressRoad: doc.road_address?.address_name,
    bCode,
    regionCode: bCode.slice(0, 5),
    bjdongCode: bCode.slice(5, 10),
    sido: doc.address.region_1depth_name,
    sigungu: doc.address.region_2depth_name,
    bname: doc.address.region_3depth_name,
    bun: doc.address.main_address_no?.padStart(4, "0"),
    ji: doc.address.sub_address_no?.padStart(4, "0"),
    platGbCd: doc.address.mountain_yn === "Y" ? "1" : "0",
    latitude: doc.y ? Number(doc.y) : 0,
    longitude: doc.x ? Number(doc.x) : 0,
  };
}
