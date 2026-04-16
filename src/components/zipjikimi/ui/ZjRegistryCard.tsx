"use client";

/**
 * @file ZjRegistryCard.tsx
 * @description F14 — 등기부등본 분석 카드
 *   - 에이픽 키 없으면 "키 필요" 안내 + 유료 설명
 *   - 키 있으면 "900원/건 조회" 버튼 → 결과 표시
 * @module components/zipjikimi/ui
 */

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/zipjikimi/utils/format";
import type { ZjRegistryAnalysis, ZjRegistryWarning } from "@/types/zipjikimi/registry";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

export interface ZjRegistryCardProps {
  address?: string;
}

const SEVERITY_STYLE: Record<ZjRegistryWarning["severity"], string> = {
  info: "bg-surface-container-low text-foreground",
  warning: "bg-tertiary-fixed text-on-tertiary-fixed",
  danger: "bg-error-container text-on-error-container",
};

export default function ZjRegistryCard({ address }: ZjRegistryCardProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ZjRegistryAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFetch() {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/registry?address=${encodeURIComponent(address)}`,
      );
      const json = (await res.json()) as ZjApiResponse<ZjRegistryAnalysis>;
      if (!json.success) {
        if (json.code === "APICK_KEY_MISSING") {
          toast.info("에이픽(Apick) API 키를 설정하면 등기부등본을 조회할 수 있습니다.");
          setError("APICK_KEY_MISSING");
        } else {
          toast.error(json.error);
          setError(json.error);
        }
      } else {
        setData(json.data);
      }
    } catch (e) {
      toast.error(String(e));
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="label-eyebrow">Registry</span>
            <div className="font-headline font-bold text-lg mt-1">등기부등본 분석</div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-primary-fixed flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-on-primary-fixed" strokeWidth={2.2} />
          </div>
        </div>

        {data ? (
          <RegistryResult data={data} />
        ) : error === "APICK_KEY_MISSING" ? (
          <div className="space-y-3">
            <div className="rounded-2xl bg-surface-container-low p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-outline shrink-0 mt-0.5" />
              <div className="text-[13px] text-on-surface-variant leading-relaxed">
                등기부등본 열람은{" "}
                <strong className="text-foreground">에이픽(Apick) 유료 API</strong>
                {" "}(건당 900원)를 사용합니다. .env.local에{" "}
                <code className="text-xs bg-surface-container px-1 py-0.5 rounded">
                  ZJ_APICK_API_KEY
                </code>{" "}
                추가 후 사용 가능.
                <br />
                <a
                  href="https://apick.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold underline underline-offset-4 mt-1 inline-block"
                >
                  에이픽 회원가입 →
                </a>
              </div>
            </div>
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              근저당 · 압류 · 가등기 · 소유자 이전 이력을 분석해 위험 요소를 자동 감지합니다.
              <br />
              <span className="text-outline text-[11px]">
                에이픽 API 건당 900원 · 결과는 앱에 저장
              </span>
            </p>
            <Button
              onClick={handleFetch}
              disabled={loading || !address}
              className="w-full"
              size="lg"
            >
              <Landmark className="h-4 w-4" />
              {loading ? "조회 중..." : "등기부등본 조회 (900원)"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RegistryResult({ data }: { data: ZjRegistryAnalysis }) {
  const LevelIcon =
    data.riskLevel === "안전"
      ? ShieldCheck
      : data.riskLevel === "매우위험" || data.riskLevel === "위험"
        ? ShieldAlert
        : AlertTriangle;

  const LEVEL_CHIP: Record<string, string> = {
    안전: "chip-safe",
    주의: "chip-caution",
    위험: "chip-danger",
    매우위험: "chip-critical",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LevelIcon className="h-5 w-5" />
          <span className="font-headline font-bold text-base">
            등기부 위험도
          </span>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold",
            LEVEL_CHIP[data.riskLevel],
          )}
        >
          {data.riskLevel}
        </span>
      </div>

      <div className="rounded-2xl bg-surface-container-low p-4 grid grid-cols-2 gap-3">
        <Stat label="소유자" value={data.ownerName ?? "-"} />
        <Stat
          label="근저당 합계"
          value={
            data.mortgageTotal
              ? formatKRW(data.mortgageTotal, { compact: true })
              : "없음"
          }
        />
        <Stat label="압류" value={data.seizureExists ? "있음 🔴" : "없음"} />
        <Stat
          label="가압류/가등기"
          value={
            data.provisionalSeizure || data.provisionalRegistration
              ? "있음 🔴"
              : "없음"
          }
        />
        <Stat
          label="전세권"
          value={data.jeonseRightExists ? "설정됨" : "없음"}
        />
        <Stat
          label="소유권 이전"
          value={
            data.ownershipChanges !== undefined
              ? `${data.ownershipChanges}회 (5년)`
              : "-"
          }
        />
      </div>

      {data.warnings.length > 0 && (
        <div className="space-y-2">
          <div className="label-eyebrow">위험 요소</div>
          {data.warnings.map((w, i) => (
            <div
              key={i}
              className={cn(
                "rounded-2xl px-4 py-3 text-[13px] font-medium leading-relaxed",
                SEVERITY_STYLE[w.severity],
              )}
            >
              <div className="font-bold text-[12px] uppercase tracking-wider mb-1">
                {w.label}
              </div>
              {w.detail}
            </div>
          ))}
        </div>
      )}

      {data.apiCost !== undefined && (
        <div className="text-[11px] text-outline text-right">
          조회 비용: {data.apiCost.toLocaleString()}원
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
        {label}
      </div>
      <div className="text-[14px] font-semibold mt-1 text-on-surface">
        {value}
      </div>
    </div>
  );
}
