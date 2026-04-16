/**
 * @file client.ts
 * @description 집지킴이 Supabase 클라이언트 — 브라우저/서버 공용
 *              모든 쿼리는 queries.ts 에서 호출 (컴포넌트에서 직접 X)
 * @module lib/zipjikimi/supabase
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_ZJ_SUPABASE_URL || process.env.ZJ_SUPABASE_URL || "";
const anonKey =
  process.env.NEXT_PUBLIC_ZJ_SUPABASE_ANON_KEY ||
  process.env.ZJ_SUPABASE_ANON_KEY ||
  "";

/**
 * 브라우저/서버 공통 Supabase 클라이언트.
 * @note 빌드 시 환경변수가 없어도 앱이 crash하지 않도록 lazy 초기화 사용.
 */
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  if (!url || !anonKey) {
    throw new Error(
      "[ZJ] Supabase 환경변수가 설정되지 않았습니다. .env.local 에 NEXT_PUBLIC_ZJ_SUPABASE_URL / NEXT_PUBLIC_ZJ_SUPABASE_ANON_KEY 를 추가하세요.",
    );
  }
  cached = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  return cached;
}

/**
 * 서버 사이드 (API Routes) — Service Role Key 사용 (RLS 우회)
 * 절대 client 컴포넌트에서 호출 금지.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const serviceKey = process.env.ZJ_SUPABASE_SERVICE_ROLE_KEY;
  const srvUrl = process.env.ZJ_SUPABASE_URL || process.env.NEXT_PUBLIC_ZJ_SUPABASE_URL;
  if (!srvUrl || !serviceKey) {
    throw new Error(
      "[ZJ] Supabase Admin 환경변수가 설정되지 않았습니다. (ZJ_SUPABASE_URL / ZJ_SUPABASE_SERVICE_ROLE_KEY)",
    );
  }
  return createClient(srvUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
