/**
 * @file dashboard/page.tsx
 * @description 물건 관리 대시보드 — Phase 5 (F26) 에서 본격 구현
 * @module app/(zipjikimi)/dashboard
 */

import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function ZjDashboardPage() {
  return (
    <>
      <ZjMobileHeader title="물건 관리" />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-4 md:pt-8 pb-10 space-y-6">
        <div className="space-y-2">
          <span className="label-eyebrow">My Properties</span>
          <h1 className="font-headline font-extrabold text-[1.75rem] md:text-[2.5rem] tracking-tight leading-tight">
            내 물건 상태
          </h1>
        </div>
        <Card>
          <CardContent>
            <p className="text-sm text-on-surface-variant">
              Phase 5 에서 구현 예정 — 저장된 물건 목록, 진행 상태, 종합 위험도 표시.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
