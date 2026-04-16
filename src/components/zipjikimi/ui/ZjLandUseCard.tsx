"use client";

/**
 * @file ZjLandUseCard.tsx
 * @description F11 용도지역 카드 — 클라이언트에서 VWorld 직접 호출
 *   Vercel 서버리스(미국)에서 VWorld(한국) 호출 시 502 차단 → 브라우저(한국)에서 직접 호출로 우회.
 * @module components/zipjikimi/ui
 */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  ZjLandUseSummary,
  ZjLandUseRecord,
  ZjLandZoneCategory,
} from "@/types/zipjikimi/landUse";

// Next.js Rewrite 프록시 경유 — CORS 우회
const VWORLD_ENDPOINT = "/api/vworld/ned/data/getLandUseAttr";

const CATEGORY_CHIP: Record<ZjLandZoneCategory, string> = {
  주거: "chip-safe",
  상업: "chip-primary",
  공업: "chip-caution",
  녹지: "chip-safe",
  관리: "chip-primary",
  농림: "chip-primary",
  자연환경보전: "chip-safe",
  기타: "chip-primary",
};

export interface ZjLandUseCardProps {
  pnu?: string;
}

function classifyZone(name: string): ZjLandZoneCategory {
  if (name.includes("주거")) return "주거";
  if (name.includes("상업")) return "상업";
  if (name.includes("공업")) return "공업";
  if (name.includes("녹지")) return "녹지";
  if (name.includes("관리")) return "관리";
  if (name.includes("농림")) return "농림";
  if (name.includes("자연환경")) return "자연환경보전";
  return "기타";
}

export default function ZjLandUseCard({ pnu }: ZjLandUseCardProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ZjLandUseSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const vworldKey = process.env.NEXT_PUBLIC_ZJ_VWORLD_API_KEY;

  useEffect(() => {
    if (!pnu || !vworldKey) {
      if (!vworldKey) setError("VWORLD_KEY_MISSING");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    (async () => {
      try {
        // 카카오 platGbCd와 VWorld PNU의 산여부 코드가 불일치하는 경우가 있어
        // 원본 PNU 시도 → 결과 없으면 platGbCd 반전(0↔1)해서 재시도
        const pnuVariants = [
          pnu,
          pnu.slice(0, 10) + (pnu[10] === "0" ? "1" : "0") + pnu.slice(11),
        ];

        let fields: Record<string, unknown>[] = [];
        for (const tryPnu of pnuVariants) {
          const params = new URLSearchParams({
            key: vworldKey,
            pnu: tryPnu,
            format: "json",
            numOfRows: "100",
            pageNo: "1",
            domain: window.location.hostname,
          });
          const res = await fetch(`${VWORLD_ENDPOINT}?${params}`);
          if (!res.ok) continue;
          const json = (await res.json()) as {
            landUses?: {
              field?: Record<string, unknown> | Record<string, unknown>[];
            };
            response?: {
              totalCount?: string | number;
            };
          };

          if (json.landUses?.field) {
            const f = json.landUses.field;
            fields = Array.isArray(f) ? f : [f];
          }
          if (fields.length > 0) break; // 데이터 찾음
        }

        if (cancelled) return;

        const records: ZjLandUseRecord[] = fields.map((raw) => {
          const zoneName =
            String(raw["prposAreaDstrcCodeNm"] ?? raw["prposArea"] ?? "-").trim();
          return {
            zoneName,
            category: classifyZone(zoneName),
            districtName: raw["dstrcCodeNm"]
              ? String(raw["dstrcCodeNm"]).trim()
              : undefined,
          };
        });

        const primary =
          records.find((r) =>
            ["주거", "상업", "공업", "녹지"].includes(r.category),
          ) ?? records[0];

        setData({ primary, records, pnu });
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pnu, vworldKey]);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <span className="label-eyebrow">Land Zoning</span>
          <div className="font-headline font-bold text-lg mt-1">용도지역</div>
        </div>

        {loading ? (
          <Skeleton className="h-16 rounded-2xl" />
        ) : error ? (
          error.includes("VWORLD") || error.includes("VWorld") ? (
            <p className="text-sm text-on-surface-variant leading-relaxed">
              용도지역 조회는 <strong>VWorld 무료 인증키</strong>가 필요합니다.
              <br />
              Vercel 환경변수에{" "}
              <code className="text-xs bg-surface-container-low px-1 py-0.5 rounded">
                NEXT_PUBLIC_ZJ_VWORLD_API_KEY
              </code>{" "}
              추가.
            </p>
          ) : (
            <p className="text-sm text-on-surface-variant">{error}</p>
          )
        ) : !data || data.records.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              이 필지의 용도지역 정보가 등록되어 있지 않습니다.
              <br />
              <span className="text-xs">
                대형 복합건물·공동소유지 등에서 가끔 발생합니다.
              </span>
            </p>
            <a
              href="https://www.eum.go.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-4"
            >
              토지이음에서 직접 조회
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                  주된 용도지역
                </div>
                <div className="font-headline font-bold text-xl mt-1 tracking-tight truncate">
                  {data.primary?.zoneName ?? "-"}
                </div>
              </div>
              {data.primary && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold shrink-0",
                    CATEGORY_CHIP[data.primary.category],
                  )}
                >
                  {data.primary.category}
                </span>
              )}
            </div>

            {data.records.length > 1 && (
              <div className="rounded-2xl bg-surface-container-low p-4 space-y-2">
                <div className="label-eyebrow">그 외 저촉 사항</div>
                <ul className="space-y-1.5">
                  {data.records.slice(1).map((r, i) => (
                    <li key={i} className="text-[13px]">
                      {r.zoneName}
                      {r.districtName && (
                        <span className="text-on-surface-variant">
                          {" "}
                          · {r.districtName}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
