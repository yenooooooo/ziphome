"use client";

/**
 * @file ZjServiceWorkerRegister.tsx
 * @description 앱 마운트 시 Service Worker 등록 — root layout에 삽입
 * @module components/zipjikimi/layout
 */

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/zipjikimi/pwa/registerServiceWorker";

export default function ZjServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
