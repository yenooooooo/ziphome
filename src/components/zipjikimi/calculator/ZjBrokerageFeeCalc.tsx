"use client";

/**
 * @file ZjBrokerageFeeCalc.tsx
 * @description F06 — 중개수수료 법정 상한 계산기 (2026년 기준)
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
import {
  computeBrokerageFee,
  type ZjFeeInput,
  type ZjFeePropertyCategory,
} from "@/lib/zipjikimi/calc/brokerageFee";
import { formatKRW } from "@/lib/zipjikimi/utils/format";

type DealType = "매매" | "전세" | "월세";

export default function ZjBrokerageFeeCalc() {
  const [dealType, setDealType] = useState<DealType>("매매");
  const [category, setCategory] = useState<ZjFeePropertyCategory>("주거");
  const [deposit, setDeposit] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<number | null>(null);

  const input: ZjFeeInput | null =
    deposit !== null
      ? {
          dealType,
          depositMan: deposit,
          monthlyRentMan: monthly ?? undefined,
          propertyCategory: category,
        }
      : null;

  const result = input ? computeBrokerageFee(input) : null;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <span className="label-eyebrow">Brokerage Fee</span>
            <div className="font-headline font-bold text-lg mt-1">중개수수료 상한</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="label-eyebrow">거래 유형</label>
              <Select value={dealType} onValueChange={(v) => setDealType(v as DealType)}>
                <SelectTrigger className="h-12 rounded-[1.5rem] bg-input border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="매매">매매</SelectItem>
                  <SelectItem value="전세">전세</SelectItem>
                  <SelectItem value="월세">월세</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="label-eyebrow">물건 유형</label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ZjFeePropertyCategory)}
              >
                <SelectTrigger className="h-12 rounded-[1.5rem] bg-input border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="주거">주거 (아파트/빌라/단독)</SelectItem>
                  <SelectItem value="오피스텔">오피스텔 (85㎡ 이하)</SelectItem>
                  <SelectItem value="기타">기타 (상가/토지/대형)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label-eyebrow">
              {dealType === "매매" ? "매매가" : "보증금"}
            </label>
            <ZjMoneyInput
              value={deposit}
              onChange={setDeposit}
              placeholder={dealType === "매매" ? "85000" : "30000"}
            />
          </div>

          {dealType === "월세" && (
            <div className="space-y-1.5">
              <label className="label-eyebrow">월세</label>
              <ZjMoneyInput value={monthly} onChange={setMonthly} placeholder="100" />
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="space-y-4">
            <div>
              <span className="label-eyebrow">Result</span>
              <div className="font-headline font-bold text-lg mt-1">계산 결과</div>
            </div>

            <div className="rounded-[2rem] bg-gradient-surface p-6 space-y-3">
              <div className="label-eyebrow">법정 상한 수수료 (1인 기준)</div>
              <div className="font-headline font-extrabold text-primary text-[2.25rem] tracking-tight leading-none">
                {result.maxFeeWon.toLocaleString()}원
              </div>
              <p className="text-xs text-on-surface-variant">{result.note}</p>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-4 grid grid-cols-3 gap-3">
              <Row label="거래금액" value={formatKRW(result.baseAmountMan, { compact: true })} />
              <Row label="요율" value={`${result.ratePct}%`} />
              <Row
                label="한도"
                value={result.cap !== null ? `${(result.cap / 10000).toFixed(0)}만` : "없음"}
              />
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              이는 법정 <strong>상한</strong>이며, 실제 수수료는 공인중개사와 협의 가능합니다.
            </p>
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
