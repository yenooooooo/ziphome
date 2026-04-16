"use client";

/**
 * @file dashboard/page.tsx
 * @description F26 — 물건 관리 대시보드
 * @module app/(zipjikimi)/dashboard
 */

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Trash2,
  Search,
  ExternalLink,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatKRW } from "@/lib/zipjikimi/utils/format";
import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";
import {
  useSavedProperties,
  type ZjPropertyStatus,
} from "@/hooks/zipjikimi/useSavedProperties";

const STATUS_CHIP: Record<ZjPropertyStatus, string> = {
  검토중: "chip-primary",
  계약진행: "chip-caution",
  계약완료: "chip-safe",
  취소: "bg-surface-container text-on-surface-variant",
};

const STATUSES: ZjPropertyStatus[] = ["검토중", "계약진행", "계약완료", "취소"];

export default function ZjDashboardPage() {
  const { properties, remove, updateStatus, updateMemo } = useSavedProperties();
  const [editMemo, setEditMemo] = useState<string | null>(null);

  return (
    <>
      <ZjMobileHeader title="물건 관리" />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-4 md:pt-8 pb-10 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <span className="label-eyebrow">My Properties</span>
            <h1 className="font-headline font-extrabold text-[1.75rem] md:text-[2.5rem] tracking-tight leading-tight">
              내 물건 상태
            </h1>
          </div>
          <Link href="/property/new">
            <Button size="sm">
              <Search className="h-4 w-4" />새 물건
            </Button>
          </Link>
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <Building2 className="h-10 w-10 text-outline mx-auto" />
              <div className="font-headline font-bold text-lg">
                저장된 물건이 없습니다
              </div>
              <p className="text-sm text-on-surface-variant">
                주소 검색 결과에서 "물건 저장" 버튼을 누르면 여기에 표시됩니다.
              </p>
              <Link href="/property/new">
                <Button className="mt-2">
                  <Search className="h-4 w-4" />
                  물건 검증하러 가기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {properties.map((p) => (
              <Card key={p.id}>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-headline font-bold text-[15px] truncate">
                        {p.buildingName ?? p.addressRoad ?? p.address}
                      </div>
                      <div className="text-[12px] text-on-surface-variant truncate mt-0.5">
                        {p.address}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shrink-0",
                        STATUS_CHIP[p.status],
                      )}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {p.mainPurpose && (
                      <MiniStat label="용도" value={p.mainPurpose} />
                    )}
                    {p.avgSalePrice && (
                      <MiniStat
                        label="매매 평균"
                        value={formatKRW(p.avgSalePrice, { compact: true })}
                      />
                    )}
                    {p.avgJeonseDeposit && (
                      <MiniStat
                        label="전세 평균"
                        value={formatKRW(p.avgJeonseDeposit, { compact: true })}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={p.status}
                      onValueChange={(v) =>
                        updateStatus(p.id, v as ZjPropertyStatus)
                      }
                    >
                      <SelectTrigger className="h-9 rounded-full bg-input border-0 text-[13px] w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Link
                      href={`/property/new?q=${encodeURIComponent(p.address)}`}
                      className="h-9 w-9 rounded-full bg-surface-container-low flex items-center justify-center active:scale-95"
                      title="상세 보기"
                    >
                      <ExternalLink className="h-4 w-4 text-primary" />
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        setEditMemo(editMemo === p.id ? null : p.id)
                      }
                      className="h-9 w-9 rounded-full bg-surface-container-low flex items-center justify-center active:scale-95"
                      title="메모"
                    >
                      <StickyNote className="h-4 w-4 text-on-surface-variant" />
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="h-9 w-9 rounded-full bg-surface-container-low flex items-center justify-center active:scale-95 ml-auto"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>

                  {editMemo === p.id && (
                    <textarea
                      value={p.memo}
                      onChange={(e) => updateMemo(p.id, e.target.value)}
                      placeholder="메모를 입력하세요..."
                      className="w-full rounded-2xl bg-input p-3.5 text-[13px] resize-none h-20 outline-none focus:ring-2 focus:ring-ring/70"
                    />
                  )}

                  <div className="text-[11px] text-outline">
                    {new Date(p.savedAt).toLocaleDateString("ko-KR")} 저장
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-container-low p-2">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
        {label}
      </div>
      <div className="text-[13px] font-semibold mt-0.5 truncate">{value}</div>
    </div>
  );
}
