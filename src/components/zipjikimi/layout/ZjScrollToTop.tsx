"use client";

/**
 * @file ZjScrollToTop.tsx
 * @description 스크롤 상단 이동 버튼 — 200px 이상 스크롤 시 표시
 * @module components/zipjikimi/layout
 */

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ZjScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 200);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="맨 위로"
      className={cn(
        "fixed right-4 z-40 h-10 w-10 rounded-full",
        "bg-surface-container-lowest/80 backdrop-blur shadow-float",
        "flex items-center justify-center",
        "active:scale-90 transition-all duration-300",
        "md:right-6 md:bottom-6",
        show
          ? "bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 opacity-100 translate-y-0"
          : "bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <ChevronUp className="h-5 w-5 text-primary" strokeWidth={2.5} />
    </button>
  );
}
