/**
 * @file api/news/route.ts
 * @description 뉴스 검색 프록시 — 네이버 뉴스 RSS 파싱 (API 키 불필요)
 * @api GET /api/news?q=금천구 전세사기
 * @module app/(zipjikimi)/api/news
 */

import { NextResponse } from "next/server";

interface NewsItem {
  title: string;
  link: string;
  source?: string;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ items: [] });

  try {
    // 네이버 뉴스 RSS (검색어 기반, API 키 불필요)
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ko&gl=KR&ceid=KR:ko`;
    const res = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ZipJikimi/1.0)",
      },
      next: { revalidate: 60 * 60 }, // 1시간 캐시
    });

    if (!res.ok) return NextResponse.json({ items: [] });

    const xml = await res.text();

    // 간단 XML 파싱 (RSS item 추출)
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const content = match[1];
      const title = content.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] ??
        content.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
      const link = content.match(/<link>(.*?)<\/link>|<link\/>\s*(https?:\/\/[^\s<]+)/)?.[1] ?? "";
      const source = content.match(/<source[^>]*>(.*?)<\/source>/)?.[1] ?? "";

      if (title && link) {
        items.push({
          title: title.replace(/<[^>]+>/g, ""),
          link,
          source: source || undefined,
        });
      }
    }

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
