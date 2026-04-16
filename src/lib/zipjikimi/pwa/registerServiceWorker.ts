/**
 * @file registerServiceWorker.ts
 * @description Service Worker 등록 헬퍼 — production에서만 등록
 * @module lib/zipjikimi/pwa
 */

/**
 * 브라우저에서 /sw.js 를 등록한다.
 * @note 개발 환경에서는 등록하지 않음 (HMR 충돌 방지)
 */
export async function registerServiceWorker(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (process.env.NODE_ENV !== "production") return;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    // skipWaiting + clients.claim 패턴: 새 SW 설치되면 즉시 활성화
    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          // 새 버전 활성화됨 — 필요하면 여기서 toast 표시 후 window.location.reload()
          console.info("[ZJ] Service Worker 업데이트 완료");
        }
      });
    });
  } catch (error) {
    console.error("[ZJ] Service Worker 등록 실패:", error);
  }
}
