"use client";

/**
 * @file ZjKakaoMap.tsx
 * @description 카카오맵 래퍼 — 중심 좌표 + 반경 + 마커 렌더
 *   - SDK 동적 로드 (kakaoLoader)
 *   - props 변경 시 마커/반경 재렌더
 *   - 모바일 터치 zoom/drag 기본 활성화
 * @module components/zipjikimi/map
 */

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { loadKakaoMap } from "@/lib/zipjikimi/map/kakaoLoader";
import { cn } from "@/lib/utils";
import type { ZjMapMarker } from "@/types/zipjikimi/map";

export interface ZjKakaoMapProps {
  /** 중심 좌표 */
  latitude: number;
  longitude: number;
  /** 줌 레벨 (1=가까이, 14=멀리, 기본 4) */
  level?: number;
  /** 반경 원 (m) — 주변시설 범위 시각화 */
  radiusM?: number;
  /** 마커 목록 */
  markers?: ZjMapMarker[];
  className?: string;
  /** 높이 (기본 h-64) */
  heightClassName?: string;
}

const MARKER_COLORS: Record<NonNullable<ZjMapMarker["variant"]>, string> = {
  primary: "#00113b",
  safe: "#16a34a",
  caution: "#eab308",
  danger: "#dc2626",
};

export default function ZjKakaoMap({
  latitude,
  longitude,
  level = 4,
  radiusM,
  markers = [],
  className,
  heightClassName = "h-64",
}: ZjKakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const circleRef = useRef<KakaoCircle | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) SDK 로드 + 지도 생성 (한 번만)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadKakaoMap(["services"]);
        if (cancelled || !containerRef.current) return;
        const { kakao } = window;
        mapRef.current = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(latitude, longitude),
          level,
        });
        setLoaded(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) 중심 좌표 변경 반영
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const { kakao } = window;
    mapRef.current.setCenter(new kakao.maps.LatLng(latitude, longitude));
    mapRef.current.setLevel(level);
  }, [loaded, latitude, longitude, level]);

  // 3) 반경 원 업데이트
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const { kakao } = window;
    // 기존 원 제거
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }
    if (radiusM && radiusM > 0) {
      circleRef.current = new kakao.maps.Circle({
        center: new kakao.maps.LatLng(latitude, longitude),
        radius: radiusM,
        strokeWeight: 2,
        strokeColor: "#00113b",
        strokeOpacity: 0.4,
        strokeStyle: "dashed",
        fillColor: "#5f8aff",
        fillOpacity: 0.08,
      });
      circleRef.current.setMap(mapRef.current);
    }
  }, [loaded, latitude, longitude, radiusM]);

  // 4) 마커 업데이트
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const { kakao } = window;
    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 중심 마커 (물건 위치)
    const centerMarker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(latitude, longitude),
      image: svgMarker("#00113b", 32, true),
    });
    centerMarker.setMap(mapRef.current);
    markersRef.current.push(centerMarker);

    // 주변 마커
    markers.forEach((m) => {
      const color = MARKER_COLORS[m.variant ?? "primary"];
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(m.latitude, m.longitude),
        image: svgMarker(color, 18, false),
        title: m.title,
      });
      marker.setMap(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [loaded, latitude, longitude, markers]);

  if (error) {
    return (
      <div
        className={cn(
          "rounded-[2rem] bg-surface-container-low flex items-center justify-center text-sm text-on-surface-variant",
          heightClassName,
          className,
        )}
      >
        지도 로드 실패: {error}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-[2rem] overflow-hidden shadow-ambient",
        heightClassName,
        className,
      )}
    >
      {!loaded && <Skeleton className="absolute inset-0 rounded-[2rem]" />}
      <div
        ref={containerRef}
        className="absolute inset-0"
        role="application"
        aria-label="지도"
      />
    </div>
  );
}

/**
 * SVG 기반 원형 마커 이미지 — 색상 커스터마이즈 가능.
 * 카카오 SDK는 svg data-uri를 MarkerImage src로 받을 수 있음.
 */
function svgMarker(color: string, size: number, center: boolean): KakaoMarkerImage {
  const { kakao } = window;
  const ring = center ? 4 : 2;
  const inner = size / 2 - ring - 1;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#ffffff" stroke="${color}" stroke-width="${ring}"/>
      ${center ? `<circle cx="${size / 2}" cy="${size / 2}" r="${inner}" fill="${color}"/>` : ""}
    </svg>
  `;
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return new kakao.maps.MarkerImage(
    uri,
    new kakao.maps.Size(size, size),
    { offset: new kakao.maps.Point(size / 2, size / 2) },
  );
}
