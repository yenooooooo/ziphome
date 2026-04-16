"use client";

/**
 * @file ZjSummaryReportCard.tsx
 * @description 검증 결과 1장 요약 — 스크롤 전 핵심 파악용
 *   건물 기본 + 매매/전세 평균 + 간이 위험도 + 핵심 경고
 * @module components/zipjikimi/ui
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatKRW, classifyBuildingAge } from "@/lib/zipjikimi/utils/format";
import { computeQuickRiskScore } from "@/lib/zipjikimi/analysis/riskScore";
import ZjRiskBadge from "./ZjRiskBadge";
import type { ZjBuildingRecord } from "@/types/zipjikimi/building";
import type { ZjTransactionSummary } from "@/types/zipjikimi/transaction";

export interface ZjSummaryReportCardProps {
  building?: ZjBuildingRecord[];
  saleSummary?: ZjTransactionSummary;
  jeonseSummary?: ZjTransactionSummary;
}

export default function ZjSummaryReportCard({
  building,
  saleSummary,
  jeonseSummary,
}: ZjSummaryReportCardProps) {
  const primary = building?.[0];
  const age =
    primary?.builtYear !== undefined
      ? classifyBuildingAge(primary.builtYear)
      : null;

  const quickScore = useMemo(
    () => computeQuickRiskScore(primary?.builtYear, saleSummary?.records),
    [primary?.builtYear, saleSummary?.records],
  );

  // 전세가율 간이 계산 (전세 평균 / 매매 평균)
  const roughJeonseRatio =
    jeonseSummary?.avgDeposit && saleSummary?.avgPrice
      ? jeonseSummary.avgDeposit / saleSummary.avgPrice
      : null;

  const warnings: string[] = [];
  if (roughJeonseRatio !== null && roughJeonseRatio >= 0.8)
    warnings.push(`전세가율 ${Math.round(roughJeonseRatio * 100)}% — 깡통전세 주의`);
  if (age && age.years >= 30) warnings.push(`준공 ${age.years}년 — 노후 건물`);
  if (quickScore.breakdown.priceTrend >= 15)
    warnings.push("최근 6개월 시세 하락 추세");

  // 가격 변동 방향
  const trendDir = useMemo(() => {
    if (!saleSummary?.records || saleSummary.records.length < 10) return "neutral";
    const now = Date.now();
    const sixM = 6 * 30 * 24 * 60 * 60 * 1000;
    const recent: number[] = [];
    const prior: number[] = [];
    for (const r of saleSummary.records) {
      const d = new Date(r.dealYear, r.dealMonth - 1, r.dealDay ?? 15).getTime();
      const p = r.salePrice ?? r.deposit;
      if (!p) continue;
      if (now - d <= sixM) recent.push(p);
      else if (now - d <= 2 * sixM) prior.push(p);
    }
    if (recent.length < 2 || prior.length < 2) return "neutral";
    const rAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const pAvg = prior.reduce((a, b) => a + b, 0) / prior.length;
    const c = (rAvg - pAvg) / pAvg;
    if (c > 0.03) return "up";
    if (c < -0.03) return "down";
    return "neutral";
  }, [saleSummary?.records]);

  const TrendIcon =
    trendDir === "up"
      ? TrendingUp
      : trendDir === "down"
        ? TrendingDown
        : Minus;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="label-eyebrow">Quick Summary</span>
            <div className="font-headline font-bold text-lg mt-1">
              {primary?.buildingName ?? "건물 정보"}
            </div>
          </div>
          <ZjRiskBadge level={quickScore.level} size="md" />
        </div>

        {/* 핵심 정보 3열 */}
        <div className="grid grid-cols-3 gap-2">
          <MiniBlock
            icon={<Building className="h-4 w-4 text-primary" />}
            label={primary?.mainPurpose ?? "-"}
            value={age ? `${age.label} · ${age.years}년` : "-"}
          />
          <MiniBlock
            icon={<TrendIcon className="h-4 w-4 text-primary" />}
            label="매매 평균"
            value={
              saleSummary?.avgPrice
                ? formatKRW(saleSummary.avgPrice, { compact: true })
                : "-"
            }
          />
          <MiniBlock
            icon={<TrendIcon className="h-4 w-4 text-primary" />}
            label="전세 평균"
            value={
              jeonseSummary?.avgDeposit
                ? formatKRW(jeonseSummary.avgDeposit, { compact: true })
                : "-"
            }
          />
        </div>

        {/* 핵심 경고 */}
        {warnings.length > 0 && (
          <div className="space-y-1.5">
            {warnings.map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-2xl bg-error-container/50 px-4 py-2.5 text-[13px] text-on-error-container font-semibold"
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {w}
              </div>
            ))}
          </div>
        )}

        {/* 간이 위험도 한줄 */}
        <div className="flex items-center justify-between text-[12px] text-on-surface-variant">
          <span>
            간이 위험도{" "}
            <span
              className="font-headline font-bold text-base"
              style={{ color: LEVEL_COLOR[quickScore.level] }}
            >
              {quickScore.totalScore}
            </span>
            <span className="text-outline"> / 100</span>
          </span>
          <span className="text-outline">(노후도 + 추세 기준)</span>
        </div>
      </CardContent>
    </Card>
  );
}

const LEVEL_COLOR: Record<string, string> = {
  안전: "#16a34a",
  주의: "#eab308",
  위험: "#ea580c",
  매우위험: "#dc2626",
};

function MiniBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold truncate">
          {label}
        </span>
      </div>
      <div className="font-headline font-bold text-[14px] truncate">{value}</div>
    </div>
  );
}
