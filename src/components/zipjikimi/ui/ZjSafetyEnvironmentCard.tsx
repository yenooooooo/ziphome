/**
 * @file ZjSafetyEnvironmentCard.tsx
 * @description F18 범죄 + F19 자연재해 + F20 소음 — 안전 환경 종합 카드
 *   공공 API 직접 연동이 불안정한 영역이라 각 정보원의 공식 포털 링크를 제공.
 *   향후 API 안정화 시 실데이터로 교체 예정.
 * @module components/zipjikimi/ui
 */

import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  AlertTriangle,
  Waves,
  Volume2,
  ArrowUpRight,
} from "lucide-react";

export interface ZjSafetyEnvironmentCardProps {
  sido?: string;
  sigungu?: string;
}

const ITEMS = [
  {
    icon: Shield,
    label: "범죄 통계",
    eyebrow: "F18",
    desc: "해당 지역 범죄 발생 현황",
    url: "https://www.police.go.kr/www/open/publice/publice03_2020.jsp",
    source: "경찰청 범죄통계",
  },
  {
    icon: AlertTriangle,
    label: "자연재해 위험",
    eyebrow: "F19",
    desc: "풍수해·산사태·지진 위험지구",
    url: "https://www.safekorea.go.kr/idsiSFK/neo/sfk/cs/sfc/risk/riskArea.html",
    source: "안전디딤돌 (행안부)",
  },
  {
    icon: Waves,
    label: "산사태 위험",
    eyebrow: "F19",
    desc: "산사태 위험등급 지도",
    url: "https://sansatai.forest.go.kr/",
    source: "산림청 산사태정보시스템",
  },
  {
    icon: Volume2,
    label: "소음 환경",
    eyebrow: "F20",
    desc: "도로·항공·철도 소음 수준",
    url: "https://www.noiseinfo.or.kr/",
    source: "국가소음정보시스템",
  },
];

export default function ZjSafetyEnvironmentCard({
  sido,
  sigungu,
}: ZjSafetyEnvironmentCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <span className="label-eyebrow">Safety Environment</span>
          <div className="font-headline font-bold text-lg mt-1">
            안전 환경 정보
          </div>
          <p className="text-[12px] text-on-surface-variant mt-1">
            {sido && sigungu ? `${sido} ${sigungu}` : "해당 지역"}의 범죄·재해·소음 정보를
            공식 포털에서 확인하세요.
          </p>
        </div>

        <div className="space-y-2">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3.5 active:scale-[0.99] transition-transform hover:bg-surface-container"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
                    <Icon
                      className="h-4 w-4 text-on-primary-fixed"
                      strokeWidth={2.2}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[14px]">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-on-surface-variant truncate">
                      {item.source}
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-outline shrink-0" strokeWidth={2.5} />
              </a>
            );
          })}
        </div>

        <p className="text-[11px] text-outline leading-relaxed">
          향후 API 안정화 시 실시간 데이터 연동 예정. 현재는 각 기관 공식 포털로 연결합니다.
        </p>
      </CardContent>
    </Card>
  );
}
