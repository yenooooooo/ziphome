/**
 * @file (zipjikimi)/layout.tsx
 * @description 집지킴이 route group 공용 레이아웃
 *   - PC (md 이상): 좌측 사이드바 + 콘텐츠
 *   - 모바일 (md 미만): 상단 헤더(옵션) + 콘텐츠 + 하단 탭바
 *   - Safe Area: 하단 탭바에 자동 반영
 * @module app/(zipjikimi)
 */

import ZjSideNav from "@/components/zipjikimi/layout/ZjSideNav";
import ZjBottomTabBar from "@/components/zipjikimi/layout/ZjBottomTabBar";
import ZjServiceWorkerRegister from "@/components/zipjikimi/layout/ZjServiceWorkerRegister";
import ZjScrollToTop from "@/components/zipjikimi/layout/ZjScrollToTop";

export default function ZipjikimiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      <ZjSideNav />
      <main
        className="
          flex-1 flex flex-col
          pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0
        "
      >
        {children}
      </main>
      <ZjBottomTabBar />
      <ZjScrollToTop />
      <ZjServiceWorkerRegister />
    </div>
  );
}
