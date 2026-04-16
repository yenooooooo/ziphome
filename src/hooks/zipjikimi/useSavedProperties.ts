"use client";

/**
 * @file useSavedProperties.ts
 * @description 저장된 물건 관리 — localStorage 기반
 * @module hooks/zipjikimi
 */

import { useState, useEffect, useCallback } from "react";

export type ZjPropertyStatus = "검토중" | "계약진행" | "계약완료" | "취소";

export interface ZjSavedProperty {
  id: string;
  address: string;
  addressRoad?: string;
  buildingName?: string;
  regionCode?: string;
  builtYear?: number;
  mainPurpose?: string;
  avgSalePrice?: number;
  avgJeonseDeposit?: number;
  status: ZjPropertyStatus;
  memo: string;
  savedAt: string;
}

const STORAGE_KEY = "zj-saved-properties";

function load(): ZjSavedProperty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ZjSavedProperty[]) : [];
  } catch {
    return [];
  }
}

function save(items: ZjSavedProperty[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota */
  }
}

export function useSavedProperties() {
  const [properties, setProperties] = useState<ZjSavedProperty[]>([]);

  useEffect(() => {
    setProperties(load());
  }, []);

  const add = useCallback((p: Omit<ZjSavedProperty, "id" | "status" | "memo" | "savedAt">) => {
    setProperties((prev) => {
      if (prev.some((x) => x.address === p.address)) return prev;
      const next: ZjSavedProperty = {
        ...p,
        id: `zp-${Date.now()}`,
        status: "검토중",
        memo: "",
        savedAt: new Date().toISOString(),
      };
      const updated = [next, ...prev];
      save(updated);
      return updated;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      save(updated);
      return updated;
    });
  }, []);

  const updateStatus = useCallback((id: string, status: ZjPropertyStatus) => {
    setProperties((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, status } : p));
      save(updated);
      return updated;
    });
  }, []);

  const updateMemo = useCallback((id: string, memo: string) => {
    setProperties((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, memo } : p));
      save(updated);
      return updated;
    });
  }, []);

  return { properties, add, remove, updateStatus, updateMemo };
}
