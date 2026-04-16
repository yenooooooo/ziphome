"use client";

/**
 * @file useSearchHistory.ts
 * @description 주소 검색 이력 — localStorage 기반, 최근 N개 유지
 * @module hooks/zipjikimi
 */

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "zj-search-history";

export function useSearchHistory(maxItems = 5) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw) as string[]);
    } catch {
      /* empty */
    }
  }, []);

  const add = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      setHistory((prev) => {
        const next = [trimmed, ...prev.filter((q) => q !== trimmed)].slice(
          0,
          maxItems,
        );
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* quota exceeded */
        }
        return next;
      });
    },
    [maxItems],
  );

  const clear = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* empty */
    }
  }, []);

  return { history, add, clear };
}
