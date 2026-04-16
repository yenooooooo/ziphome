/**
 * @file offlineSync.ts
 * @description 오프라인 상태에서 변경된 체크리스트 등을 IndexedDB에 큐잉하고
 *              온라인 복귀 시 Supabase로 동기화
 * @note Phase 4 (체크리스트)에서 본격 구현 — 현재는 인터페이스만
 * @module lib/zipjikimi/pwa
 */

import { get, set, del, keys } from "idb-keyval";

/** 동기화 대기 큐 아이템 */
export interface ZjSyncQueueItem {
  id: string;
  type: "checklist" | "property" | "document";
  action: "insert" | "update" | "delete";
  payload: unknown;
  createdAt: string;
}

const QUEUE_PREFIX = "zj:sync:";

/** 큐에 동기화 작업 추가 */
export async function enqueueSync(item: Omit<ZjSyncQueueItem, "createdAt">): Promise<void> {
  const full: ZjSyncQueueItem = { ...item, createdAt: new Date().toISOString() };
  await set(`${QUEUE_PREFIX}${item.id}`, full);
}

/** 큐에서 특정 아이템 제거 (성공 시 호출) */
export async function dequeueSync(id: string): Promise<void> {
  await del(`${QUEUE_PREFIX}${id}`);
}

/** 대기 중인 모든 동기화 아이템 조회 */
export async function getPendingSyncItems(): Promise<ZjSyncQueueItem[]> {
  const allKeys = await keys();
  const syncKeys = allKeys.filter(
    (k): k is string => typeof k === "string" && k.startsWith(QUEUE_PREFIX),
  );
  const items = await Promise.all(syncKeys.map((k) => get<ZjSyncQueueItem>(k)));
  return items.filter((i): i is ZjSyncQueueItem => i !== undefined);
}
