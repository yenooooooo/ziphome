"use client";

/**
 * @file ZjAdequacyCard.tsx
 * @description F03 — 보증금 적정성 판단 (전세/매매/월세 탭별 UX 분리)
 *   - 매매: 시장 평균가 대비 고·저평가
 *   - 전세: 평균 보증금 + 전세가율 (깡통전세 경고)
 *   - 월세: 환산보증금 적정성 + 실제 보증금 회수 비율 (환산 전세가율은 참고)
 * @module components/zipjikimi/ui
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ZjMoneyInput from "./ZjMoneyInput";
import { cn } from "@/lib/utils";
import {
  assessPriceAdequacy,
  extractCommonAreas,
  type ZjAdequacyResult,
  type ZjConfidence,
} from "@/lib/zipjikimi/analysis/priceAdequacy";
import { formatKRW, formatRatio } from "@/lib/zipjikimi/utils/format";
import type { ZjPriceAdequacy } from "@/types/zipjikimi/property";
import type { ZjTransactionSummary } from "@/types/zipjikimi/transaction";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

export interface ZjAdequacyCardProps {
  saleSummary?: ZjTransactionSummary;
  jeonseSummary?: ZjTransactionSummary;
  monthlySummary?: ZjTransactionSummary;
  builtYear?: number;
  onAssess?: (
    result: ZjAdequacyResult | null,
    compareType: "매매" | "전세" | "월세",
  ) => void;
}

type CompareType = "전세" | "매매" | "월세";

const LEVEL_CHIP: Record<ZjPriceAdequacy, string> = {
  적정: "chip-safe",
  다소높음: "chip-caution",
  위험: "chip-danger",
  저평가의심: "chip-caution",
};

const CONFIDENCE_CHIP: Record<ZjConfidence, string> = {
  높음: "chip-safe",
  보통: "chip-primary",
  낮음: "chip-caution",
  부족: "chip-danger",
};

const TAB_INTRO: Record<CompareType, string> = {
  매매: "매매가가 동일 평형 시세와 비교해 고평가·저평가인지 판정합니다.",
  전세: "전세 보증금 + 깡통전세 위험(전세가율)을 평가합니다. 보증금 전액 회수가 핵심.",
  월세: "환산보증금으로 조건을 평가하고, 실제 보증금 회수 가능성(원금 기준)을 따로 표시합니다.",
};

const RISK_COLOR: Record<"안전" | "주의" | "위험", "safe" | "caution" | "danger"> = {
  안전: "safe",
  주의: "caution",
  위험: "danger",
};

export default function ZjAdequacyCard({
  saleSummary,
  jeonseSummary,
  monthlySummary,
  builtYear,
  onAssess,
}: ZjAdequacyCardProps) {
  const [myPrice, setMyPrice] = useState<number | null>(null);
  const [myMonthly, setMyMonthly] = useState<number | null>(null);
  const [myArea, setMyArea] = useState<string>("");
  const [compareType, setCompareType] = useState<CompareType>("전세");
  const [conversionRate, setConversionRate] = useState<number>(0.055);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/conversion-rate");
        const json = (await res.json()) as ZjApiResponse<{ conversionRate: number }>;
        if (!cancelled && json.success) setConversionRate(json.data.conversionRate);
      } catch {
        /* 기본값 유지 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const areaNum = Number(myArea);
  const summary =
    compareType === "매매"
      ? saleSummary
      : compareType === "전세"
        ? jeonseSummary
        : monthlySummary;

  const commonAreas = useMemo(
    () => extractCommonAreas(summary?.records, 5),
    [summary?.records],
  );

  const result: ZjAdequacyResult | null = useMemo(() => {
    if (myPrice === null || !(areaNum > 0) || !summary || summary.records.length === 0)
      return null;
    if (compareType === "월세" && (myMonthly === null || myMonthly === 0)) return null;
    return assessPriceAdequacy({
      inputPriceMan: myPrice,
      inputMonthlyRentMan: myMonthly ?? undefined,
      areaM2: areaNum,
      builtYear,
      compareType,
      compareSummary: summary,
      saleSummary,
      conversionRate,
    });
  }, [
    myPrice,
    myMonthly,
    areaNum,
    summary,
    builtYear,
    compareType,
    saleSummary,
    conversionRate,
  ]);

  const resultKey = result
    ? `${result.level}|${result.marketAverage ?? ""}|${result.diffRatio ?? ""}|${result.sampleCount}|${result.confidence}|${result.jeonseRatio?.ratio ?? ""}|${result.depositRecoveryRatio?.ratio ?? ""}`
    : "";
  useEffect(() => {
    onAssess?.(result, compareType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultKey, compareType]);

  const effectiveDepositPreview =
    compareType === "월세" && myPrice !== null && myMonthly !== null && myMonthly > 0
      ? Math.round(myPrice + (myMonthly * 12) / conversionRate)
      : null;

  return (
    <Card>
      <CardContent className="space-y-5">
        <div>
          <span className="label-eyebrow">Safety Grade</span>
          <div className="font-headline font-bold text-lg mt-1">
            보증금 적정성 판단
          </div>
        </div>

        {/* 탭 */}
        <div className="inline-flex items-center gap-1 p-1 bg-surface-container-low rounded-full">
          <SegBtn active={compareType === "전세"} onClick={() => setCompareType("전세")}>
            전세
          </SegBtn>
          <SegBtn active={compareType === "매매"} onClick={() => setCompareType("매매")}>
            매매
          </SegBtn>
          <SegBtn active={compareType === "월세"} onClick={() => setCompareType("월세")}>
            월세
          </SegBtn>
        </div>

        {/* 탭별 설명 */}
        <p className="text-[13px] text-on-surface-variant leading-relaxed">
          {TAB_INTRO[compareType]}
        </p>

        {/* 입력 */}
        {compareType === "월세" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="label-eyebrow">보증금</label>
                <ZjMoneyInput value={myPrice} onChange={setMyPrice} placeholder="5000" />
              </div>
              <div className="space-y-1.5">
                <label className="label-eyebrow">월세</label>
                <ZjMoneyInput value={myMonthly} onChange={setMyMonthly} placeholder="80" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label-eyebrow">전용면적 (㎡)</label>
              <Input
                type="number"
                inputMode="decimal"
                value={myArea}
                onChange={(e) => setMyArea(e.target.value)}
                placeholder="59.8"
              />
            </div>
            <div className="rounded-2xl bg-surface-container-low p-3.5 text-[12px] text-on-surface-variant leading-relaxed">
              적용 전환율{" "}
              <strong className="text-foreground">
                연 {(conversionRate * 100).toFixed(2)}%
              </strong>{" "}
              (기준금리 + 2%)
              {effectiveDepositPreview !== null && (
                <>
                  {" "}
                  · 환산보증금{" "}
                  <strong className="text-primary">
                    {formatKRW(effectiveDepositPreview)}
                  </strong>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="label-eyebrow">
                내 {compareType === "매매" ? "매매가" : "보증금"}
              </label>
              <ZjMoneyInput
                value={myPrice}
                onChange={setMyPrice}
                placeholder={compareType === "매매" ? "85000" : "30000"}
              />
            </div>
            <div className="space-y-1.5">
              <label className="label-eyebrow">전용면적 (㎡)</label>
              <Input
                type="number"
                inputMode="decimal"
                value={myArea}
                onChange={(e) => setMyArea(e.target.value)}
                placeholder="59.8"
              />
            </div>
          </div>
        )}

        {/* 평형 칩 */}
        {commonAreas.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
              자주 거래되는 면적
            </div>
            <div className="flex flex-wrap gap-2">
              {commonAreas.map((a) => {
                const active = Math.round(Number(myArea)) === a.areaM2;
                return (
                  <button
                    key={a.areaM2}
                    type="button"
                    onClick={() => setMyArea(String(a.areaM2))}
                    className={cn(
                      "rounded-full px-3.5 h-9 text-[13px] font-semibold transition-all",
                      active
                        ? "bg-gradient-primary text-white shadow-float"
                        : "bg-surface-container-low text-on-surface-variant active:scale-95",
                    )}
                  >
                    {a.pyeong}평 · {a.areaM2}㎡
                    <span
                      className={cn(
                        "ml-1.5 text-[10px] font-bold",
                        active ? "text-white/80" : "text-outline",
                      )}
                    >
                      {a.count}건
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 결과 */}
        {!summary || summary.records.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-2">
            비교할 {compareType} 실거래 데이터가 없습니다.
          </p>
        ) : result ? (
          <div className="rounded-[2rem] bg-gradient-surface p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="label-eyebrow">판정</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold",
                    CONFIDENCE_CHIP[result.confidence],
                  )}
                >
                  신뢰도 {result.confidence} · {result.sampleCount}건
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold",
                    LEVEL_CHIP[result.level],
                  )}
                >
                  {result.level}
                </span>
              </div>
            </div>

            {/* 탭별 주요 지표 */}
            {compareType === "매매" && (
              <div className="grid grid-cols-2 gap-3">
                {result.marketAverage !== undefined && (
                  <MiniStat
                    label="시장 평균가"
                    value={formatKRW(result.marketAverage, { compact: true })}
                  />
                )}
                {result.diffRatio !== undefined && (
                  <MiniStat
                    label="차이"
                    value={`${result.diffRatio >= 0 ? "+" : ""}${(result.diffRatio * 100).toFixed(1)}%`}
                    emphasis={
                      result.level === "위험"
                        ? "danger"
                        : result.level === "다소높음" ||
                            result.level === "저평가의심"
                          ? "caution"
                          : undefined
                    }
                  />
                )}
              </div>
            )}

            {compareType === "전세" && (
              <div className="grid grid-cols-2 gap-3">
                {result.marketAverage !== undefined && (
                  <MiniStat
                    label="시장 평균 보증금"
                    value={formatKRW(result.marketAverage, { compact: true })}
                  />
                )}
                {result.jeonseRatio && (
                  <MiniStat
                    label={`전세가율${
                      result.jeonseRatioBasis === "전체평균" ? " (전체)" : ""
                    }`}
                    value={`${formatRatio(result.jeonseRatio.ratio)} · ${result.jeonseRatio.risk}`}
                    emphasis={RISK_COLOR[result.jeonseRatio.risk] === "safe" ? undefined : RISK_COLOR[result.jeonseRatio.risk]}
                  />
                )}
              </div>
            )}

            {compareType === "월세" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {result.marketAverage !== undefined && (
                    <MiniStat
                      label="평균 환산보증금"
                      value={formatKRW(result.marketAverage, { compact: true })}
                    />
                  )}
                  {result.depositRecoveryRatio && (
                    <MiniStat
                      label="보증금 회수 비율 (실질)"
                      value={`${formatRatio(result.depositRecoveryRatio.ratio)} · ${result.depositRecoveryRatio.risk}`}
                      emphasis={RISK_COLOR[result.depositRecoveryRatio.risk] === "safe" ? undefined : RISK_COLOR[result.depositRecoveryRatio.risk]}
                    />
                  )}
                </div>
                {result.jeonseRatio && (
                  <div className="rounded-2xl bg-surface-container-low px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                        환산 전세가율 <span className="text-outline">(참고)</span>
                      </div>
                      <div className="text-[11px] text-outline mt-0.5">
                        환산보증금 기준. 실제 회수 대상은 보증금 원금.
                      </div>
                    </div>
                    <div className="font-headline font-bold text-sm text-on-surface shrink-0">
                      {formatRatio(result.jeonseRatio.ratio)}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 탭별 해설 */}
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              {result.note}
              {compareType === "월세" && result.depositRecoveryRatio && (
                <>
                  {" "}
                  실제 회수 대상인 <strong>보증금 원금</strong>은 매매 시세의{" "}
                  {formatRatio(result.depositRecoveryRatio.ratio)} 수준 —{" "}
                  <strong
                    className={cn(
                      result.depositRecoveryRatio.risk === "위험" && "text-risk-critical",
                      result.depositRecoveryRatio.risk === "주의" && "text-risk-caution",
                      result.depositRecoveryRatio.risk === "안전" && "text-risk-safe",
                    )}
                  >
                    {result.depositRecoveryRatio.risk}
                  </strong>
                  .
                </>
              )}
              {compareType === "전세" && result.jeonseRatio?.risk === "위험" && (
                <>
                  {" "}
                  <strong className="text-risk-critical">
                    전세보증보험(HUG) 필수 가입 검토.
                  </strong>
                </>
              )}
            </p>

            <div className="text-[11px] text-outline pt-1 border-t border-outline-variant/20">
              비교 기준: {result.filterDescription}
              {compareType === "월세" && " · 환산보증금 기준"}
            </div>
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant py-2">
            {compareType === "월세"
              ? "보증금 · 월세 · 면적을 모두 입력하면 판정이 표시됩니다."
              : "금액과 면적을 입력하면 판정이 표시됩니다."}
          </p>
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
        "px-5 h-9 rounded-full text-[13px] font-semibold transition-all",
        active
          ? "bg-surface-container-lowest shadow-float"
          : "text-on-surface-variant",
      )}
    >
      {children}
    </button>
  );
}

function MiniStat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: "danger" | "caution" | "safe";
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
        {label}
      </div>
      <div
        className={cn(
          "text-base font-headline font-bold mt-1",
          emphasis === "danger" && "text-risk-critical",
          emphasis === "caution" && "text-risk-caution",
          emphasis === "safe" && "text-risk-safe",
        )}
      >
        {value}
      </div>
    </div>
  );
}
