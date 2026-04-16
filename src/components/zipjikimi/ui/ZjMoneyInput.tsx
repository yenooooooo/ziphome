"use client";

/**
 * @file ZjMoneyInput.tsx
 * @description 금액 입력 필드 — 천단위 콤마 자동 포맷 + 모바일 숫자 키패드
 * @module components/zipjikimi/ui
 */

import { useState, useEffect, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ZjMoneyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  /** 만원 단위 숫자 (상위 컴포넌트 상태) */
  value: number | null;
  onChange: (value: number | null) => void;
  /** 접미 라벨 (기본: "만원") */
  suffix?: string;
  invalid?: boolean;
}

function formatComma(n: number): string {
  return n.toLocaleString("ko-KR");
}

function parseDigits(s: string): number | null {
  const cleaned = s.replace(/[^0-9]/g, "");
  if (cleaned === "") return null;
  return Number(cleaned);
}

export default function ZjMoneyInput({
  value,
  onChange,
  suffix = "만원",
  invalid,
  className,
  ...rest
}: ZjMoneyInputProps) {
  const [display, setDisplay] = useState(value !== null ? formatComma(value) : "");

  // 외부 value 변화 반영
  useEffect(() => {
    setDisplay(value !== null ? formatComma(value) : "");
  }, [value]);

  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9,]*"
        value={display}
        onChange={(e) => {
          const parsed = parseDigits(e.target.value);
          setDisplay(parsed === null ? "" : formatComma(parsed));
          onChange(parsed);
        }}
        className={cn(
          "h-12 pr-14 text-base",
          invalid && "border-destructive focus-visible:ring-destructive/40",
          className,
        )}
        {...rest}
      />
      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none select-none"
        aria-hidden
      >
        {suffix}
      </span>
    </div>
  );
}
