"use client";

/**
 * @file checklist/page.tsx
 * @description F21 — 전세사기 예방 체크리스트 (4단계)
 * @module app/(zipjikimi)/checklist
 */

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  RotateCcw,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";
import {
  ZJ_CHECKLIST_ITEMS,
  ZJ_CHECKLIST_PHASES,
  type ZjChecklistPhase,
} from "@/constants/zipjikimi/checklistItems";
import { useChecklist } from "@/hooks/zipjikimi/useChecklist";

const PHASES: ZjChecklistPhase[] = ["pre", "during", "post", "moving"];

export default function ZjChecklistPage() {
  const { checked, toggle, reset } = useChecklist();
  const [activePhase, setActivePhase] = useState<ZjChecklistPhase>("pre");

  const total = ZJ_CHECKLIST_ITEMS.length;
  const done = checked.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const phaseItems = useMemo(
    () => ZJ_CHECKLIST_ITEMS.filter((i) => i.phase === activePhase),
    [activePhase],
  );
  const phaseDone = phaseItems.filter((i) => checked.has(i.id)).length;

  return (
    <>
      <ZjMobileHeader title="체크리스트" />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-4 md:pt-8 pb-10 space-y-6">
        <div className="space-y-2">
          <span className="label-eyebrow">Contract Safeguards</span>
          <h1 className="font-headline font-extrabold text-[1.75rem] md:text-[2.5rem] tracking-tight leading-tight">
            전세사기 예방 체크
          </h1>
        </div>

        {/* 전체 진행률 */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-headline font-extrabold text-3xl tracking-tight">
                  {pct}%
                </div>
                <div className="text-[13px] text-on-surface-variant mt-0.5">
                  {done} / {total} 항목 완료
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                초기화
              </Button>
            </div>
            <div className="h-3 bg-surface-container-low rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 이사 타임라인 바로가기 */}
        <Link
          href="/checklist/timeline"
          className="flex items-center justify-between rounded-[2rem] bg-surface-container-low p-5 active:scale-[0.99] transition-transform hover:bg-surface-container"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-primary-fixed flex items-center justify-center shrink-0">
              <CalendarDays className="h-5 w-5 text-on-primary-fixed" />
            </div>
            <div>
              <div className="font-headline font-bold text-[14px]">
                이사 타임라인
              </div>
              <div className="text-[12px] text-on-surface-variant">
                입주일 기준 D-day 할일 리스트
              </div>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-outline shrink-0" />
        </Link>

        {/* 단계 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PHASES.map((p) => {
            const meta = ZJ_CHECKLIST_PHASES[p];
            const items = ZJ_CHECKLIST_ITEMS.filter((i) => i.phase === p);
            const pDone = items.filter((i) => checked.has(i.id)).length;
            const allDone = pDone === items.length;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setActivePhase(p)}
                className={cn(
                  "shrink-0 rounded-full px-5 h-11 text-[13px] font-semibold transition-all",
                  activePhase === p
                    ? "bg-gradient-primary text-white shadow-float"
                    : allDone
                      ? "bg-risk-safe/10 text-risk-safe"
                      : "bg-surface-container-low text-on-surface-variant",
                )}
              >
                {meta.label}
                <span className="ml-1.5 text-[11px] opacity-80">
                  {pDone}/{items.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* 항목 리스트 */}
        <Card>
          <CardContent className="space-y-1">
            <div className="label-eyebrow mb-3">
              {ZJ_CHECKLIST_PHASES[activePhase].eyebrow} —{" "}
              {ZJ_CHECKLIST_PHASES[activePhase].label} ({phaseDone}/
              {phaseItems.length})
            </div>
            {phaseItems.map((item) => {
              const isDone = checked.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "w-full text-left rounded-2xl px-4 py-3.5 flex items-start gap-3 transition-all",
                    isDone
                      ? "bg-risk-safe/8"
                      : "bg-surface-container-low active:bg-surface-container",
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-risk-safe shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-outline shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "font-semibold text-[14px]",
                        isDone && "line-through text-on-surface-variant",
                      )}
                    >
                      {item.critical && !isDone && (
                        <AlertTriangle className="h-3.5 w-3.5 text-risk-danger inline mr-1.5 -mt-0.5" />
                      )}
                      {item.label}
                    </div>
                    {item.detail && (
                      <div
                        className={cn(
                          "text-[12px] text-on-surface-variant mt-0.5 leading-relaxed",
                          isDone && "line-through",
                        )}
                      >
                        {item.detail}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
