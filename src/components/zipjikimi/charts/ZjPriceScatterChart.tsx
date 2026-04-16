"use client";

/**
 * @file ZjPriceScatterChart.tsx
 * @description 층별/면적별 가격 산점도 — 저평가/고평가 시각화
 * @module components/zipjikimi/charts
 */

import { useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/zipjikimi/utils/format";
import type { ZjTransactionSummary } from "@/types/zipjikimi/transaction";

export interface ZjPriceScatterChartProps {
  saleSummary?: ZjTransactionSummary;
  jeonseSummary?: ZjTransactionSummary;
}

type Axis = "area" | "floor";
type Mode = "sale" | "jeonse";

interface Point {
  x: number;
  price: number;
  label: string;
}

export default function ZjPriceScatterChart({
  saleSummary,
  jeonseSummary,
}: ZjPriceScatterChartProps) {
  const [mode, setMode] = useState<Mode>("sale");
  const [axis, setAxis] = useState<Axis>("area");

  const summary = mode === "sale" ? saleSummary : jeonseSummary;

  const { points, avg, totalCount } = useMemo(() => {
    if (!summary) return { points: [], avg: 0 };
    const pts: Point[] = [];
    let total = 0;
    let count = 0;
    for (const r of summary.records) {
      const price = mode === "sale" ? r.salePrice : r.deposit;
      const xVal = axis === "area" ? r.areaM2 : r.floor;
      if (!price || xVal === undefined) continue;
      pts.push({
        x: xVal,
        price,
        label: `${r.buildingName ?? ""} ${r.floor ?? ""}층 ${r.areaM2 ?? ""}㎡`,
      });
      total += price;
      count++;
    }
    // 최대 100건만 표시 (SVG 렌더링 성능)
    const limited = pts.length > 100 ? pts.slice(0, 100) : pts;
    return { points: limited, avg: count > 0 ? total / count : 0, totalCount: pts.length };
  }, [summary, mode, axis]);

  const hasData = points.length >= 3;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="label-eyebrow">Price Distribution</span>
            <div className="font-headline font-bold text-lg mt-1">
              가격 분포
            </div>
          </div>
          <div className="flex gap-2">
            <div className="inline-flex items-center gap-1 p-1 bg-surface-container-low rounded-full">
              <SegBtn active={mode === "sale"} onClick={() => setMode("sale")}>
                매매
              </SegBtn>
              <SegBtn active={mode === "jeonse"} onClick={() => setMode("jeonse")}>
                전세
              </SegBtn>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-surface-container-low rounded-full">
          <SegBtn active={axis === "area"} onClick={() => setAxis("area")}>
            면적별
          </SegBtn>
          <SegBtn active={axis === "floor"} onClick={() => setAxis("floor")}>
            층별
          </SegBtn>
        </div>

        {!hasData ? (
          <p className="text-sm text-on-surface-variant py-8 text-center">
            산점도를 그리려면 최소 3건 이상의 거래 데이터가 필요합니다.
          </p>
        ) : (
          <>
            <div className="h-56 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="x"
                    type="number"
                    name={axis === "area" ? "면적(㎡)" : "층"}
                    stroke="#75777d"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="price"
                    type="number"
                    name="가격(만원)"
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
                    formatter={(v, name) =>
                      String(name) === "가격(만원)"
                        ? formatKRW(Number(v), { compact: true })
                        : axis === "area"
                          ? `${v}㎡`
                          : `${v}층`
                    }
                  />
                  <ReferenceLine
                    y={avg}
                    stroke="#5f8aff"
                    strokeDasharray="6 3"
                    strokeWidth={1.5}
                    label={{
                      value: `평균 ${formatKRW(avg, { compact: true })}`,
                      position: "right",
                      fontSize: 10,
                      fill: "#5f8aff",
                    }}
                  />
                  <Scatter
                    data={points}
                    fill="#00113b"
                    fillOpacity={0.6}
                    r={5}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#00113b]" /> 개별 거래
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 bg-[#5f8aff]" style={{ borderTop: "2px dashed #5f8aff" }} /> 평균
              </span>
              <span className="ml-auto">
                {points.length}건 표시
                {(totalCount ?? 0) > 100 && ` (전체 ${totalCount}건)`}
              </span>
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
