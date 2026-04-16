"use client";

/**
 * @file ZjHomeSearch.tsx
 * @description 홈 화면 주소 검색 — /property/new?q=... 로 이동, 히어로용 lg 사이즈
 * @module components/zipjikimi/ui
 */

import { useRouter } from "next/navigation";
import ZjAddressSearch from "./ZjAddressSearch";

export default function ZjHomeSearch() {
  const router = useRouter();
  return (
    <ZjAddressSearch
      size="lg"
      onSubmit={(q) => router.push(`/property/new?q=${encodeURIComponent(q)}`)}
    />
  );
}
