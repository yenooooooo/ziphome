"use client";

/**
 * @file checklist/timeline/page.tsx
 * @description F23 — 이사 체크리스트 타임라인
 *   계약일/입주일 입력 → D-day 기준 할일 세로 타임라인
 * @module app/(zipjikimi)/checklist/timeline
 */

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";

interface TimelineItem {
  id: string;
  daysFromMove: number;
  label: string;
  detail: string;
  critical?: boolean;
}

const TIMELINE: TimelineItem[] = [
  { id: "t-01", daysFromMove: -30, label: "이사 업체 예약", detail: "성수기(3~4월, 9~10월)는 1개월+ 전 예약 권장." },
  { id: "t-02", daysFromMove: -14, label: "인터넷/TV 이전 신청", detail: "통신사 고객센터 또는 앱에서 이전 날짜 지정." },
  { id: "t-03", daysFromMove: -7, label: "전입신고 서류 준비", detail: "임대차계약서, 신분증. 정부24 온라인 전입신고 가능." },
  { id: "t-04", daysFromMove: -7, label: "전세보증보험 서류 준비", detail: "HUG: 등기부등본, 확정일자, 임대차계약서 필요." },
  { id: "t-05", daysFromMove: -3, label: "잔금 준비 확인", detail: "잔금 송금 계좌(임대인 본인 명의) 재확인." },
  { id: "t-06", daysFromMove: -1, label: "등기부등본 최종 확인", detail: "잔금 전일 또는 당일 아침 — 근저당 추가 없는지.", critical: true },
  { id: "t-07", daysFromMove: 0, label: "잔금 송금 + 열쇠 수령", detail: "송금 확인 후 열쇠. 영수증 수령.", critical: true },
  { id: "t-08", daysFromMove: 0, label: "이사 + 전기/가스/수도 검침", detail: "이전 사용량 검침 사진 촬영. 이사 업체 영수증.", critical: true },
  { id: "t-09", daysFromMove: 0, label: "전입신고 (당일)", detail: "주민센터 또는 정부24. 입주 당일 필수!", critical: true },
  { id: "t-10", daysFromMove: 0, label: "확정일자 (당일)", detail: "전입신고와 동시. 대항력 + 우선변제권 확보.", critical: true },
  { id: "t-11", daysFromMove: 1, label: "전세보증보험 가입 신청", detail: "전입+확정일자 완료 후 신청. HUG 1566-9009." },
  { id: "t-12", daysFromMove: 7, label: "하자 점검 + 사진 촬영", detail: "누수, 곰팡이, 보일러 등. 발견 즉시 임대인에게 내용증명." },
  { id: "t-13", daysFromMove: 14, label: "주소 변경 (각종 기관)", detail: "은행, 카드, 보험, 면허증, 건강보험, 국민연금." },
  { id: "t-14", daysFromMove: 30, label: "임대차 신고", detail: "보증금 6천만/월세 30만 초과 시 30일 이내 신고 의무." },
  { id: "t-15", daysFromMove: 30, label: "우편물 전달 신청", detail: "우체국 방문 — 6개월간 구주소 우편 전달." },
];

function formatDate(base: Date, daysOffset: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + daysOffset);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ZjTimelinePage() {
  const [moveDate, setMoveDate] = useState<string>("");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const base = useMemo(() => {
    if (!moveDate) return null;
    const d = new Date(moveDate);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [moveDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function toggleItem(id: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <ZjMobileHeader
        title="이사 타임라인"
        left={
          <a
            href="/checklist"
            className="text-[13px] text-primary font-semibold"
          >
            <ArrowRight className="h-4 w-4 rotate-180 inline" /> 체크리스트
          </a>
        }
      />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-4 md:pt-8 pb-10 space-y-6">
        <div className="space-y-2">
          <span className="label-eyebrow">Moving Timeline</span>
          <h1 className="font-headline font-extrabold text-[1.75rem] md:text-[2.5rem] tracking-tight leading-tight">
            이사 타임라인
          </h1>
        </div>

        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 space-y-1.5">
                <label className="label-eyebrow">입주일 (이사날)</label>
                <Input
                  type="date"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                />
              </div>
            </div>
            {!base && (
              <p className="text-[13px] text-on-surface-variant">
                입주일을 선택하면 D-day 기준 할일 타임라인이 표시됩니다.
              </p>
            )}
          </CardContent>
        </Card>

        {base && (
          <div className="relative pl-8">
            {/* 세로선 */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-surface-container" />

            <div className="space-y-4">
              {TIMELINE.map((item) => {
                const itemDate = new Date(base);
                itemDate.setDate(itemDate.getDate() + item.daysFromMove);
                itemDate.setHours(0, 0, 0, 0);
                const isPast = itemDate.getTime() < today.getTime();
                const isToday =
                  itemDate.getTime() === today.getTime();
                const isDone = checkedItems.has(item.id);
                const dLabel =
                  item.daysFromMove === 0
                    ? "D-Day"
                    : item.daysFromMove < 0
                      ? `D${item.daysFromMove}`
                      : `D+${item.daysFromMove}`;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="w-full text-left relative"
                  >
                    {/* 점 */}
                    <div
                      className={cn(
                        "absolute -left-8 top-3 h-3 w-3 rounded-full border-2 border-background",
                        isDone
                          ? "bg-risk-safe"
                          : isToday
                            ? "bg-primary"
                            : isPast
                              ? "bg-outline"
                              : "bg-surface-container-high",
                      )}
                    />

                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3.5 transition-all",
                        isDone
                          ? "bg-risk-safe/8"
                          : isToday
                            ? "bg-primary-fixed/40"
                            : "bg-surface-container-low active:bg-surface-container",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-risk-safe" />
                          ) : (
                            <Circle className="h-4 w-4 text-outline" />
                          )}
                          <span
                            className={cn(
                              "text-[11px] font-bold uppercase tracking-wider",
                              isToday
                                ? "text-primary"
                                : "text-on-surface-variant",
                            )}
                          >
                            {dLabel} · {formatDate(base, item.daysFromMove)}
                          </span>
                        </div>
                        {item.critical && !isDone && (
                          <span className="text-[10px] font-bold bg-error-container text-on-error-container rounded-full px-2 py-0.5">
                            필수
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "font-semibold text-[14px]",
                          isDone && "line-through text-on-surface-variant",
                        )}
                      >
                        {item.label}
                      </div>
                      <div
                        className={cn(
                          "text-[12px] text-on-surface-variant mt-0.5",
                          isDone && "line-through",
                        )}
                      >
                        {item.detail}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
