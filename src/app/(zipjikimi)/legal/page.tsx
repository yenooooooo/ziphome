/**
 * @file legal/page.tsx
 * @description 법률 가이드 — Phase 4 (F25)
 * @module app/(zipjikimi)/legal
 */

import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function ZjLegalPage() {
  return (
    <>
      <ZjMobileHeader title="법률 가이드" />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-4 md:pt-8 pb-10 space-y-6">
        <div className="space-y-2">
          <span className="label-eyebrow">Legal Watch</span>
          <h1 className="font-headline font-extrabold text-[1.75rem] md:text-[2.5rem] tracking-tight leading-tight">
            법률 가이드
          </h1>
        </div>
        <Card>
          <CardContent>
            <p className="text-sm text-on-surface-variant">
              Phase 4 에서 구현 — 내용증명, 임차권등기명령, 보증금 반환소송 등.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
