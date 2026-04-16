"use client";

/**
 * @file ZjRecentSearches.tsx
 * @description 홈 화면 "최근 검색" 칩 — 원클릭 재검색
 * @module components/zipjikimi/ui
 */

import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { useSearchHistory } from "@/hooks/zipjikimi/useSearchHistory";

export default function ZjRecentSearches() {
  const { history } = useSearchHistory();
  const router = useRouter();

  if (history.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-1.5 label-eyebrow px-1">
        <Clock className="h-3 w-3" />
        Recent Searches
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() =>
              router.push(`/property/new?q=${encodeURIComponent(q)}`)
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-4 h-10 text-[13px] font-medium text-foreground active:scale-95 transition-all hover:bg-surface-container truncate max-w-[280px]"
          >
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}
