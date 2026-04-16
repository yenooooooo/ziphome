/**
 * @file dashboard/documents/page.tsx
 * @description F28 — 서류 관리 (Supabase Storage 필요 → 스텁)
 * @module app/(zipjikimi)/dashboard/documents
 */

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Camera, Upload } from "lucide-react";
import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";

export default function ZjDocumentsPage() {
  return (
    <>
      <ZjMobileHeader title="서류 관리" />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-4 md:pt-8 pb-10 space-y-6">
        <div className="space-y-2">
          <span className="label-eyebrow">Documents</span>
          <h1 className="font-headline font-extrabold text-[1.75rem] md:text-[2.5rem] tracking-tight leading-tight">
            서류 관리
          </h1>
        </div>

        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <FileText className="h-12 w-12 text-outline mx-auto" />
            <div className="font-headline font-bold text-lg">추후 구현 예정</div>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              계약서, 등기부등본, 현장 사진 등을 촬영하거나 업로드해서 물건별로
              관리하는 기능입니다.
              <br />
              Supabase Storage 연동 후 활성화됩니다.
            </p>
            <div className="flex justify-center gap-3">
              <div className="rounded-2xl bg-surface-container-low p-4 text-center">
                <Camera className="h-6 w-6 text-primary mx-auto mb-1" />
                <div className="text-[12px] font-semibold">카메라 촬영</div>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4 text-center">
                <Upload className="h-6 w-6 text-primary mx-auto mb-1" />
                <div className="text-[12px] font-semibold">파일 업로드</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
