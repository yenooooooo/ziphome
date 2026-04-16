"use client";

/**
 * @file ZjAdequacyCard.tsx
 * @description F03 — 보증금 적정성 판단 (초보 친화 UX)
 *   1. "나한테 맞는 탭 자동 추천" 질문
 *   2. 입력 칸 예시 시나리오
 *   3. 결과 "쉬운 설명" 토글
 *   4. 용어 툴팁 (?)
 * @module components/zipjikimi/ui
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Home,
  Building2,
  Wallet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ZjMoneyInput from "./ZjMoneyInput";
import ZjTooltip from "./ZjTooltip";
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

const RISK_COLOR: Record<"안전" | "주의" | "위험", "safe" | "caution" | "danger"> = {
  안전: "safe",
  주의: "caution",
  위험: "danger",
};

/** 결과 레벨별 쉬운 설명 */
function getEasyExplanation(
  result: ZjAdequacyResult,
  compareType: CompareType,
): string {
  const base =
    result.level === "적정"
      ? "비슷한 집들과 비교했을 때 적당한 가격이에요."
      : result.level === "다소높음"
        ? "비슷한 집보다 약간 비싸요. 가격 협상(네고)을 시도해볼 만해요."
        : result.level === "위험"
          ? "비슷한 집보다 많이 비싸요. 다른 매물도 꼭 비교해보세요."
          : "비슷한 집보다 너무 싸요. 왜 싼지 꼭 확인하세요 — 하자가 있거나 사기일 수 있어요.";

  const jeonse =
    result.jeonseRatio?.risk === "위험"
      ? " 보증금이 집값의 80% 이상이에요. 집주인이 돈 못 갚으면 보증금 못 돌려받을 수 있어요. 반드시 전세보증보험(HUG)에 드세요."
      : result.jeonseRatio?.risk === "주의"
        ? " 보증금이 집값의 60~80%예요. 전세보증보험 가입을 권장해요."
        : "";

  const monthlyExtra =
    compareType === "월세" && result.depositRecoveryRatio
      ? result.depositRecoveryRatio.risk === "안전"
        ? " 실제 보증금은 집값 대비 충분히 낮아서 돌려받기 안전해요."
        : result.depositRecoveryRatio.risk === "주의"
          ? " 보증금이 집값 대비 좀 높아요. 보증보험 검토하세요."
          : " 보증금이 집값에 비해 높아요. 돌려받기 어려울 수 있어요."
      : "";

  return base + jeonse + monthlyExtra;
}

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
  const [compareType, setCompareType] = useState<CompareType | null>(null);
  const [conversionRate, setConversionRate] = useState<number>(0.055);
  const [showEasy, setShowEasy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/conversion-rate");
        const json = (await res.json()) as ZjApiResponse<{ conversionRate: number }>;
        if (!cancelled && json.success) setConversionRate(json.data.conversionRate);
      } catch { /* 기본값 유지 */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const areaNum = Number(myArea);
  const summary =
    compareType === "매매"
      ? saleSummary
      : compareType === "전세"
        ? jeonseSummary
        : compareType === "월세"
          ? monthlySummary
          : undefined;

  const commonAreas = useMemo(
    () => extractCommonAreas(summary?.records, 5),
    [summary?.records],
  );

  const result: ZjAdequacyResult | null = useMemo(() => {
    if (!compareType || myPrice === null || !(areaNum > 0) || !summary || summary.records.length === 0)
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
  }, [myPrice, myMonthly, areaNum, summary, builtYear, compareType, saleSummary, conversionRate]);

  const resultKey = result
    ? `${result.level}|${result.marketAverage ?? ""}|${result.diffRatio ?? ""}|${result.sampleCount}|${result.confidence}|${result.jeonseRatio?.ratio ?? ""}|${result.depositRecoveryRatio?.ratio ?? ""}`
    : "";
  useEffect(() => {
    onAssess?.(result, compareType ?? "전세");
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

        {/* ===== 1. 탭 자동 추천 질문 (미선택 시) ===== */}
        {compareType === null ? (
          <div className="space-y-3">
            <div className="font-headline font-bold text-[15px]">
              이 계약은 어떤 형태인가요?
            </div>
            <div className="grid grid-cols-1 gap-2">
              <TypeButton
                icon={<Home className="h-5 w-5" />}
                title="보증금만 냄 (전세)"
                desc="보증금 전액 내고 월세 없이 사는 방식"
                onClick={() => setCompareType("전세")}
              />
              <TypeButton
                icon={<Wallet className="h-5 w-5" />}
                title="보증금 + 매달 월세"
                desc="보증금 일부 + 매월 월세 내는 방식"
                onClick={() => setCompareType("월세")}
              />
              <TypeButton
                icon={<Building2 className="h-5 w-5" />}
                title="집 사는 거 (매매)"
                desc="집을 직접 구매하는 거래"
                onClick={() => setCompareType("매매")}
              />
            </div>
          </div>
        ) : (
          <>
            {/* 탭 전환 (선택 후) */}
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

            {/* ===== 2. 입력 + 예시 시나리오 ===== */}
            {compareType === "월세" ? (
              <>
                <div className="rounded-2xl bg-surface-container-low p-3.5 text-[12px] text-on-surface-variant leading-relaxed">
                  💡 예: 보증금 5천만원 + 매달 80만원이라면 → 아래에 <strong>5000</strong> / <strong>80</strong> 입력
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="label-eyebrow flex items-center gap-1">
                      보증금
                      <ZjTooltip text="입주할 때 집주인에게 맡기는 돈. 나갈 때 돌려받아요." />
                    </label>
                    <ZjMoneyInput value={myPrice} onChange={setMyPrice} placeholder="5000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-eyebrow flex items-center gap-1">
                      월세
                    </label>
                    <ZjMoneyInput value={myMonthly} onChange={setMyMonthly} placeholder="80" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="label-eyebrow flex items-center gap-1">
                    전용면적 (㎡)
                    <ZjTooltip text="내가 실제로 쓰는 공간 면적. 계약서에 적혀있어요." />
                  </label>
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
                  </strong>
                  <ZjTooltip text="전세↔월세 바꿀 때 쓰는 이자율. 한국은행 기준금리 + 2%." />
                  {effectiveDepositPreview !== null && (
                    <>
                      {" "}· 환산보증금{" "}
                      <strong className="text-primary">
                        {formatKRW(effectiveDepositPreview)}
                      </strong>
                      <ZjTooltip text="월세 조건을 전세로 바꾸면 얼마인지 계산한 금액. 비교 기준으로 사용." />
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl bg-surface-container-low p-3.5 text-[12px] text-on-surface-variant leading-relaxed">
                  💡 예:{" "}
                  {compareType === "매매"
                    ? "이 집을 5억에 산다면 → 아래에 50000 입력"
                    : "보증금 2억을 내고 2년 사는 조건이라면 → 아래에 20000 입력"}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="label-eyebrow flex items-center gap-1">
                      내 {compareType === "매매" ? "매매가" : "보증금"}
                      <ZjTooltip
                        text={
                          compareType === "매매"
                            ? "집을 사려고 하는 가격 (만원 단위)"
                            : "입주할 때 맡기는 돈 (만원 단위). 나갈 때 돌려받아요."
                        }
                      />
                    </label>
                    <ZjMoneyInput
                      value={myPrice}
                      onChange={setMyPrice}
                      placeholder={compareType === "매매" ? "50000" : "20000"}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-eyebrow flex items-center gap-1">
                      전용면적 (㎡)
                      <ZjTooltip text="내가 실제로 쓰는 공간 면적. 계약서에 적혀있어요." />
                    </label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={myArea}
                      onChange={(e) => setMyArea(e.target.value)}
                      placeholder="59.8"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 평형 칩 */}
            {commonAreas.length > 0 && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                  자주 거래되는 면적 (클릭하면 자동 입력)
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
                        <span className={cn("ml-1.5 text-[10px] font-bold", active ? "text-white/80" : "text-outline")}>
                          {a.count}건
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== 3+4. 결과 + 쉬운 설명 ===== */}
            {!summary || summary.records.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-2">
                비교할 {compareType} 실거래 데이터가 없습니다.
              </p>
            ) : result ? (
              <div className="rounded-[2rem] bg-gradient-surface p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="label-eyebrow">판정</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold", CONFIDENCE_CHIP[result.confidence])}>
                      표본 {result.sampleCount}건
                    </span>
                    <span className={cn("inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold", LEVEL_CHIP[result.level])}>
                      {result.level}
                    </span>
                  </div>
                </div>

                {/* 탭별 주요 지표 */}
                {compareType === "매매" && (
                  <div className="grid grid-cols-2 gap-3">
                    {result.marketAverage !== undefined && (
                      <MiniStat label="시장 평균가" value={formatKRW(result.marketAverage, { compact: true })} />
                    )}
                    {result.diffRatio !== undefined && (
                      <MiniStat
                        label="차이"
                        value={`${result.diffRatio >= 0 ? "+" : ""}${(result.diffRatio * 100).toFixed(1)}%`}
                        emphasis={result.level === "위험" ? "danger" : result.level === "다소높음" || result.level === "저평가의심" ? "caution" : undefined}
                      />
                    )}
                  </div>
                )}
                {compareType === "전세" && (
                  <div className="grid grid-cols-2 gap-3">
                    {result.marketAverage !== undefined && (
                      <MiniStat label="시장 평균 보증금" value={formatKRW(result.marketAverage, { compact: true })} />
                    )}
                    {result.jeonseRatio && (
                      <MiniStat
                        label={<>전세가율 <ZjTooltip text="보증금이 집값의 몇 %인지. 80% 넘으면 깡통전세 위험." /></>}
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
                          label={<>환산보증금 평균 <ZjTooltip text="동네 월세를 전세로 바꾸면 평균 이 금액. 내 조건과 비교." /></>}
                          value={formatKRW(result.marketAverage, { compact: true })}
                        />
                      )}
                      {result.depositRecoveryRatio && (
                        <MiniStat
                          label={<>보증금 회수율 <ZjTooltip text="내 보증금이 집값의 몇 %인지. 낮을수록 돌려받기 안전." /></>}
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
                            <ZjTooltip text="월세 조건을 전세로 바꿔서 계산한 비율. 실제 회수 대상은 보증금 원금뿐." />
                          </div>
                        </div>
                        <div className="font-headline font-bold text-sm text-on-surface shrink-0">
                          {formatRatio(result.jeonseRatio.ratio)}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 쉬운 설명 토글 */}
                <button
                  type="button"
                  onClick={() => setShowEasy((v) => !v)}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-primary"
                >
                  {showEasy ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showEasy ? "설명 접기" : "쉬운 설명 보기"}
                </button>
                {showEasy && (
                  <div className="rounded-2xl bg-primary-fixed/30 px-4 py-3.5 text-[13px] text-foreground leading-relaxed">
                    {getEasyExplanation(result, compareType)}
                  </div>
                )}

                <p className="text-[13px] text-on-surface-variant leading-relaxed">
                  {result.note}
                  {compareType === "전세" && result.jeonseRatio?.risk === "위험" && (
                    <> <strong className="text-risk-critical">전세보증보험(HUG) 필수.</strong></>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TypeButton({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 rounded-2xl bg-surface-container-low px-5 py-4 text-left active:scale-[0.99] transition-all hover:bg-surface-container"
    >
      <div className="h-11 w-11 rounded-2xl bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-headline font-bold text-[15px]">{title}</div>
        <div className="text-[12px] text-on-surface-variant mt-0.5">{desc}</div>
      </div>
    </button>
  );
}

function SegBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("px-5 h-9 rounded-full text-[13px] font-semibold transition-all", active ? "bg-surface-container-lowest shadow-float" : "text-on-surface-variant")}
    >
      {children}
    </button>
  );
}

function MiniStat({ label, value, emphasis }: { label: React.ReactNode; value: string; emphasis?: "danger" | "caution" | "safe" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold flex items-center gap-1">
        {label}
      </div>
      <div className={cn("text-base font-headline font-bold mt-1", emphasis === "danger" && "text-risk-critical", emphasis === "caution" && "text-risk-caution", emphasis === "safe" && "text-risk-safe")}>
        {value}
      </div>
    </div>
  );
}
