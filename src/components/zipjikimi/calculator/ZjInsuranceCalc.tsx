"use client";

/**
 * @file ZjInsuranceCalc.tsx
 * @description F05 — 전세보증보험 가입 가능 여부 + 보증료 계산
 * @module components/zipjikimi/calculator
 */

import { useState } from "react";
import ZjMoneyInput from "../ui/ZjMoneyInput";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  checkInsuranceEligibility,
  type ZjHouseType,
  type ZjRegionGroup,
} from "@/lib/zipjikimi/calc/insuranceCheck";
import { formatKRW } from "@/lib/zipjikimi/utils/format";

export default function ZjInsuranceCalc() {
  const [deposit, setDeposit] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<number | null>(null);
  const [priorLien, setPriorLien] = useState<number | null>(null);
  const [housePrice, setHousePrice] = useState<number | null>(null);
  const [houseType, setHouseType] = useState<ZjHouseType>("아파트");
  const [region, setRegion] = useState<ZjRegionGroup>("수도권");
  const [contractYears, setContractYears] = useState("2");

  const result =
    deposit !== null
      ? checkInsuranceEligibility({
          depositMan: deposit,
          monthlyRentMan: monthly ?? undefined,
          priorLienMan: priorLien ?? undefined,
          housePriceMan: housePrice ?? undefined,
          houseType,
          region,
          contractDays: Math.round(Number(contractYears || "2") * 365),
        })
      : null;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <span className="label-eyebrow">HUG Insurance</span>
            <div className="font-headline font-bold text-lg mt-1">
              전세보증보험 판정
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="label-eyebrow">지역</label>
              <Select
                value={region}
                onValueChange={(v) => setRegion(v as ZjRegionGroup)}
              >
                <SelectTrigger className="h-12 rounded-[1.5rem] bg-input border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="수도권">수도권 (서울/경기/인천)</SelectItem>
                  <SelectItem value="비수도권">비수도권</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="label-eyebrow">주택 유형</label>
              <Select
                value={houseType}
                onValueChange={(v) => setHouseType(v as ZjHouseType)}
              >
                <SelectTrigger className="h-12 rounded-[1.5rem] bg-input border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="아파트">아파트</SelectItem>
                  <SelectItem value="오피스텔">오피스텔</SelectItem>
                  <SelectItem value="연립다세대">연립/다세대</SelectItem>
                  <SelectItem value="단독다가구">단독/다가구</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label-eyebrow">보증금</label>
            <ZjMoneyInput value={deposit} onChange={setDeposit} placeholder="30000" />
          </div>
          <div className="space-y-1.5">
            <label className="label-eyebrow">월세 (반전세 시)</label>
            <ZjMoneyInput value={monthly} onChange={setMonthly} placeholder="50" />
          </div>
          <div className="space-y-1.5">
            <label className="label-eyebrow">선순위 담보 (근저당 등)</label>
            <ZjMoneyInput value={priorLien} onChange={setPriorLien} placeholder="10000" />
          </div>
          <div className="space-y-1.5">
            <label className="label-eyebrow">주택가액 (공시가격 / 시세)</label>
            <ZjMoneyInput
              value={housePrice}
              onChange={setHousePrice}
              placeholder="60000"
            />
          </div>
          <div className="space-y-1.5">
            <label className="label-eyebrow">계약 기간 (년)</label>
            <Input
              type="number"
              step="0.5"
              min="0.5"
              value={contractYears}
              onChange={(e) => setContractYears(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="label-eyebrow">Result</span>
                <div className="font-headline font-bold text-lg mt-1">판정 결과</div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold shrink-0",
                  result.eligible ? "chip-safe" : "chip-critical",
                )}
              >
                {result.eligible ? "가입 가능" : "가입 불가"}
              </span>
            </div>

            <div className="rounded-[2rem] bg-gradient-surface p-6 space-y-2">
              <div className="label-eyebrow">예상 보증료 (계약 전체)</div>
              <div className="font-headline font-extrabold text-primary text-[2.25rem] tracking-tight leading-none">
                {result.premiumWon.toLocaleString()}원
              </div>
              <div className="text-xs text-on-surface-variant">
                HUG 주택유형별 평균 요율 (연 {result.annualRatePct}%) 추정
              </div>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-4 grid grid-cols-2 gap-4">
              <Row
                label="환산 보증금"
                value={formatKRW(result.effectiveDepositMan, { compact: true })}
              />
              <Row
                label="부채비율"
                value={
                  result.debtRatio !== null
                    ? `${(result.debtRatio * 100).toFixed(1)}%`
                    : "-"
                }
              />
            </div>

            {result.reasons.length > 0 && (
              <div className="rounded-2xl bg-error-container/60 p-4 space-y-1.5">
                <div className="label-eyebrow text-on-error-container">
                  확인 사항
                </div>
                <ul className="space-y-1 text-sm text-on-error-container">
                  {result.reasons.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
        {label}
      </div>
      <div className="text-sm font-semibold mt-1 text-on-surface">{value}</div>
    </div>
  );
}
