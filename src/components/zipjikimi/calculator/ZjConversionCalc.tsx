"use client";

/**
 * @file ZjConversionCalc.tsx
 * @description F04 — 전월세 전환 계산기 (ECOS 기준금리 자동 조회)
 * @module components/zipjikimi/calculator
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import ZjMoneyInput from "../ui/ZjMoneyInput";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  jeonseToMonthly,
  monthlyToJeonseEquivalent,
  ZJ_CONVERSION_SURCHARGE,
} from "@/lib/zipjikimi/calc/conversionRate";
import { formatKRW } from "@/lib/zipjikimi/utils/format";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

interface RateInfo {
  baseRatePct: number;
  conversionRate: number;
  effectiveDate: string;
}

export default function ZjConversionCalc() {
  const [rate, setRate] = useState<RateInfo | null>(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [manualBase, setManualBase] = useState<string>("");
  const [deposit, setDeposit] = useState<number | null>(null);
  const [keptDeposit, setKeptDeposit] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/conversion-rate");
        const json = (await res.json()) as ZjApiResponse<RateInfo>;
        if (cancelled) return;
        if (json.success) setRate(json.data);
        else toast.error(`기준금리 조회 실패: ${json.error}`);
      } catch (err) {
        toast.error(`기준금리 조회 오류: ${String(err)}`);
      } finally {
        if (!cancelled) setRateLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveBaseRate =
    manualBase && !Number.isNaN(Number(manualBase))
      ? Number(manualBase)
      : rate?.baseRatePct ?? 0;
  const surchargePct = ZJ_CONVERSION_SURCHARGE * 100;
  const annualRate = (effectiveBaseRate + surchargePct) / 100;

  const toMonthly =
    deposit !== null && keptDeposit !== null && annualRate > 0
      ? jeonseToMonthly(deposit, keptDeposit, annualRate)
      : null;

  const toJeonse =
    keptDeposit !== null && monthly !== null && annualRate > 0
      ? monthlyToJeonseEquivalent(keptDeposit, monthly, annualRate)
      : null;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <span className="label-eyebrow">Base Rate</span>
            <div className="font-headline font-bold text-lg mt-1">기준금리 + 가산율</div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                한국은행 기준금리
              </div>
              <div className="font-headline text-2xl font-extrabold mt-1 tracking-tight">
                {rateLoading
                  ? "..."
                  : rate
                    ? `연 ${rate.baseRatePct}%`
                    : "조회 실패"}
              </div>
              {rate && (
                <div className="text-xs text-on-surface-variant mt-0.5">
                  고시일:{" "}
                  {rate.effectiveDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3")}
                </div>
              )}
            </div>
            <div className="w-32 space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                수동 입력 (%)
              </div>
              <Input
                type="number"
                step="0.25"
                inputMode="decimal"
                placeholder="3.5"
                value={manualBase}
                onChange={(e) => setManualBase(e.target.value)}
                className="h-11 text-center"
              />
            </div>
          </div>
          <div className="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant leading-relaxed">
            법정 가산율 <strong className="text-foreground">{surchargePct}%</strong> 을 더해
            <br />
            <strong className="text-primary text-base font-headline">
              전환율 연 {(annualRate * 100).toFixed(2)}%
            </strong>{" "}
            로 계산합니다.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <span className="label-eyebrow">Jeonse → Monthly</span>
            <div className="font-headline font-bold text-lg mt-1">전세 → 월세 전환</div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="label-eyebrow">전세 보증금</label>
              <ZjMoneyInput value={deposit} onChange={setDeposit} placeholder="30000" />
            </div>
            <div className="space-y-1.5">
              <label className="label-eyebrow">전환 후 유지할 보증금</label>
              <ZjMoneyInput
                value={keptDeposit}
                onChange={setKeptDeposit}
                placeholder="5000"
              />
            </div>
          </div>
          {toMonthly !== null && (
            <div className="rounded-[2rem] bg-gradient-surface p-6">
              <div className="label-eyebrow">월세 금액</div>
              <div className="font-headline font-extrabold text-primary text-[2.25rem] tracking-tight leading-none mt-2">
                월 {formatKRW(toMonthly.monthlyRentMan)}
              </div>
              <div className="text-xs text-on-surface-variant mt-2">
                보증금 {formatKRW(keptDeposit)} + 월세
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <span className="label-eyebrow">Monthly → Jeonse</span>
            <div className="font-headline font-bold text-lg mt-1">월세 → 전세 환산</div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="label-eyebrow">현재 월세 보증금</label>
              <ZjMoneyInput
                value={keptDeposit}
                onChange={setKeptDeposit}
                placeholder="5000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="label-eyebrow">월세</label>
              <ZjMoneyInput value={monthly} onChange={setMonthly} placeholder="100" />
            </div>
          </div>
          {toJeonse !== null && (
            <div className="rounded-[2rem] bg-gradient-surface p-6">
              <div className="label-eyebrow">환산 전세 보증금</div>
              <div className="font-headline font-extrabold text-primary text-[2.25rem] tracking-tight leading-none mt-2">
                {formatKRW(toJeonse)}
              </div>
              <div className="text-xs text-on-surface-variant mt-2">
                전세보증보험 한도 비교용
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
