/**
 * @file api/search-keyword/route.ts
 * @description 카카오 키워드 검색 프록시 — 주소 자동완성용
 * @api GET /api/search-keyword?q=역삼동
 * @module app/(zipjikimi)/api/search-keyword
 */

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const key = process.env.ZJ_KAKAO_REST_KEY;
  if (!key) return NextResponse.json({ results: [] });

  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=5&category_group_code=`,
      {
        headers: {
          Authorization: `KakaoAK ${key}`,
          KA: "os/node lang/ko-KR origin/http://localhost",
        },
      },
    );
    if (!res.ok) return NextResponse.json({ results: [] });
    const json = (await res.json()) as {
      documents?: Array<{
        place_name?: string;
        address_name?: string;
        road_address_name?: string;
      }>;
    };

    // 주소 검색 API로도 시도
    const addrRes = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(q)}&size=5`,
      {
        headers: {
          Authorization: `KakaoAK ${key}`,
          KA: "os/node lang/ko-KR origin/http://localhost",
        },
      },
    );
    const addrJson = addrRes.ok
      ? ((await addrRes.json()) as {
          documents?: Array<{
            address_name?: string;
            road_address?: { address_name?: string } | null;
          }>;
        })
      : { documents: [] };

    const seen = new Set<string>();
    const results: Array<{ text: string; sub?: string }> = [];

    // 주소 결과 우선
    for (const d of addrJson.documents ?? []) {
      const road = d.road_address?.address_name;
      const addr = d.address_name;
      const main = road ?? addr ?? "";
      if (!main || seen.has(main)) continue;
      seen.add(main);
      results.push({ text: main, sub: road && addr && road !== addr ? addr : undefined });
    }

    // 키워드 결과 보충
    for (const d of json.documents ?? []) {
      const main = d.road_address_name ?? d.address_name ?? "";
      if (!main || seen.has(main)) continue;
      seen.add(main);
      results.push({ text: main, sub: d.place_name });
    }

    return NextResponse.json({ results: results.slice(0, 7) });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
