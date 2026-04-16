"use client";

/**
 * @file ZjAddressSearch.tsx
 * @description 주소 검색 입력 — Guardian's Lens 프리미엄 스타일 (필 형태)
 * @module components/zipjikimi/ui
 */

import { useState, type FormEvent } from "react";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ZjAddressSearchProps {
  onSubmit?: (address: string) => void;
  placeholder?: string;
  /** 큰 사이즈 (히어로 영역용) */
  size?: "default" | "lg";
  className?: string;
}

export default function ZjAddressSearch({
  onSubmit,
  placeholder = "도로명 또는 지번 주소",
  size = "default",
  className,
}: ZjAddressSearchProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
  }

  const disabled = value.trim().length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "relative flex items-center bg-surface-container-highest rounded-full shadow-ambient",
          size === "lg" ? "h-16 pl-6 pr-2" : "h-14 pl-5 pr-2",
        )}
      >
        <Search
          className="h-5 w-5 text-outline shrink-0 mr-3"
          aria-hidden
          strokeWidth={2}
        />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="주소 검색"
          className={cn(
            "flex-1 bg-transparent outline-none text-foreground placeholder:text-outline",
            size === "lg" ? "text-base" : "text-[15px]",
          )}
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={disabled}
          aria-label="검색"
          className={cn(
            "shrink-0 rounded-full bg-gradient-primary text-white transition-all",
            "flex items-center justify-center shadow-float",
            "disabled:opacity-40 disabled:shadow-none active:scale-95 hover:brightness-110",
            size === "lg" ? "h-12 w-12" : "h-10 w-10",
          )}
        >
          <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}
