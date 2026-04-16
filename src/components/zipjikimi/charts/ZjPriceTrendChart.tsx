"use client";

/**
 * @file ZjPriceTrendChart.tsx
 * @description F13 — 실거래가 시세 트렌드 차트 (매매/전세/월세 3탭)
 * @module components/zipjikimi/charts
 */

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/zipjikimi/utils/format";
import type { ZjTransactionSummary } from "@/types/zipjikimi/transaction";

export interface ZjPriceTrendChartProps {
  saleSummary?: ZjTransactionSummary;
  jeonseSummary?: ZjTransactionSummary;
  monthlySummary?: ZjTransactionSummary;
}

type Mode = "sale" | "jeonse" | "monthly";

interface MonthAgg {
  ym: string;
  label: string;
  value?: number;
  /** 3개월 이동평균 */
  ma3?: number;
}

export default function ZjPriceTrendChart({
  saleSummary,
  jeonseSummary,
  monthlySummary,
}: ZjPriceTrendChartProps) {
  const [mode, setMode] = useState<Mode>("sale");

  const summary =
    mode === "sale"
      ? saleSummary
      : mode === "jeonse"
        ? jeonseSummary
        : monthlySummary;

  const data = useMemo<MonthAgg[]>(() => {
    if (!summary) return [];
    const byMonth = new Map<string, number[]>();
    for (const r of summary.records) {
      const ym = `${r.dealYear}-${String(r.dealMonth).padStart(2, "0")}`;
      // 매매는 salePrice, 전세/월세는 deposit 기준
      const price = mode === "sale" ? r.salePrice : r.deposit;
      if (!price) continue;
      const arr = byMonth.get(ym) ?? [];
      arr.push(price);
      byMonth.set(ym, arr);
    }
    const sorted = Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([ym, arr]) => ({
        ym,
        label: ym.slice(2).replace("-", "."),
        value: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
      }));
    // 3개월 이동평균
    return sorted.map((item, i) => {
      if (i < 2) return { ...item, ma3: undefined };
      const vals = [sorted[i - 2].value, sorted[i - 1].value, item.value].filter(
        (v): v is number => v !== undefined,
      );
      return {
        ...item,
        ma3: vals.length === 3 ? Math.round((vals[0] + vals[1] + vals[2]) / 3) : undefined,
      };
      });
  }, [mode, summary]);

  const hasData = data.length >= 2;
  const latest = data[data.length - 1];
  const first = data[0];
  const delta =
    latest?.value && first?.value
      ? ((latest.value - first.value) / first.value) * 100
      : 0;

  const heroLabel =
    mode === "sale"
      ? "최근 월 평균 매매가"
      : mode === "jeonse"
        ? "최근 월 평균 전세 보증금"
        : "최근 월 평균 월세 보증금";

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="label-eyebrow">Market Price Trend</span>
            <div className="font-headline font-bold text-lg mt-1">시세 트렌드</div>
          </div>
          <div className="inline-flex items-center gap-1 p-1 bg-surface-container-low rounded-full">
            <SegBtn active={mode === "sale"} onClick={() => setMode("sale")}>
              매매
            </SegBtn>
            <SegBtn active={mode === "jeonse"} onClick={() => setMode("jeonse")}>
              전세
            </SegBtn>
            <SegBtn active={mode === "monthly"} onClick={() => setMode("monthly")}>
              월세
            </SegBtn>
          </div>
        </div>

        {!hasData ? (
          <p className="text-sm text-on-surface-variant py-8 text-center">
            트렌드 차트를 그리려면 최소 2개월 이상의 거래 데이터가 필요합니다.
          </p>
        ) : (
          <>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                {heroLabel}
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <div className="font-headline text-[2rem] md:text-[2.25rem] font-extrabold tracking-tight leading-none">
                  {latest?.value ? formatKRW(latest.value, { compact: true }) : "-"}
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                    delta > 0
                      ? "chip-danger"
                      : delta < 0
                        ? "chip-safe"
                        : "chip-primary",
                  )}
                >
                  {delta > 0 ? "▲" : delta < 0 ? "▼" : "="} {Math.abs(delta).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="h-48 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="label"
                    stroke="#75777d"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#75777d"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatKRW(v, { compact: true })}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "1rem",
                      border: "none",
                      boxShadow: "0 8px 24px rgba(11,28,48,0.08)",
                      padding: "8px 12px",
                      fontSize: "12px",
                    }}
                    formatter={(v) => formatKRW(Number(v), { compact: true })}
                    labelFormatter={(l) => String(l)}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="월평균"
                    stroke="#00113b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#00113b" }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ma3"
                    name="3개월 평균"
                    stroke="#5f8aff"
                    strokeWidth={1.5}
                    strokeDasharray="6 3"
                    dot={false}
                    activeDot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SegBtn({
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
        "px-4 h-8 rounded-full text-xs font-semibold transition-all",
        active
          ? "bg-surface-container-lowest text-foreground shadow-float"
          : "text-on-surface-variant",
      )}
    >
      {children}
    </button>
  );
}
