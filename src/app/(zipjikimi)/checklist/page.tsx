/**
 * @file checklist/page.tsx
 * @description 체크리스트 허브 — Phase 4 (F21) 구현 예정
 * @module app/(zipjikimi)/checklist
 */

import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function ZjChecklistHubPage() {
  return (
    <>
      <ZjMobileHeader title="체크리스트" />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-4 md:pt-8 pb-10 space-y-6">
        <div className="space-y-2">
          <span className="label-eyebrow">Contract Safeguards</span>
          <h1 className="font-headline font-extrabold text-[1.75rem] md:text-[2.5rem] tracking-tight leading-tight">
            단계별 체크
          </h1>
        </div>
        <Card>
          <CardContent>
            <p className="text-sm text-on-surface-variant">
              Phase 4 에서 구현 — 계약 전/중/후/이사 단계별 체크 + 오프라인 동기화.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
