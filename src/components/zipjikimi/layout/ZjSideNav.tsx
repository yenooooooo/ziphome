"use client";

/**
 * @file ZjSideNav.tsx
 * @description PC(md 이상) 프리미엄 사이드바 — Guardian's Lens 스타일
 * @module components/zipjikimi/layout
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Building2,
  ClipboardCheck,
  Scale,
  Calculator,
  BarChart3,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ZjNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  matchPrefix?: string;
}

const NAV: ZjNavItem[] = [
  { label: "홈", href: "/", icon: Home },
  { label: "새 물건 검증", href: "/property/new", icon: Search, matchPrefix: "/property/new" },
  { label: "물건 관리", href: "/dashboard", icon: Building2, matchPrefix: "/dashboard" },
  { label: "물건 비교", href: "/compare", icon: BarChart3, matchPrefix: "/compare" },
  { label: "계산기", href: "/calculator", icon: Calculator, matchPrefix: "/calculator" },
  { label: "체크리스트", href: "/checklist", icon: ClipboardCheck, matchPrefix: "/checklist" },
  { label: "법률 가이드", href: "/legal", icon: Scale, matchPrefix: "/legal" },
];

export default function ZjSideNav() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="사이드바 메뉴"
      className="hidden md:flex md:flex-col md:w-72 md:shrink-0 md:bg-surface"
    >
      <div className="h-20 flex items-center px-8 pt-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center shadow-float">
            <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-headline font-extrabold text-xl tracking-tight">
            집지킴이
          </span>
        </Link>
      </div>
      <ul className="flex-1 py-6 px-5 space-y-1">
        {NAV.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : !!item.matchPrefix && pathname.startsWith(item.matchPrefix);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-full text-sm transition-all",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-float font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container-low",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="px-8 py-6 text-[11px] text-outline">
        <span className="label-eyebrow">ZipJikimi</span>
        <div className="mt-1">개인 전용 · Phase 1</div>
      </div>
    </aside>
  );
}
