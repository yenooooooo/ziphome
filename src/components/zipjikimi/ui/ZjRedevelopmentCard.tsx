/**
 * @file ZjRedevelopmentCard.tsx
 * @description F12 — 재개발·재건축 정보 카드
 *   ⚠️ 정비사업 API는 지자체별로 분산되어 있어 공식 조회 포털로 연결.
 *      서울/경기/부산 주요 지역은 전용 포털, 그 외는 cleanup.go.kr 통합 검색.
 * @module components/zipjikimi/ui
 */

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Construction } from "lucide-react";

export interface ZjRedevelopmentCardProps {
  /** 시도 (예: "서울", "경기", "부산") */
  sido?: string;
  /** 시군구 */
  sigungu?: string;
}

interface PortalLink {
  title: string;
  url: string;
  desc: string;
}

/** 지역별 정비사업 포털 매핑 */
function pickPortal(sido?: string): PortalLink {
  if (!sido) {
    return {
      title: "정비사업 통합정보",
      url: "https://cleanup.go.kr/",
      desc: "국토부 통합 — 전국 정비사업 현황 검색",
    };
  }
  if (sido.includes("서울")) {
    return {
      title: "서울 정비사업 정보몽땅",
      url: "https://cleanup.seoul.go.kr/",
      desc: "서울시 정비구역·조합·진행 단계 조회",
    };
  }
  if (sido.includes("경기")) {
    return {
      title: "경기도 정비사업 통합정보",
      url: "https://www.gg.go.kr/",
      desc: "경기도 정비사업 진행 현황",
    };
  }
  if (sido.includes("부산")) {
    return {
      title: "부산 재개발·재건축 통합정보",
      url: "https://cleanup.busan.go.kr/",
      desc: "부산시 정비사업 현황",
    };
  }
  return {
    title: "정비사업 통합정보",
    url: "https://cleanup.go.kr/",
    desc: "국토부 통합 — 전국 정비사업 검색",
  };
}

export default function ZjRedevelopmentCard({
  sido,
  sigungu,
}: ZjRedevelopmentCardProps) {
  const portal = pickPortal(sido);

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="label-eyebrow">Redevelopment</span>
            <div className="font-headline font-bold text-lg mt-1">재개발·재건축</div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-primary-fixed flex items-center justify-center shrink-0">
            <Construction
              className="h-5 w-5 text-on-primary-fixed"
              strokeWidth={2.2}
            />
          </div>
        </div>

        <p className="text-sm text-on-surface-variant leading-relaxed">
          {sido && sigungu
            ? `${sido} ${sigungu} 지역의 정비사업 진행 현황은 아래 공식 포털에서 확인하세요.`
            : "해당 지역의 정비사업 진행 현황을 확인하세요."}
        </p>

        <Link
          href={portal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-2xl bg-gradient-surface p-5 active:scale-[0.99] transition-transform"
        >
          <div className="min-w-0">
            <div className="font-headline font-bold text-[15px] tracking-tight">
              {portal.title}
            </div>
            <div className="text-xs text-on-surface-variant mt-0.5 truncate">
              {portal.desc}
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-surface-container-lowest flex items-center justify-center shrink-0 shadow-float">
            <ArrowUpRight className="h-4 w-4 text-primary" strokeWidth={2.5} />
          </div>
        </Link>

        <p className="text-[11px] text-outline leading-relaxed">
          ⓘ 정비사업 API는 지자체별로 분산되어 있어 공식 포털로 연결합니다. 향후
          통합 조회 기능 추가 예정.
        </p>
      </CardContent>
    </Card>
  );
}
