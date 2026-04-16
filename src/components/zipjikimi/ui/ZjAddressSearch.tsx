"use client";

/**
 * @file ZjAddressSearch.tsx
 * @description 주소 검색 입력 — 자동완성 드롭다운 (카카오 키워드+주소 검색)
 * @module components/zipjikimi/ui
 */

import { useState, useEffect, useRef, type FormEvent } from "react";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ZjAddressSearchProps {
  onSubmit?: (address: string) => void;
  placeholder?: string;
  size?: "default" | "lg";
  className?: string;
}

interface Suggestion {
  text: string;
  sub?: string;
}

export default function ZjAddressSearch({
  onSubmit,
  placeholder = "도로명 또는 지번 주소",
  size = "default",
  className,
}: ZjAddressSearchProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 디바운스 자동완성
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-keyword?q=${encodeURIComponent(q)}`);
        const json = (await res.json()) as { results: Suggestion[] };
        setSuggestions(json.results ?? []);
        setShowDropdown((json.results ?? []).length > 0);
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setValue(trimmed);
    setShowDropdown(false);
    onSubmit?.(trimmed);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(value);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      submit(suggestions[activeIdx].text);
    }
  }

  const disabled = value.trim().length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn("w-full", className)}
    >
      <div ref={containerRef} className="relative">
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
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="주소 검색"
            aria-autocomplete="list"
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

        {/* 자동완성 드롭다운 */}
        {showDropdown && suggestions.length > 0 && (
          <ul
            className="absolute z-50 top-full left-0 right-0 mt-2 glass-card rounded-2xl shadow-ambient-lg overflow-hidden"
            role="listbox"
          >
            {suggestions.map((s, i) => (
              <li key={s.text} role="option" aria-selected={i === activeIdx}>
                <button
                  type="button"
                  onClick={() => submit(s.text)}
                  className={cn(
                    "w-full text-left px-5 py-3 transition-colors",
                    i === activeIdx
                      ? "bg-primary-fixed/40"
                      : "hover:bg-surface-container-low",
                    i !== 0 && "border-t border-outline-variant/15",
                  )}
                >
                  <div className="text-[14px] font-medium truncate">{s.text}</div>
                  {s.sub && (
                    <div className="text-[11px] text-on-surface-variant truncate mt-0.5">
                      {s.sub}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
