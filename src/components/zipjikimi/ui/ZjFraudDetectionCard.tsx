"use client";

/**
 * @file ZjFraudDetectionCard.tsx
 * @description F17 — 사기 위험 탐지 카드 (기존 데이터 기반 자동 분석)
 * @module components/zipjikimi/ui
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { detectFraudFromSummaries } from "@/lib/zipjikimi/analysis/fraudDetection";
import type { ZjTransactionSummary } from "@/types/zipjikimi/transaction";
import type { ZjFraudSignal } from "@/lib/zipjikimi/analysis/fraudDetection";

export interface ZjFraudDetectionCardProps {
  saleSummary?: ZjTransactionSummary;
  jeonseSummary?: ZjTransactionSummary;
  buildingAge?: number;
}

const LEVEL_CHIP: Record<string, string> = {
  안전: "chip-safe",
  주의: "chip-caution",
  위험: "chip-danger",
};

const SEVERITY_ICON: Record<ZjFraudSignal["severity"], typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  danger: ShieldAlert,
};

const SEVERITY_STYLE: Record<ZjFraudSignal["severity"], string> = {
  info: "bg-surface-container-low text-foreground",
  warning: "bg-tertiary-fixed text-on-tertiary-fixed",
  danger: "bg-error-container text-on-error-container",
};

export default function ZjFraudDetectionCard({
  saleSummary,
  jeonseSummary,
  buildingAge,
}: ZjFraudDetectionCardProps) {
  const result = useMemo(
    () => detectFraudFromSummaries(saleSummary, jeonseSummary, buildingAge),
    [saleSummary, jeonseSummary, buildingAge],
  );

  const LevelIcon =
    result.level === "안전" ? ShieldCheck : result.level === "위험" ? ShieldAlert : AlertTriangle;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="label-eyebrow">Fraud Detection</span>
            <div className="font-headline font-bold text-lg mt-1">
              사기 위험 탐지
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

        {result.signals.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low p-5 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-risk-safe shrink-0" />
            <div>
              <div className="font-headline font-bold text-[14px]">특이 사항 없음</div>
              <div className="text-[12px] text-on-surface-variant mt-0.5">
                현재 데이터 기반으로 사기 위험 신호가 감지되지 않았습니다.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {result.signals.map((s) => {
              const SIcon = SEVERITY_ICON[s.severity];
              return (
                <div
                  key={s.id}
                  className={cn(
                    "rounded-2xl px-4 py-3.5 space-y-1",
                    SEVERITY_STYLE[s.severity],
                  )}
                >
                  <div className="flex items-center gap-2 font-bold text-[12px] uppercase tracking-wider">
                    <SIcon className="h-3.5 w-3.5" />
                    {s.label}
                  </div>
                  <div className="text-[13px] leading-relaxed">{s.detail}</div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-outline leading-relaxed">
          데이터 기반 자동 탐지. 등기부등본(F14) 연동 시 근저당·압류·소유권 이전 분석이 추가됩니다.
        </p>
      </CardContent>
    </Card>
  );
}
