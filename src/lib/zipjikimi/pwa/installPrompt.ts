/**
 * @file installPrompt.ts
 * @description PWA 설치 유도 — Android/Chrome은 beforeinstallprompt 사용,
 *              iOS는 미지원이라 수동 안내(공유→홈화면추가) 필요
 * @module lib/zipjikimi/pwa
 */

/** beforeinstallprompt 이벤트 타입 (Chrome 확장) */
export interface ZjBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/** iOS Safari 판별 (PWA 설치 안내 모달 분기용) */
export function isIOSSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
  const webkit = /WebKit/.test(ua);
  const notChrome = !/CriOS/.test(ua);
  return iOS && webkit && notChrome;
}

/** 이미 PWA로 실행 중인지 (홈화면에서 실행됨) */
export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari는 navigator.standalone, 다른 브라우저는 display-mode: standalone
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error — iOS Safari 전용 프로퍼티
    window.navigator.standalone === true
  );
}
