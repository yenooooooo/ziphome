/**
 * @file sw.js
 * @description 집지킴이 Service Worker — 기본 캐싱 전략
 *   - 정적 자산: Cache First
 *   - HTML: Network First (fallback to cache)
 *   - API 응답: 각 route.ts에서 Supabase 캐시 테이블로 관리 (여기서는 X)
 *
 * ⚠️ PWA 실전 캐싱이 필요해지면 @serwist/next 등으로 교체 검토.
 *    현재는 installable + 오프라인 기본 동작만 목표.
 */

const CACHE_NAME = "zj-shell-v1";
const PRECACHE_URLS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  // 새 SW 즉시 활성화
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Next.js API/라우트는 SW가 건드리지 않음 (원본 네트워크 우선)
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    return;
  }

  // HTML → Network First
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // 기타 정적 자산 → Cache First (fetch 실패 시 graceful fallback)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          if (!res || res.status !== 200 || res.type !== "basic") return res;
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => new Response("", { status: 408 }));
    }),
  );
});
