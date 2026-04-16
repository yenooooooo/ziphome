"use client";

/**
 * @file ZjTooltip.tsx
 * @description 용어 툴팁 — (?) 아이콘 터치 시 한 줄 설명 팝업
 * @module components/zipjikimi/ui
 */

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ZjTooltipProps {
  text: string;
  className?: string;
}

export default function ZjTooltip({ text, className }: ZjTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center justify-center h-4 w-4 rounded-full text-outline hover:text-primary transition-colors"
        aria-label="용어 설명"
      >
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 glass-card rounded-2xl shadow-float px-3.5 py-2.5 text-[12px] leading-relaxed text-foreground w-56 text-center font-medium">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-surface-container-lowest rotate-45" />
        </span>
      )}
    </span>
  );
}
