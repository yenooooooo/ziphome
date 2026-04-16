/**
 * @file kakaoLoader.ts
 * @description 카카오맵 JavaScript SDK 동적 로더 (Promise 기반, 중복 로드 방지)
 * @module lib/zipjikimi/map
 *
 * @note NEXT_PUBLIC_ZJ_KAKAO_MAP_KEY 사용 (도메인 제한 필수).
 *       autoload=false + kakao.maps.load(cb) 패턴으로 안전하게 초기화.
 */

let loadPromise: Promise<void> | null = null;

/**
 * 카카오 SDK 로드 & kakao.maps 준비 완료 시 resolve.
 * @param libraries services / clusterer 등 추가 라이브러리
 */
export function loadKakaoMap(libraries: string[] = ["services"]): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao SDK는 브라우저 환경에서만 로드 가능합니다."));
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const key = process.env.NEXT_PUBLIC_ZJ_KAKAO_MAP_KEY;
    if (!key) {
      reject(new Error("NEXT_PUBLIC_ZJ_KAKAO_MAP_KEY 환경변수가 없습니다."));
      return;
    }

    // 이미 로드되어 있으면 즉시 load 콜백 호출
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => resolve());
      return;
    }

    // script 태그 주입
    const libsQs = libraries.length > 0 ? `&libraries=${libraries.join(",")}` : "";
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false${libsQs}`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao || !window.kakao.maps) {
        reject(new Error("카카오 SDK 초기화 실패"));
        return;
      }
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => reject(new Error("카카오 SDK 스크립트 로드 실패"));
    document.head.appendChild(script);
  });

  return loadPromise;
}
