"use client";

/**
 * @file ZjLoanSimulator.tsx
 * @description 대출 시뮬레이션 + 전세/월세/매매 5년 총비용 비교
 * @module components/zipjikimi/calculator
 */

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ZjMoneyInput from "../ui/ZjMoneyInput";
import ZjTooltip from "../ui/ZjTooltip";
import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/zipjikimi/utils/format";

export default function ZjLoanSimulator() {
  // 공통
  const [deposit, setDeposit] = useState<number | null>(null);
  const [monthlyRent, setMonthlyRent] = useState<number | null>(null);
  const [salePrice, setSalePrice] = useState<number | null>(null);
  // 전세 대출
  const [loanAmount, setLoanAmount] = useState<number | null>(null);
  const [loanRate, setLoanRate] = useState("3.5");
  // 보증보험
  const [insuranceRate, setInsuranceRate] = useState("0.128");
  // 매매
  const [acquisitionTaxRate] = useState("1.1");
  const [holdingTaxYear] = useState("30");
  const [appreciation] = useState("2");
  const years = 5;

  const calc = useMemo(() => {
    const loan = loanAmount ?? 0;
    const rate = Number(loanRate) / 100;
    const insRate = Number(insuranceRate) / 100;
    const dep = deposit ?? 0;
    const rent = monthlyRent ?? 0;
    const sale = salePrice ?? 0;
    const acqRate = Number(acquisitionTaxRate) / 100;
    const holdTax = Number(holdingTaxYear);
    const appRate = Number(appreciation) / 100;

    // 전세 대출 월 이자 (원리금균등 근사: 연이자만 계산)
    const jeonseMonthlyInterest = Math.round((loan * rate) / 12);
    const jeonseInsuranceMonthly = Math.round((dep * insRate) / 12);
    const jeonseMonthlyTotal = jeonseMonthlyInterest + jeonseInsuranceMonthly;
    const jeonse5y = jeonseMonthlyTotal * 12 * years;

    // 월세 총비용
    const monthlyOpCost = Math.round((dep * 0.035) / 12); // 보증금 기회비용 (연 3.5%)
    const monthly5y = (rent + monthlyOpCost) * 12 * years * 10000; // 만원→원... 아니 만원 단위 유지
    const monthly5yMan = (rent + monthlyOpCost) * 12 * years;

    // 매매 총비용
    const acqTax = Math.round(sale * acqRate);
    const saleLoanInterest = Math.round((loan * rate) / 12) * 12 * years;
    const holdTaxTotal = holdTax * years;
    const appreciation5y = Math.round(sale * appRate * years);
    const sale5y = acqTax + saleLoanInterest + holdTaxTotal - appreciation5y;

    return {
      jeonseMonthlyInterest,
      jeonseInsuranceMonthly,
      jeonseMonthlyTotal,
      jeonse5y,
      monthly5yMan,
      monthlyOpCost,
      sale5y,
      acqTax,
      saleLoanInterest,
      holdTaxTotal,
      appreciation5y,
    };
  }, [deposit, monthlyRent, salePrice, loanAmount, loanRate, insuranceRate, acquisitionTaxRate, holdingTaxYear, appreciation]);

  const costs = [
    { label: "전세 (대출)", cost: calc.jeonse5y, color: "#00113b" },
    { label: "월세", cost: calc.monthly5yMan, color: "#5f8aff" },
    { label: "매매", cost: calc.sale5y, color: "#16a34a" },
  ].filter((c) => c.cost > 0);
  const minCost = costs.length > 0 ? costs.reduce((a, b) => (a.cost < b.cost ? a : b)) : null;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <span className="label-eyebrow">Loan Simulator</span>
            <div className="font-headline font-bold text-lg mt-1">
              대출 + 총비용 비교
            </div>
            <p className="text-[12px] text-on-surface-variant mt-1">
              같은 집을 전세/월세/매매로 살 때 5년간 실부담을 비교합니다.
            </p>
          </div>

          {/* 전세 */}
          <div className="rounded-2xl bg-surface-container-low p-4 space-y-3">
            <div className="font-headline font-bold text-[14px]">전세 조건</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="label-eyebrow flex items-center gap-1">
                  보증금 <ZjTooltip text="전세 계약 시 맡기는 총 금액 (만원)" />
                </label>
                <ZjMoneyInput value={deposit} onChange={setDeposit} placeholder="30000" />
              </div>
              <div className="space-y-1">
                <label className="label-eyebrow flex items-center gap-1">
                  대출금액 <ZjTooltip text="은행에서 빌리는 금액 (만원)" />
                </label>
                <ZjMoneyInput value={loanAmount} onChange={setLoanAmount} placeholder="20000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="label-eyebrow">대출 금리 (연 %)</label>
                <Input type="number" step="0.1" value={loanRate} onChange={(e) => setLoanRate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="label-eyebrow flex items-center gap-1">
                  보증보험료율 (연 %) <ZjTooltip text="HUG 기준 아파트 0.128%, 빌라 0.154%" />
                </label>
                <Input type="number" step="0.01" value={insuranceRate} onChange={(e) => setInsuranceRate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 월세 */}
          <div className="rounded-2xl bg-surface-container-low p-4 space-y-3">
            <div className="font-headline font-bold text-[14px]">월세 조건</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="label-eyebrow">보증금</label>
                <ZjMoneyInput value={deposit} onChange={setDeposit} placeholder="5000" />
              </div>
              <div className="space-y-1">
                <label className="label-eyebrow">월세</label>
                <ZjMoneyInput value={monthlyRent} onChange={setMonthlyRent} placeholder="80" />
              </div>
            </div>
          </div>

          {/* 매매 */}
          <div className="rounded-2xl bg-surface-container-low p-4 space-y-3">
            <div className="font-headline font-bold text-[14px]">매매 조건</div>
            <div className="space-y-1">
              <label className="label-eyebrow">매매가</label>
              <ZjMoneyInput value={salePrice} onChange={setSalePrice} placeholder="50000" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결과 */}
      {(calc.jeonse5y > 0 || calc.monthly5yMan > 0 || calc.sale5y > 0) && (
        <Card>
          <CardContent className="space-y-4">
            <div>
              <span className="label-eyebrow">5-Year Cost Comparison</span>
              <div className="font-headline font-bold text-lg mt-1">
                5년 총비용 비교
              </div>
            </div>

            {/* 전세 대출 월 부담 */}
            {calc.jeonseMonthlyTotal > 0 && (
              <div className="rounded-[2rem] bg-gradient-surface p-6 space-y-2">
                <div className="label-eyebrow">전세 대출 시 월 실부담</div>
                <div className="font-headline font-extrabold text-primary text-[2.25rem] tracking-tight leading-none">
                  월 {formatKRW(calc.jeonseMonthlyTotal)}
                </div>
                <div className="text-[12px] text-on-surface-variant">
                  대출이자 {formatKRW(calc.jeonseMonthlyInterest)} + 보증보험 {formatKRW(calc.jeonseInsuranceMonthly)}
                </div>
              </div>
            )}

            {/* 5년 비교 바 */}
            <div className="space-y-3">
              {costs.map((c) => {
                const maxCost = Math.max(...costs.map((x) => x.cost));
                const pct = maxCost > 0 ? (c.cost / maxCost) * 100 : 0;
                const isMin = minCost?.label === c.label;
                return (
                  <div key={c.label} className="space-y-1.5">
                    <div className="flex justify-between text-[13px]">
                      <span className={cn("font-semibold", isMin && "text-primary")}>
                        {c.label} {isMin && "👑"}
                      </span>
                      <span className="font-headline font-bold">
                        {formatKRW(c.cost, { compact: true })}
                      </span>
                    </div>
                    <div className="h-3 bg-surface-container-low rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {minCost && (
              <div className="rounded-2xl bg-primary-fixed/30 px-4 py-3.5 text-[13px] text-foreground leading-relaxed font-medium">
                이 조건에서는 <strong>{minCost.label}</strong>이(가){" "}
                <strong>
                  {formatKRW(
                    Math.max(...costs.map((c) => c.cost)) - minCost.cost,
                    { compact: true },
                  )}
                </strong>{" "}
                더 유리합니다. (5년 기준)
              </div>
            )}

            <p className="text-[11px] text-outline leading-relaxed">
              ⓘ 근사 계산입니다. 실제 대출 조건(원리금균등/원금균등), 중도상환, 세금 변동 등에 따라 달라집니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
