/**
 * @file cache.ts
 * @description Supabase zj_*_cache 테이블 공통 get/set 헬퍼
 *   - 캐시 hit: expires_at 미만이면 response_data 반환
 *   - 캐시 miss: null 반환 → 호출자가 fresh fetch 후 setCached 호출
 *   - 에러: 캐시 없는 것으로 취급 (앱 죽이지 않음)
 * @module lib/zipjikimi/utils
 */

import { getSupabaseAdmin } from "../supabase/client";

/** 캐시 조회 — 만료된 레코드는 자동 무시 */
export async function getCached<T>(
  table: "zj_transaction_cache" | "zj_building_cache" | "zj_official_price_cache",
  filter: Record<string, string | number>,
): Promise<T | null> {
  try {
    const client = getSupabaseAdmin();
    let query = client.from(table).select("response_data, expires_at").limit(1);
    for (const [k, v] of Object.entries(filter)) {
      query = query.eq(k, v);
    }
    const { data, error } = await query.maybeSingle();
    if (error || !data) return null;
    // expires_at 지난 레코드는 무시
    if (new Date(data.expires_at as string).getTime() < Date.now()) return null;
    return data.response_data as T;
  } catch (err) {
    console.warn("[ZJ] 캐시 조회 실패 — 원본 API 호출로 fallback:", err);
    return null;
  }
}

/**
 * 캐시 저장 — upsert. TTL은 테이블 DEFAULT 값 사용 (24h/7d/30d)
 * @note 실패해도 앱은 정상 작동해야 하므로 에러 throw 금지
 */
export async function setCached(
  table: "zj_transaction_cache" | "zj_building_cache" | "zj_official_price_cache",
  row: Record<string, unknown>,
): Promise<void> {
  try {
    const client = getSupabaseAdmin();
    const { error } = await client.from(table).upsert(row as never);
    if (error) console.warn(`[ZJ] 캐시 저장 실패 (${table}):`, error.message);
  } catch (err) {
    console.warn(`[ZJ] 캐시 저장 예외 (${table}):`, err);
  }
}
