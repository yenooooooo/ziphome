/**
 * @file (zipjikimi)/page.tsx
 * @description 집지킴이 홈 — "The Digital Curator" 스타일 editorial 레이아웃
 *   히어로(eyebrow + display 헤드라인 + 큰 검색바) + 빠른 진입 + Market Pulse 안내
 * @module app/(zipjikimi)
 */

import Link from "next/link";
import {
  Calculator,
  ClipboardCheck,
  MapPin,
  Scale,
  Shield,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import ZjHomeSearch from "@/components/zipjikimi/ui/ZjHomeSearch";
import ZjRecentSearches from "@/components/zipjikimi/ui/ZjRecentSearches";
import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";
import { Card, CardContent } from "@/components/ui/card";

const QUICK_LINKS = [
  { href: "/property/new", icon: MapPin, label: "물건 검증", desc: "주소로 안전도 분석" },
  { href: "/calculator", icon: Calculator, label: "계산기", desc: "전환·수수료·보험" },
  { href: "/dashboard", icon: Shield, label: "물건 관리", desc: "진행 물건 한눈에" },
  { href: "/checklist", icon: ClipboardCheck, label: "체크리스트", desc: "단계별 확인" },
  { href: "/compare", icon: TrendingUp, label: "비교", desc: "후보 나란히" },
  { href: "/legal", icon: Scale, label: "법률 가이드", desc: "대응 요령" },
];

export default function ZjHomePage() {
  return (
    <>
      <ZjMobileHeader transparent />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-2 md:pt-6 pb-10 space-y-10 md:space-y-14">
        {/* 히어로 */}
        <section className="space-y-5 pt-4 md:pt-8">
          <div className="space-y-2">
            <span className="label-eyebrow">Welcome back</span>
            <h1 className="font-headline font-extrabold tracking-tight leading-[1.1] text-[2.25rem] md:text-[3.25rem]">
              계약 전에 <br className="md:hidden" />
              <span className="text-primary">꼭 확인</span>해야 할 것
              <br />
              모두 여기서.
            </h1>
            <p className="text-[15px] text-on-surface-variant pt-1 max-w-md">
              실거래가 · 건축물대장 · 전세가율 · 위험도까지 한 번에.
            </p>
          </div>

          <div className="pt-2">
            <ZjHomeSearch />
          </div>
        </section>

        {/* 최근 검색 */}
        <ZjRecentSearches />

        {/* Market Pulse 카드 */}
        <section>
          <Card className="relative overflow-hidden bg-gradient-primary text-white rounded-[2.5rem] border-0 shadow-ambient-lg">
            <CardContent className="py-8 md:py-10 px-7 md:px-10 flex items-center justify-between gap-4 relative z-10">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-white/70 text-[11px] font-bold uppercase tracking-[0.12em]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Market Security Pulse
                </div>
                <div className="font-headline text-2xl md:text-3xl font-extrabold mt-2.5 tracking-tight leading-tight">
                  오늘의 거래 안전 지표
                </div>
                <div className="text-white/75 text-sm mt-1.5">
                  현재 전세가율 · 사기 알림 · 기준금리 요약
                </div>
              </div>
              <Link
                href="/property/new"
                aria-label="자세히 보기"
                className="shrink-0 h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center backdrop-blur-sm"
              >
                <ArrowUpRight className="h-5 w-5" strokeWidth={2.5} />
              </Link>
            </CardContent>
            {/* 장식 원 */}
            <div
              aria-hidden
              className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/8"
            />
            <div
              aria-hidden
              className="absolute -right-8 -bottom-24 h-48 w-48 rounded-full bg-on-primary-container/40 blur-3xl"
            />
          </Card>
        </section>

        {/* 빠른 진입 */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between px-1">
            <span className="label-eyebrow">Quick Actions</span>
            <span className="text-xs text-outline">6개 도구</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className="group">
                <div className="h-full rounded-[1.75rem] bg-surface-container-lowest shadow-ambient p-5 transition-all hover:-translate-y-0.5 hover:shadow-ambient-lg active:scale-[0.98]">
                  <div className="h-10 w-10 rounded-2xl bg-surface-container-low flex items-center justify-center mb-3 group-hover:bg-primary-fixed transition-colors">
                    <Icon
                      className="h-5 w-5 text-primary"
                      strokeWidth={2.2}
                    />
                  </div>
                  <div className="font-headline font-bold text-[15px] tracking-tight">
                    {label}
                  </div>
                  <div className="text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                    {desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 법률 Watch 안내 */}
        <section>
          <div className="rounded-[2rem] bg-surface-container-low p-6 md:p-7 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary-fixed flex items-center justify-center shrink-0">
              <Scale className="h-5 w-5 text-on-primary-fixed" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-headline font-bold text-[15px] tracking-tight">
                법률 Watch
              </div>
              <div className="text-xs text-on-surface-variant mt-0.5">
                임대차보호법 · 특별법 · 보증보험 대응 가이드
              </div>
            </div>
            <Link
              href="/legal"
              className="shrink-0 h-10 w-10 rounded-full bg-surface-container-lowest flex items-center justify-center active:scale-95 transition-transform"
              aria-label="법률 가이드로 이동"
            >
              <ArrowUpRight className="h-4 w-4 text-primary" strokeWidth={2.5} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
