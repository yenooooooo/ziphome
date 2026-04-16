"use client";

/**
 * @file ZjSimilarDealsHint.tsx
 * @description "이 건물만" 필터 3건 미만일 때 동일 동·유사 면적 거래 3건 추천
 * @module components/zipjikimi/ui
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { formatKRW, formatArea } from "@/lib/zipjikimi/utils/format";
import type {
  ZjTransactionSummary,
  ZjTransactionRecord,
} from "@/types/zipjikimi/transaction";

export interface ZjSimilarDealsHintProps {
  /** 전체 (동네) 매매 요약 */
  regionSale?: ZjTransactionSummary;
  /** 검색된 건물의 동 이름 */
  dong?: string;
  /** 검색된 건물의 대표 면적 (건축물대장 추정) */
  areaM2?: number;
  /** "이 건물만" 매칭 건수 */
  buildingMatchCount: number;
  /** 현재 필터 모드 */
  filterMode: "building" | "region";
}

export default function ZjSimilarDealsHint({
  regionSale,
  dong,
  areaM2,
  buildingMatchCount,
  filterMode,
}: ZjSimilarDealsHintProps) {
  // "이 건물만" 모드이고 3건 미만일 때만 표시
  const show = filterMode === "building" && buildingMatchCount < 3;

  const suggestions = useMemo<ZjTransactionRecord[]>(() => {
    if (!show || !regionSale) return [];
    return regionSale.records
      .filter((r) => {
        // 같은 동이면 우선
        if (dong && r.dong && r.dong !== dong) return false;
        // 면적 ±30% (넓게)
        if (areaM2 && r.areaM2) {
          if (Math.abs(r.areaM2 - areaM2) / areaM2 > 0.3) return false;
        }
        return r.salePrice !== undefined;
      })
      .slice(0, 3);
  }, [show, regionSale, dong, areaM2]);

  if (!show || suggestions.length === 0) return null;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
            <Lightbulb className="h-4 w-4 text-on-primary-fixed" />
          </div>
          <div>
            <div className="font-headline font-bold text-[14px]">
              비슷한 거래 참고
            </div>
            <div className="text-[11px] text-on-surface-variant">
              이 건물 거래 {buildingMatchCount}건뿐 —{" "}
              {dong ? `${dong} 내` : "동네"} 유사 면적 거래를 보여드립니다.
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          {suggestions.map((r, i) => (
            <li
              key={i}
              className="rounded-2xl bg-surface-container-low px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-headline font-bold text-[14px] truncate">
                  {r.buildingName ?? r.dong ?? "-"}
                </div>
                <div className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                  {r.dealYear}.{String(r.dealMonth).padStart(2, "0")}
                  {r.floor !== undefined && ` · ${r.floor}층`}
                  {r.areaM2 && ` · ${formatArea(r.areaM2)}`}
                </div>
              </div>
              <div className="shrink-0 font-headline font-bold text-[14px] text-primary">
                {r.salePrice ? formatKRW(r.salePrice, { compact: true }) : "-"}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
