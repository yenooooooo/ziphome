/**
 * @file compare/page.tsx
 * @description 물건 비교 — Phase 5 (F27) 구현 예정
 * @module app/(zipjikimi)/compare
 */

import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function ZjComparePage() {
  return (
    <>
      <ZjMobileHeader title="물건 비교" />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-4 md:pt-8 pb-10 space-y-6">
        <div className="space-y-2">
          <span className="label-eyebrow">Compare</span>
          <h1 className="font-headline font-extrabold text-[1.75rem] md:text-[2.5rem] tracking-tight leading-tight">
            물건 비교
          </h1>
        </div>
        <Card>
          <CardContent>
            <p className="text-sm text-on-surface-variant">
              Phase 5 에서 구현 예정 — 후보 2~3개 물건을 나란히 비교 (시세/노후도/위험도/보험/수수료).
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
