"use client";

/**
 * @file ZjNearbyFacilitiesCard.tsx
 * @description F09 주변 편의시설 카드 — 카테고리별 요약 + 지도 오버레이
 *              카테고리 탭을 누르면 해당 카테고리 마커만 지도에 표시
 * @module components/zipjikimi/map
 */

import { useEffect, useState } from "react";
import {
  Train,
  ShoppingCart,
  ShoppingBag,
  Hospital,
  GraduationCap,
  Coffee,
  Pill,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ZjKakaoMap from "./ZjKakaoMap";
import { cn } from "@/lib/utils";
import type {
  ZjFacility,
  ZjFacilityCategory,
  ZjFacilitySummary,
  ZjMapMarker,
} from "@/types/zipjikimi/map";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

const CATEGORY_META: Record<
  ZjFacilityCategory,
  { label: string; icon: LucideIcon }
> = {
  subway: { label: "지하철", icon: Train },
  bus: { label: "버스", icon: Train },
  convenience: { label: "편의점", icon: ShoppingCart },
  mart: { label: "마트", icon: ShoppingBag },
  hospital: { label: "병원", icon: Hospital },
  school: { label: "학교", icon: GraduationCap },
  cafe: { label: "카페", icon: Coffee },
  pharmacy: { label: "약국", icon: Pill },
};

const DISPLAY_ORDER: ZjFacilityCategory[] = [
  "subway",
  "convenience",
  "mart",
  "hospital",
  "school",
  "cafe",
  "pharmacy",
];

export interface ZjNearbyFacilitiesCardProps {
  latitude: number;
  longitude: number;
  /** 반경 (m), 기본 1000 */
  radiusM?: number;
}

interface FetchState {
  loading: boolean;
  error?: string;
  summary?: ZjFacilitySummary[];
  facilities?: Record<string, ZjFacility[]>;
}

export default function ZjNearbyFacilitiesCard({
  latitude,
  longitude,
  radiusM = 1000,
}: ZjNearbyFacilitiesCardProps) {
  const [state, setState] = useState<FetchState>({ loading: true });
  const [activeCategory, setActiveCategory] = useState<ZjFacilityCategory | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });
    (async () => {
      try {
        const res = await fetch(
          `/api/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusM}`,
        );
        const json = (await res.json()) as ZjApiResponse<{
          summary: ZjFacilitySummary[];
          facilities: Record<string, ZjFacility[]>;
        }>;
        if (cancelled) return;
        if (!json.success) {
          setState({ loading: false, error: json.error });
          toast.warning(`주변시설 조회 실패: ${json.error}`);
          return;
        }
        setState({
          loading: false,
          summary: json.data.summary,
          facilities: json.data.facilities,
        });
        // 기본 첫 카테고리 활성화
        const firstWithResults = json.data.summary.find((s) => s.count > 0);
        if (firstWithResults) setActiveCategory(firstWithResults.category);
      } catch (e) {
        if (cancelled) return;
        setState({ loading: false, error: String(e) });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, radiusM]);

  const markers: ZjMapMarker[] =
    activeCategory && state.facilities?.[activeCategory]
      ? state.facilities[activeCategory].map((f) => ({
          id: f.id,
          latitude: f.latitude,
          longitude: f.longitude,
          title: f.name,
          variant: "safe",
        }))
      : [];

  const selectedList = activeCategory ? state.facilities?.[activeCategory] ?? [] : [];

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="label-eyebrow">Nearby</span>
            <div className="font-headline font-bold text-lg mt-1">
              주변 편의시설
            </div>
          </div>
          <span className="text-xs text-on-surface-variant">
            반경 {Math.round(radiusM / 100) * 100}m
          </span>
        </div>

        <ZjKakaoMap
          latitude={latitude}
          longitude={longitude}
          radiusM={radiusM}
          markers={markers}
          heightClassName="h-56"
        />

        {state.loading ? (
          <Skeleton className="h-20 rounded-2xl" />
        ) : state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {DISPLAY_ORDER.filter((c) => c !== "bus").map((c) => {
                const summary = state.summary?.find((s) => s.category === c);
                const Icon = CATEGORY_META[c].icon;
                const isActive = activeCategory === c;
                const count = summary?.count ?? 0;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCategory(c)}
                    disabled={count === 0}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all",
                      isActive
                        ? "bg-gradient-primary text-white shadow-float"
                        : count > 0
                          ? "bg-surface-container-low text-foreground active:scale-95"
                          : "bg-surface-container-low text-outline cursor-not-allowed opacity-50",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                    {CATEGORY_META[c].label}
                    <span
                      className={cn(
                        "text-[11px] font-bold",
                        isActive ? "text-white/80" : "text-on-surface-variant",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeCategory && selectedList.length > 0 && (
              <ul className="space-y-2">
                {selectedList.slice(0, 5).map((f) => (
                  <li
                    key={f.id}
                    className="rounded-2xl bg-surface-container-low px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[14px] truncate">
                        {f.name}
                      </div>
                      {f.roadAddress && (
                        <div className="text-[12px] text-on-surface-variant truncate mt-0.5">
                          {f.roadAddress}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[13px] font-bold text-primary">
                        {f.distanceM < 1000
                          ? `${f.distanceM}m`
                          : `${(f.distanceM / 1000).toFixed(1)}km`}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        도보 {Math.max(1, Math.ceil(f.distanceM / 80))}분
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
