"use client";

/**
 * @file ZjPdfExportButton.tsx
 * @description 검증 결과 PDF 내보내기 버튼
 * @module components/zipjikimi/ui
 */

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ZjPdfExportButtonProps {
  /** 캡처 대상 요소 ID */
  targetId?: string;
  filename?: string;
  className?: string;
}

export default function ZjPdfExportButton({
  targetId = "zj-result-container",
  filename = "집지킴이-검증결과",
  className,
}: ZjPdfExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const el = document.getElementById(targetId);
      if (!el) {
        toast.error("캡처 대상을 찾을 수 없습니다.");
        return;
      }
      const { default: html2canvas } = await import("html2canvas-pro");
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8f9ff",
      });

      const imgWidth = 210; // A4 mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");

      // 여러 페이지 처리
      let y = 0;
      const pageHeight = 297;
      while (y < imgHeight) {
        if (y > 0) pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.92),
          "JPEG",
          0,
          -y,
          imgWidth,
          imgHeight,
        );
        y += pageHeight;
      }

      pdf.save(`${filename}.pdf`);
      toast.success("PDF가 저장되었습니다");
    } catch (e) {
      console.error(e);
      toast.error("PDF 생성 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className={cn(
        "h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50",
        className,
      )}
      aria-label="PDF 내보내기"
      title="PDF 내보내기"
    >
      <Download className="h-4 w-4" strokeWidth={2.5} />
    </button>
  );
}
