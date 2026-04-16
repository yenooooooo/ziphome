/**
 * @file queries.ts
 * @description 집지킴이 Supabase 쿼리 함수 모음 — 모든 DB 접근은 여기서만
 * @note 컴포넌트에서 supabase 클라이언트 직접 호출 금지 (CLAUDE.md 6.2)
 * @module lib/zipjikimi/supabase
 */

// Phase 1 이후 본격 구현 예정.
// 예시 구조:
//
// import { getSupabase } from "./client";
// import type { ZjProperty } from "@/types/zipjikimi/property";
//
// export async function listProperties(): Promise<ZjProperty[]> {
//   const { data, error } = await getSupabase()
//     .from("zj_properties")
//     .select("*")
//     .order("created_at", { ascending: false });
//   if (error) throw error;
//   return data ?? [];
// }

export {};
