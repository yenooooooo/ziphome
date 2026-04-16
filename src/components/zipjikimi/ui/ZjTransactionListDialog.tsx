"use client";

/**
 * @file ZjTransactionListDialog.tsx
 * @description 실거래 내역 전체 조회 모달 — 페이지네이션 포함
 * @module components/zipjikimi/ui
 */

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatKRW, formatArea } from "@/lib/zipjikimi/utils/format";
import type { ZjTransactionRecord } from "@/types/zipjikimi/transaction";

export interface ZjTransactionListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: ZjTransactionRecord[];
  title?: string;
  /** 매매 / 전월세 — 가격 표시 선택 */
  mode: "sale" | "rent";
}

const PAGE_SIZE = 20;

export default function ZjTransactionListDialog({
  open,
  onOpenChange,
  records,
  title,
  mode,
}: ZjTransactionListDialogProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));

  // 모달 열릴 때마다 1페이지로 초기화
  useEffect(() => {
    if (open) setPage(1);
  }, [open]);

  const visible = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return records.slice(start, start + PAGE_SIZE);
  }, [records, page]);

  // 페이지 번호 윈도우 (현재 ±2, 최대 5개)
  const pageWindow = useMemo(() => {
    const half = 2;
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] p-0 rounded-[2rem] overflow-hidden flex flex-col gap-0 border-0 shadow-ambient-lg"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 pt-6 pb-4 flex-row items-center justify-between space-y-0">
          <DialogTitle className="font-headline text-lg font-bold tracking-tight">
            {title ?? "실거래 내역 전체"}
            <span className="ml-2 text-xs font-semibold text-on-surface-variant">
              {records.length}건
            </span>
          </DialogTitle>
          <DialogClose
            className="h-9 w-9 rounded-full bg-surface-container-low flex items-center justify-center active:scale-95 transition-transform"
            aria-label="닫기"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {records.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-8 text-center">
              거래 내역이 없습니다.
            </p>
          ) : (
            <ul className="space-y-2 pb-2">
              {visible.map((r, i) => {
                const price =
                  mode === "sale"
                    ? r.salePrice
                    : r.deposit;
                return (
                  <li
                    key={`${r.dealYear}-${r.dealMonth}-${r.dealDay}-${i}`}
                    className="rounded-2xl bg-surface-container-low px-4 py-3 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-headline font-bold text-[15px] truncate">
                        {price ? formatKRW(price, { compact: true }) : "-"}
                        {r.monthlyRent && r.monthlyRent > 0 && (
                          <span className="text-on-surface-variant font-medium ml-1 text-[13px]">
                            / 월 {r.monthlyRent.toLocaleString()}만
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-on-surface-variant mt-1 truncate">
                        {r.buildingName ?? "-"}
                        {r.jibun && ` · ${r.jibun}`}
                      </div>
                      <div className="text-[11px] text-outline mt-0.5 truncate">
                        {r.dealYear}.{String(r.dealMonth).padStart(2, "0")}
                        {r.dealDay && `.${String(r.dealDay).padStart(2, "0")}`}
                        {r.floor !== undefined && ` · ${r.floor}층`}
                        {r.areaM2 && ` · ${formatArea(r.areaM2)}`}
                        {r.builtYear && ` · ${r.builtYear}년 준공`}
                      </div>
                    </div>
                    {r.contractType && (
                      <span className="shrink-0 text-[10px] font-bold bg-surface-container rounded-full px-2 py-0.5 text-on-surface-variant">
                        {r.contractType}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-outline-variant/20 flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 w-9 rounded-full bg-surface-container-low flex items-center justify-center disabled:opacity-40 active:scale-95"
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageWindow[0] > 1 && (
              <>
                <PageBtn num={1} active={page === 1} onClick={() => setPage(1)} />
                {pageWindow[0] > 2 && (
                  <span className="px-1 text-outline text-sm">…</span>
                )}
              </>
            )}
            {pageWindow.map((n) => (
              <PageBtn
                key={n}
                num={n}
                active={page === n}
                onClick={() => setPage(n)}
              />
            ))}
            {pageWindow[pageWindow.length - 1] < totalPages && (
              <>
                {pageWindow[pageWindow.length - 1] < totalPages - 1 && (
                  <span className="px-1 text-outline text-sm">…</span>
                )}
                <PageBtn
                  num={totalPages}
                  active={page === totalPages}
                  onClick={() => setPage(totalPages)}
                />
              </>
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-9 w-9 rounded-full bg-surface-container-low flex items-center justify-center disabled:opacity-40 active:scale-95"
              aria-label="다음 페이지"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PageBtn({
  num,
  active,
  onClick,
}: {
  num: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 min-w-9 px-2.5 rounded-full text-[13px] font-semibold transition-all",
        active
          ? "bg-gradient-primary text-white shadow-float"
          : "bg-surface-container-low text-on-surface-variant active:scale-95",
      )}
      aria-current={active ? "page" : undefined}
    >
      {num}
    </button>
  );
}
