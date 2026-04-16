"use client";

/**
 * @file ZjRiskScoreCard.tsx
 * @description 종합 위험 스코어 카드 (0~100) + 4축 breakdown + 액션 리스트
 *   적정성 판정 결과(F03)와 연동되어 자동 계산.
 * @module components/zipjikimi/ui
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeRiskScore,
  computeQuickRiskScore,
} from "@/lib/zipjikimi/analysis/riskScore";
import type { ZjAdequacyResult } from "@/lib/zipjikimi/analysis/priceAdequacy";
import type {
  ZjTransactionRecord,
} from "@/types/zipjikimi/transaction";
import type { ZjRiskLevel } from "@/types/zipjikimi/property";

export interface ZjRiskScoreCardProps {
  adequacy?: ZjAdequacyResult | null;
  builtYear?: number;
  saleRecords?: ZjTransactionRecord[];
  compareType: "매매" | "전세" | "월세";
}

const LEVEL_CHIP: Record<ZjRiskLevel, string> = {
  안전: "chip-safe",
  주의: "chip-caution",
  위험: "chip-danger",
  매우위험: "chip-critical",
};

const LEVEL_COLOR: Record<ZjRiskLevel, string> = {
  안전: "#16a34a",
  주의: "#eab308",
  위험: "#ea580c",
  매우위험: "#dc2626",
};

export default function ZjRiskScoreCard({
  adequacy,
  builtYear,
  saleRecords,
  compareType,
}: ZjRiskScoreCardProps) {
  const result = useMemo(
    () =>
      adequacy
        ? computeRiskScore({
            adequacy,
            builtYear,
            saleRecords,
            compareType,
          })
        : computeQuickRiskScore(builtYear, saleRecords),
    [adequacy, builtYear, saleRecords, compareType],
  );

  // 4축 최대값 (매매는 전세가율 제외하고 3축만 표시)
  const axes = compareType === "매매"
    ? [
        { label: "가격 신호", key: "price", value: result.breakdown.price, max: 25 },
        { label: "건물 노후도", key: "age", value: result.breakdown.buildingAge, max: 25 },
        { label: "가격 추세", key: "trend", value: result.breakdown.priceTrend, max: 25 },
      ]
    : [
        { label: "가격 신호", key: "price", value: result.breakdown.price, max: 25 },
        { label: "전세가율", key: "jeonse", value: result.breakdown.jeonseRatio, max: 25 },
        { label: "건물 노후도", key: "age", value: result.breakdown.buildingAge, max: 25 },
        { label: "가격 추세", key: "trend", value: result.breakdown.priceTrend, max: 25 },
      ];

  const color = LEVEL_COLOR[result.level];
  const Icon =
    result.level === "안전"
      ? ShieldCheck
      : result.level === "매우위험" || result.level === "위험"
        ? ShieldAlert
        : AlertTriangle;

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="label-eyebrow">Risk Score</span>
            <div className="font-headline font-bold text-lg mt-1">
              종합 위험 스코어
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold shrink-0",
              LEVEL_CHIP[result.level],
            )}
          >
            {result.level}
          </span>
        </div>

        {!result.complete && (
          <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-[12px] text-on-surface-variant leading-relaxed">
            <strong>간이 스코어</strong> (노후도 + 가격 추세만). 아래 적정성 판단에 <strong>금액 + 면적</strong> 입력하면 4축 풀 스코어로 자동 전환.
          </div>
        )}
        <>
            {/* 원형 스코어 게이지 */}
            <div className="rounded-[2rem] bg-gradient-surface p-6 flex items-center gap-5">
              <div className="relative h-28 w-28 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    className="text-surface-container"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.totalScore / 100) * 263.9} 263.9`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div
                    className="font-headline text-[2rem] font-extrabold leading-none"
                    style={{ color }}
                  >
                    {result.totalScore}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mt-0.5">
                    / 100
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                  <Icon className="h-3.5 w-3.5" />
                  Overall
                </div>
                <div
                  className="font-headline font-extrabold text-2xl mt-1 tracking-tight"
                  style={{ color }}
                >
                  {result.level}
                </div>
                <div className="text-[12px] text-on-surface-variant mt-1 leading-relaxed">
                  높을수록 위험. 4개 축 가중 합산.
                </div>
              </div>
            </div>

            {/* 4축 breakdown */}
            <div className="space-y-3">
              <div className="label-eyebrow">Breakdown</div>
              {axes.map((a) => {
                const pct = Math.round((a.value / a.max) * 100);
                const pctColor =
                  pct >= 75
                    ? "bg-risk-critical"
                    : pct >= 50
                      ? "bg-risk-danger"
                      : pct >= 30
                        ? "bg-risk-caution"
                        : "bg-risk-safe";
                return (
                  <div key={a.key} className="space-y-1.5">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-semibold">{a.label}</span>
                      <span className="text-on-surface-variant font-medium">
                        {a.value} / {a.max}
                      </span>
                    </div>
                    <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", pctColor)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 권고 액션 */}
            {result.actions.length > 0 && (
              <div className="space-y-2">
                <div className="label-eyebrow">권고 액션</div>
                <ul className="space-y-2">
                  {result.actions.map((a, i) => (
                    <li
                      key={i}
                      className="rounded-2xl bg-surface-container-low px-4 py-3 text-[13px] leading-relaxed text-foreground"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </>
      </CardContent>
    </Card>
  );
}
