"use client";

/**
 * @file ZjBottomTabBar.tsx
 * @description 모바일 하단 글래스모피즘 플로팅 네비 — Guardian's Lens 디자인
 *   - 풀 너비 글래스 바 + iOS Safe Area 반영
 *   - 활성: primary 네이비 · 비활성: outline
 * @module components/zipjikimi/layout
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Building2,
  ClipboardCheck,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ZjTab {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPrefix?: string;
}

const TABS: ZjTab[] = [
  { label: "홈", href: "/", icon: Home },
  { label: "검색", href: "/property/new", icon: Search, matchPrefix: "/property/new" },
  { label: "물건", href: "/dashboard", icon: Building2, matchPrefix: "/dashboard" },
  { label: "체크", href: "/checklist", icon: ClipboardCheck, matchPrefix: "/checklist" },
  { label: "더보기", href: "/legal", icon: MoreHorizontal, matchPrefix: "/legal" },
];

export default function ZjBottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-3 bottom-3 z-40 md:hidden"
    >
      <div
        className={cn(
          "glass-card rounded-full shadow-ambient-lg px-2 pt-2",
          "pb-[calc(0.5rem+env(safe-area-inset-bottom))]",
        )}
      >
        <ul className="flex items-stretch justify-between">
          {TABS.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : !!tab.matchPrefix && pathname.startsWith(tab.matchPrefix);
            const Icon = tab.icon;
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 min-h-12 py-1.5",
                    "rounded-full transition-all",
                    isActive
                      ? "text-primary"
                      : "text-outline active:bg-surface-container-low",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  <span
                    className={cn(
                      "text-[10px] leading-none tracking-tight",
                      isActive ? "font-bold" : "font-medium",
                    )}
                  >
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
