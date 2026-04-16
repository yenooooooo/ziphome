"use client";

/**
 * @file ZjSafetyVerificationCard.tsx
 * @description F15 + F16 통합 — 공인중개사 자격 확인 + 사업자등록 상태 확인
 *   사업자번호 입력 → 국세청 API로 상태 조회 (계속/휴업/폐업)
 *   중개사 확인은 향후 별도 API 연동 예정, 현재는 사업자 상태로 1차 검증.
 * @module components/zipjikimi/ui
 */

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

interface BusinessStatus {
  businessNumber: string;
  status: "계속사업자" | "휴업자" | "폐업자" | "알수없음";
  taxType?: string;
  closingDate?: string;
}

const STATUS_STYLE: Record<BusinessStatus["status"], { chip: string; icon: typeof CheckCircle2 }> = {
  계속사업자: { chip: "chip-safe", icon: CheckCircle2 },
  휴업자: { chip: "chip-caution", icon: AlertTriangle },
  폐업자: { chip: "chip-critical", icon: XCircle },
  알수없음: { chip: "chip-primary", icon: AlertTriangle },
};

export default function ZjSafetyVerificationCard() {
  const [bn, setBn] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BusinessStatus | null>(null);

  async function handleCheck() {
    const cleaned = bn.replace(/[^0-9]/g, "");
    if (cleaned.length !== 10) {
      toast.error("사업자번호 10자리를 입력해주세요.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessNumber: cleaned }),
      });
      const json = (await res.json()) as ZjApiResponse<BusinessStatus>;
      if (json.success) {
        setResult(json.data);
        if (json.data.status === "폐업자") {
          toast.error("⚠️ 폐업 사업자입니다! 계약 진행에 주의하세요.");
        } else if (json.data.status === "휴업자") {
          toast.warning("휴업 중인 사업자입니다. 확인 필요.");
        }
      } else {
        toast.error(json.error);
      }
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }

  function formatBn(raw: string): string {
    const d = raw.replace(/[^0-9]/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
  }

  const StatusInfo = result ? STATUS_STYLE[result.status] : null;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="label-eyebrow">Safety Check</span>
            <div className="font-headline font-bold text-lg mt-1">
              임대인 / 중개사 확인
            </div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-primary-fixed flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5 text-on-primary-fixed" strokeWidth={2.2} />
          </div>
        </div>

        <p className="text-[13px] text-on-surface-variant leading-relaxed">
          임대인 또는 공인중개사의 사업자번호를 입력하면 국세청에서 <strong>계속/휴업/폐업</strong> 상태를 실시간 조회합니다.
        </p>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={bn}
              onChange={(e) => setBn(formatBn(e.target.value))}
              placeholder="000-00-00000"
              maxLength={12}
              inputMode="numeric"
            />
          </div>
          <Button
            onClick={handleCheck}
            disabled={loading || bn.replace(/[^0-9]/g, "").length < 10}
            size="default"
          >
            <Building2 className="h-4 w-4" />
            {loading ? "조회 중" : "확인"}
          </Button>
        </div>

        {result && StatusInfo && (
          <div className="rounded-[2rem] bg-gradient-surface p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusInfo.icon className="h-5 w-5" />
                <span className="font-headline font-bold text-base">
                  사업자 상태
                </span>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold",
                  StatusInfo.chip,
                )}
              >
                {result.status}
              </span>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                  사업자번호
                </div>
                <div className="text-[14px] font-semibold mt-1">
                  {formatBn(result.businessNumber)}
                </div>
              </div>
              {result.taxType && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                    과세유형
                  </div>
                  <div className="text-[14px] font-semibold mt-1">
                    {result.taxType}
                  </div>
                </div>
              )}
              {result.closingDate && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                    폐업일
                  </div>
                  <div className="text-[14px] font-semibold mt-1 text-risk-critical">
                    {result.closingDate}
                  </div>
                </div>
              )}
            </div>
            {result.status === "폐업자" && (
              <div className="rounded-2xl bg-error-container/60 px-4 py-3 text-[13px] text-on-error-container font-semibold">
                <AlertTriangle className="h-3.5 w-3.5 inline mr-1.5" />
                폐업 사업자와 계약하면 보증금 회수가 매우 어려워집니다. 계약 재고 권장.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
