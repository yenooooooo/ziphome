"use client";

/**
 * @file ZjTransactionListCard.tsx
 * @description F01 실거래가 요약 + 목록 — 매매/전세/월세 3 탭 분리
 *   최근 10건 인라인 + "전체 보기" 모달(페이지네이션)
 * @module components/zipjikimi/ui
 */

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatKRW, formatArea } from "@/lib/zipjikimi/utils/format";
import ZjTransactionListDialog from "./ZjTransactionListDialog";
import type { ZjTransactionSummary } from "@/types/zipjikimi/transaction";

export interface ZjTransactionListCardProps {
  saleSummary?: ZjTransactionSummary;
  jeonseSummary?: ZjTransactionSummary;
  monthlySummary?: ZjTransactionSummary;
  regionLabel?: string;
}

type Tab = "sale" | "jeonse" | "monthly";

export default function ZjTransactionListCard({
  saleSummary,
  jeonseSummary,
  monthlySummary,
  regionLabel,
}: ZjTransactionListCardProps) {
  const [tab, setTab] = useState<Tab>("sale");
  const [dialogOpen, setDialogOpen] = useState(false);

  const summary = useMemo(() => {
    if (tab === "sale") return saleSummary;
    if (tab === "jeonse") return jeonseSummary;
    return monthlySummary;
  }, [tab, saleSummary, jeonseSummary, monthlySummary]);

  const avg =
    tab === "sale"
      ? summary?.avgPrice
      : tab === "jeonse"
        ? summary?.avgDeposit
        : summary?.avgDeposit; // 월세도 보증금 평균 기준

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="label-eyebrow">Market Insight</span>
            <div className="font-headline font-bold text-lg mt-1">
              실거래가{" "}
              {regionLabel && (
                <span className="text-on-surface-variant font-normal text-sm">
                  · {regionLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 세그먼트 — 매매/전세/월세 */}
        <div className="inline-flex items-center gap-1 p-1 bg-surface-container-low rounded-full">
          <SegmentButton active={tab === "sale"} onClick={() => setTab("sale")}>
            매매
          </SegmentButton>
          <SegmentButton active={tab === "jeonse"} onClick={() => setTab("jeonse")}>
            전세
          </SegmentButton>
          <SegmentButton active={tab === "monthly"} onClick={() => setTab("monthly")}>
            월세
          </SegmentButton>
        </div>

        {!summary || summary.count === 0 ? (
          <p className="text-sm text-on-surface-variant py-6 text-center">
            최근{" "}
            {tab === "sale" ? "매매" : tab === "jeonse" ? "전세" : "월세"} 실거래 기록이 없습니다.
          </p>
        ) : (
          <>
            {/* Hero stat */}
            <div className="rounded-[2rem] bg-gradient-surface p-6">
              <div className="label-eyebrow">
                평균{" "}
                {tab === "sale" ? "매매가" : tab === "jeonse" ? "전세 보증금" : "월세 보증금"}
              </div>
              <div className="font-headline text-[2rem] md:text-[2.5rem] font-extrabold tracking-tight leading-none mt-2">
                {avg ? formatKRW(avg, { compact: true }) : "-"}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6">
                <MiniStat label="거래 건수" value={`${summary.count}건`} />
                {tab === "sale" && summary.maxPrice && (
                  <MiniStat
                    label="최고"
                    value={formatKRW(summary.maxPrice, { compact: true })}
                  />
                )}
                {tab === "sale" && summary.minPrice && (
                  <MiniStat
                    label="최저"
                    value={formatKRW(summary.minPrice, { compact: true })}
                  />
                )}
                {tab === "monthly" && (
                  <MiniStat
                    label="평균 월세"
                    value={(() => {
                      const monthlies = summary.records
                        .map((r) => r.monthlyRent)
                        .filter((v): v is number => !!v);
                      if (monthlies.length === 0) return "-";
                      const avgMon = Math.round(
                        monthlies.reduce((a, b) => a + b, 0) / monthlies.length,
                      );
                      return `월 ${avgMon.toLocaleString()}만`;
                    })()}
                  />
                )}
              </div>
            </div>

            {/* 거래 목록 */}
            <div>
              <div className="label-eyebrow mb-3">최근 실거래 내역</div>
              <ul className="space-y-2">
                {summary.records.slice(0, 10).map((r, i) => (
                  <li
                    key={i}
                    className="rounded-2xl bg-surface-container-low px-4 py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-headline font-bold text-[15px] truncate">
                        {r.salePrice
                          ? formatKRW(r.salePrice, { compact: true })
                          : r.deposit
                            ? formatKRW(r.deposit, { compact: true })
                            : "-"}
                        {r.monthlyRent && r.monthlyRent > 0 && (
                          <span className="text-on-surface-variant font-medium ml-1 text-[13px]">
                            / 월 {r.monthlyRent.toLocaleString()}만
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-on-surface-variant mt-0.5 truncate">
                        {r.dealYear}.{String(r.dealMonth).padStart(2, "0")}
                        {r.dealDay && `.${String(r.dealDay).padStart(2, "0")}`}
                        {r.floor !== undefined && ` · ${r.floor}층`}
                        {r.areaM2 && ` · ${formatArea(r.areaM2)}`}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-outline shrink-0" />
                  </li>
                ))}
              </ul>
              {summary.count > 10 && (
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="mt-3 w-full h-12 rounded-full bg-surface-container-low hover:bg-surface-container text-foreground font-semibold text-[13px] flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
                >
                  <ListFilter className="h-4 w-4" strokeWidth={2.2} />
                  전체 {summary.count}건 보기
                </button>
              )}
            </div>
          </>
        )}

        <ZjTransactionListDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          records={summary?.records ?? []}
          title={`${tab === "sale" ? "매매" : tab === "jeonse" ? "전세" : "월세"} 실거래 내역`}
          mode={tab === "sale" ? "sale" : "rent"}
        />
      </CardContent>
    </Card>
  );
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-5 h-9 rounded-full text-[13px] font-semibold transition-all",
        active
          ? "bg-surface-container-lowest text-foreground shadow-float"
          : "text-on-surface-variant",
      )}
    >
      {children}
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
        {label}
      </div>
      <div className="text-sm font-semibold mt-1 text-on-surface">{value}</div>
    </div>
  );
}
