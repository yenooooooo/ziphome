/**
 * @file ZjLandUseCard.tsx
 * @description F11 용도지역 카드
 * @module components/zipjikimi/ui
 */

import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ZjLandUseSummary,
  ZjLandZoneCategory,
} from "@/types/zipjikimi/landUse";

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
  data?: ZjLandUseSummary;
  error?: string;
}

export default function ZjLandUseCard({ data, error }: ZjLandUseCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <span className="label-eyebrow">Land Zoning</span>
          <div className="font-headline font-bold text-lg mt-1">용도지역</div>
        </div>

        {error ? (
          error.includes("VWORLD") || error.includes("VWorld") ? (
            <p className="text-sm text-on-surface-variant leading-relaxed">
              용도지역 조회는 <strong>VWorld 무료 인증키</strong>가 필요합니다.
              <br />
              <a
                href="https://www.vworld.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 mt-1 inline-block font-semibold"
              >
                VWorld 회원가입 → 인증키 신청 →
              </a>{" "}
              .env.local 에 <code className="text-xs bg-surface-container-low px-1 py-0.5 rounded">ZJ_VWORLD_API_KEY</code> 추가.
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
                대형 복합건물·공동소유지·재개발구역 등에서 가끔 발생하며, 실제로 도시계획이 확정되지 않았을 수도 있습니다.
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
                        <span className="text-on-surface-variant"> · {r.districtName}</span>
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
