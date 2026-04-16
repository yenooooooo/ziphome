"use client";

/**
 * @file property/new/page.tsx
 * @description 새 물건 검증 — 검색 이력 칩 + 결과 카드 스택
 * @module app/(zipjikimi)/property/new
 */

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";
import ZjAddressSearch from "@/components/zipjikimi/ui/ZjAddressSearch";
import ZjPropertyResult from "@/components/zipjikimi/ui/ZjPropertyResult";
import { useSearchHistory } from "@/hooks/zipjikimi/useSearchHistory";

function PropertyNewInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const { history, add, clear } = useSearchHistory();

  useEffect(() => {
    setQuery(initial);
  }, [initial]);

  function handleSubmit(next: string) {
    setQuery(next);
    add(next);
    router.replace(`/property/new?q=${encodeURIComponent(next)}`, { scroll: false });
  }

  return (
    <>
      <header className="sticky top-0 z-30 md:hidden glass safe-top">
        <div className="px-4 py-3">
          <ZjAddressSearch onSubmit={handleSubmit} />
        </div>
      </header>

      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-4 md:pt-8 pb-10 space-y-6">
        <div className="hidden md:block space-y-3 mb-3">
          <span className="label-eyebrow">Property Verification</span>
          <h1 className="font-headline font-extrabold text-[2.5rem] tracking-tight leading-tight">
            새 물건 검증
          </h1>
          <ZjAddressSearch onSubmit={handleSubmit} size="lg" />
        </div>

        {/* 검색 이력 칩 */}
        {!query && history.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 label-eyebrow">
                <Clock className="h-3 w-3" />
                최근 검색
              </div>
              <button
                type="button"
                onClick={clear}
                className="text-[11px] text-outline hover:text-foreground transition-colors"
              >
                전체 삭제
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSubmit(q)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-4 h-9 text-[13px] font-medium text-foreground active:scale-95 transition-all hover:bg-surface-container truncate max-w-[280px]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {!query && history.length === 0 && (
          <div className="rounded-[2rem] bg-surface-container-low p-6 md:p-8">
            <span className="label-eyebrow">How it works</span>
            <div className="font-headline font-bold text-lg mt-1.5">
              주소를 입력하면 즉시 분석
            </div>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              실거래가 · 건축물대장 · 전세가율을 한 번에 불러와 <br />
              적정성 판단과 위험 신호를 함께 보여드립니다.
            </p>
          </div>
        )}

        {query && <ZjPropertyResult address={query} />}
      </div>
    </>
  );
}

export default function ZjPropertyNewPage() {
  return (
    <Suspense fallback={null}>
      <PropertyNewInner />
    </Suspense>
  );
}
