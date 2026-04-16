"use client";

/**
 * @file useChecklist.ts
 * @description 체크리스트 체크 상태 관리 — localStorage 기반
 * @module hooks/zipjikimi
 */

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "zj-checklist";

export function useChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* empty */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        /* quota */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setChecked(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* empty */
    }
  }, []);

  return { checked, toggle, reset };
}
