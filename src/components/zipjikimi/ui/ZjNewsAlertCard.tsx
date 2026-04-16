"use client";

/**
 * @file ZjNewsAlertCard.tsx
 * @description 전세사기 뉴스 경고 피드 — 해당 시군구 관련 뉴스 자동 수집
 *   네이버 검색 API 대신 네이버 뉴스 RSS/웹 검색 프록시 사용.
 *   API 키 없이도 작동하는 방식 — /api/news?q=금천구 전세사기
 * @module components/zipjikimi/ui
 */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Newspaper,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

export interface ZjNewsAlertCardProps {
  sigungu?: string;
}

interface NewsItem {
  title: string;
  link: string;
  source?: string;
}

export default function ZjNewsAlertCard({ sigungu }: ZjNewsAlertCardProps) {
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    if (!sigungu) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/news?q=${encodeURIComponent(`${sigungu} 전세사기`)}`,
        );
        const json = (await res.json()) as { items: NewsItem[] };
        if (!cancelled) setNews(json.items ?? []);
      } catch {
        /* 무시 */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sigungu]);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="label-eyebrow">News Alert</span>
            <div className="font-headline font-bold text-lg mt-1">
              전세사기 뉴스
            </div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-error-container flex items-center justify-center shrink-0">
            <Newspaper className="h-5 w-5 text-on-error-container" strokeWidth={2.2} />
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-20 rounded-2xl" />
        ) : news.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-on-surface-variant shrink-0" />
            <div className="text-[13px] text-on-surface-variant">
              {sigungu
                ? `"${sigungu} 전세사기" 관련 최근 뉴스가 없거나 조회할 수 없습니다.`
                : "주소 검색 후 해당 지역 뉴스가 표시됩니다."}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {news.slice(0, 3).map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between rounded-2xl bg-error-container/30 px-4 py-3 active:scale-[0.99] transition-transform hover:bg-error-container/50 gap-3"
              >
                <div className="min-w-0">
                  <div
                    className="font-semibold text-[13px] text-on-error-container leading-relaxed line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  />
                  {item.source && (
                    <div className="text-[11px] text-on-error-container/70 mt-1">
                      {item.source}
                    </div>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 text-on-error-container shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
