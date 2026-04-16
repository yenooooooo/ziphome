"use client";

/**
 * @file ZjPropertyResult.tsx
 * @description 주소 기반 물건 검증 결과 통합 뷰 (Phase 1 + Phase 2)
 *   - 부동산 유형 탭: 아파트/오피스텔/연립다세대/단독다가구
 *   - 필터: "이 건물만" / "동네 전체" (지번 + 건물명 매칭)
 * @module components/zipjikimi/ui
 */

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Share2, Bookmark } from "lucide-react";
import { useSavedProperties } from "@/hooks/zipjikimi/useSavedProperties";
import ZjPdfExportButton from "./ZjPdfExportButton";
import { cn } from "@/lib/utils";
import ZjSummaryReportCard from "./ZjSummaryReportCard";
import ZjSimilarDealsHint from "./ZjSimilarDealsHint";
import ZjBuildingInfoCard from "./ZjBuildingInfoCard";
import ZjTransactionListCard from "./ZjTransactionListCard";
import ZjAdequacyCard from "./ZjAdequacyCard";
import ZjRiskScoreCard from "./ZjRiskScoreCard";
import ZjRegistryCard from "./ZjRegistryCard";
import ZjSafetyVerificationCard from "./ZjSafetyVerificationCard";
import ZjFraudDetectionCard from "./ZjFraudDetectionCard";
import ZjSafetyEnvironmentCard from "./ZjSafetyEnvironmentCard";
import ZjNewsAlertCard from "./ZjNewsAlertCard";
import ZjLandUseCard from "./ZjLandUseCard";
import ZjRedevelopmentCard from "./ZjRedevelopmentCard";
import ZjPriceTrendChart from "../charts/ZjPriceTrendChart";
import ZjPriceScatterChart from "../charts/ZjPriceScatterChart";
import ZjNearbyFacilitiesCard from "../map/ZjNearbyFacilitiesCard";
import { summarize } from "@/lib/zipjikimi/analysis/transactionSummary";
import type { ZjAdequacyResult } from "@/lib/zipjikimi/analysis/priceAdequacy";
import type { ZjApiResponse } from "@/types/zipjikimi/api";
import type { ZjAddressResolved } from "@/lib/zipjikimi/utils/address";
import type { ZjBuildingRecord } from "@/types/zipjikimi/building";
import type {
  ZjTransactionSummary,
  ZjTransactionRecord,
  ZjPropertyType,
} from "@/types/zipjikimi/transaction";
import type { ZjLandUseSummary } from "@/types/zipjikimi/landUse";

export interface ZjPropertyResultProps {
  address: string;
}

const PROPERTY_TYPES: ZjPropertyType[] = [
  "아파트",
  "오피스텔",
  "연립다세대",
  "단독다가구",
];

type FilterMode = "building" | "region";

/** 건축물대장 주용도 → 추정 부동산 유형 */
function inferPropertyType(buildings?: ZjBuildingRecord[]): ZjPropertyType {
  if (!buildings || buildings.length === 0) return "아파트";
  const purpose = buildings[0].mainPurpose ?? "";
  if (purpose.includes("아파트")) return "아파트";
  if (purpose.includes("오피스텔")) return "오피스텔";
  if (purpose.includes("다세대") || purpose.includes("연립")) return "연립다세대";
  if (purpose.includes("다가구") || purpose.includes("단독")) return "단독다가구";
  return "아파트";
}

/** "0550" + "0017" → "550-17" (국토부 실거래 jibun 형식) */
function buildJibun(bun?: string, ji?: string): string | undefined {
  if (!bun) return undefined;
  const b = String(Number(bun));
  if (!ji || ji === "0000") return b;
  const j = String(Number(ji));
  if (j === "0") return b;
  return `${b}-${j}`;
}

/**
 * 실거래 레코드가 검색한 물건과 일치하는지 판단.
 * - 지번(본번-부번) 정확 일치
 * - 건물명 정확 일치 OR 부분 매칭 (단지명 다중 동 커버: "래미안" ⊂ "래미안 퍼스트")
 */
function matchesProperty(
  r: ZjTransactionRecord,
  targetJibun?: string,
  targetBuildingName?: string,
): boolean {
  if (targetJibun && r.jibun) {
    if (r.jibun.trim() === targetJibun) return true;
  }
  if (targetBuildingName && r.buildingName) {
    const a = r.buildingName.trim();
    const b = targetBuildingName.trim();
    if (a === b) return true;
    // 단지명 부분 매칭 (래미안 ↔ 래미안 퍼스트 101동, 가산 미소지움 ↔ 미소지움)
    if (b.length >= 2 && (a.includes(b) || b.includes(a))) return true;
  }
  return false;
}

interface BaseState {
  resolved?: ZjAddressResolved;
  building?: ZjBuildingRecord[];
  buildingError?: string;
  landUse?: ZjLandUseSummary;
  landUseError?: string;
  error?: string;
}

interface TxState {
  sale?: ZjTransactionSummary;
  rent?: ZjTransactionSummary;
  loading: boolean;
}

export default function ZjPropertyResult({ address }: ZjPropertyResultProps) {
  const [loading, setLoading] = useState(true);
  const [base, setBase] = useState<BaseState>({});
  const [propertyType, setPropertyType] = useState<ZjPropertyType>("아파트");
  const [userOverrode, setUserOverrode] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("building");
  const [txMap, setTxMap] = useState<Record<ZjPropertyType, TxState>>({
    아파트: { loading: false },
    오피스텔: { loading: false },
    연립다세대: { loading: false },
    단독다가구: { loading: false },
  });
  // 적정성 판정 결과 — RiskScoreCard 에 전달
  const [adequacyResult, setAdequacyResult] = useState<ZjAdequacyResult | null>(null);
  const [adequacyCompareType, setAdequacyCompareType] = useState<
    "매매" | "전세" | "월세"
  >("전세");
  const handleAssess = useCallback(
    (r: ZjAdequacyResult | null, t: "매매" | "전세" | "월세") => {
      setAdequacyResult(r);
      setAdequacyCompareType(t);
    },
    [],
  );
  const fetchedRef = useRef<Set<string>>(new Set());
  const { add: saveProperty, properties: savedProps } = useSavedProperties();
  const isSaved = savedProps.some((p) => p.address === address);

  // ---- 1) 주소 해석 + 건축물대장 + 용도지역 ----
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setBase({});
    setTxMap({
      아파트: { loading: false },
      오피스텔: { loading: false },
      연립다세대: { loading: false },
      단독다가구: { loading: false },
    });
    setUserOverrode(false);
    setFilterMode("building");
    fetchedRef.current.clear();

    (async () => {
      const addrRes = await fetch(`/api/address?q=${encodeURIComponent(address)}`);
      const addrJson = (await addrRes.json()) as ZjApiResponse<ZjAddressResolved>;
      if (cancelled) return;
      if (!addrJson.success) {
        setBase({ error: addrJson.error });
        toast.error(addrJson.error);
        setLoading(false);
        return;
      }
      const resolved = addrJson.data;
      setBase({ resolved });

      const pnu =
        resolved.bCode +
        (resolved.platGbCd ?? "0") +
        (resolved.bun ?? "0000") +
        (resolved.ji ?? "0000");

      const [bldJson, landJson] = await Promise.all([
        fetch(
          `/api/building?sigungu=${resolved.regionCode}&bjdong=${resolved.bjdongCode}` +
            `&bun=${resolved.bun ?? "0000"}&ji=${resolved.ji ?? "0000"}` +
            `&platGb=${resolved.platGbCd ?? "0"}`,
        ).then((r) => r.json() as Promise<ZjApiResponse<ZjBuildingRecord[]>>),
        fetch(`/api/land-use?pnu=${pnu}`).then(
          (r) => r.json() as Promise<ZjApiResponse<ZjLandUseSummary>>,
        ),
      ]);
      if (cancelled) return;

      const next: BaseState = { resolved };
      if (bldJson.success) next.building = bldJson.data;
      else next.buildingError = bldJson.error;
      if (landJson.success) next.landUse = landJson.data;
      else next.landUseError = landJson.error;

      setBase(next);
      setPropertyType((prev) => {
        if (userOverrode) return prev;
        return inferPropertyType(bldJson.success ? bldJson.data : undefined);
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // ---- 2) 선택된 부동산 유형 실거래 데이터 fetch ----
  const regionCode = base.resolved?.regionCode;
  useEffect(() => {
    if (!regionCode) return;
    const key = `${regionCode}:${propertyType}`;
    if (fetchedRef.current.has(key)) return;
    fetchedRef.current.add(key);

    setTxMap((m) => ({ ...m, [propertyType]: { loading: true } }));

    void (async () => {
      const [saleJson, rentJson] = await Promise.all([
        fetch(
          `/api/transaction?region=${regionCode}&type=${encodeURIComponent(propertyType)}&category=매매&months=12`,
        ).then((r) => r.json() as Promise<ZjApiResponse<ZjTransactionSummary>>),
        fetch(
          `/api/transaction?region=${regionCode}&type=${encodeURIComponent(propertyType)}&category=전월세&months=12`,
        ).then((r) => r.json() as Promise<ZjApiResponse<ZjTransactionSummary>>),
      ]);
      setTxMap((m) => ({
        ...m,
        [propertyType]: {
          loading: false,
          sale: saleJson.success ? saleJson.data : undefined,
          rent: rentJson.success ? rentJson.data : undefined,
        },
      }));
      if (!saleJson.success) toast.warning(`매매 조회 실패: ${saleJson.error}`);
      if (!rentJson.success) toast.warning(`전월세 조회 실패: ${rentJson.error}`);
    })();
  }, [propertyType, regionCode]);

  const currentTx = txMap[propertyType];

  // ---- 필터링: "이 건물만" / "동네 전체" ----
  const targetJibun = useMemo(
    () => buildJibun(base.resolved?.bun, base.resolved?.ji),
    [base.resolved?.bun, base.resolved?.ji],
  );
  const targetBuildingName = base.building?.[0]?.buildingName;

  // useMemo 로 필터 결과 참조 안정화 — AdequacyCard → RiskScore 연쇄 재렌더 방지
  const shownSale = useMemo<ZjTransactionSummary | undefined>(() => {
    if (!currentTx.sale) return undefined;
    if (filterMode === "region") return currentTx.sale;
    const filtered = currentTx.sale.records.filter((r) =>
      matchesProperty(r, targetJibun, targetBuildingName),
    );
    return summarize(filtered);
  }, [currentTx.sale, filterMode, targetJibun, targetBuildingName]);

  // 전월세 전체 → 전세(월세 0) / 월세 로 분리
  const shownJeonse = useMemo<ZjTransactionSummary | undefined>(() => {
    if (!currentTx.rent) return undefined;
    const base =
      filterMode === "region"
        ? currentTx.rent.records
        : currentTx.rent.records.filter((r) =>
            matchesProperty(r, targetJibun, targetBuildingName),
          );
    const jeonseOnly = base.filter((r) => !r.monthlyRent || r.monthlyRent === 0);
    return summarize(jeonseOnly);
  }, [currentTx.rent, filterMode, targetJibun, targetBuildingName]);

  const shownMonthly = useMemo<ZjTransactionSummary | undefined>(() => {
    if (!currentTx.rent) return undefined;
    const base =
      filterMode === "region"
        ? currentTx.rent.records
        : currentTx.rent.records.filter((r) =>
            matchesProperty(r, targetJibun, targetBuildingName),
          );
    const monthlyOnly = base.filter((r) => r.monthlyRent && r.monthlyRent > 0);
    return summarize(monthlyOnly);
  }, [currentTx.rent, filterMode, targetJibun, targetBuildingName]);

  const buildingMatchCount = useMemo(() => {
    const s = currentTx.sale?.records.filter((r) =>
      matchesProperty(r, targetJibun, targetBuildingName),
    ).length ?? 0;
    const r = currentTx.rent?.records.filter((r) =>
      matchesProperty(r, targetJibun, targetBuildingName),
    ).length ?? 0;
    return s + r;
  }, [currentTx.sale, currentTx.rent, targetJibun, targetBuildingName]);

  const canFilterByBuilding = !!(targetJibun || targetBuildingName);
  const buildingFilterDisabled = canFilterByBuilding && buildingMatchCount === 0;

  // 건물 매칭 0건이고 사용자가 바꾸지 않았으면 동네 전체로 자동 전환
  useEffect(() => {
    if (
      filterMode === "building" &&
      !currentTx.loading &&
      (currentTx.sale || currentTx.rent) &&
      buildingMatchCount === 0
    ) {
      setFilterMode("region");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingMatchCount, currentTx.loading]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-28 rounded-[2rem]" />
        <Skeleton className="h-56 rounded-[2rem]" />
        <Skeleton className="h-72 rounded-[2rem]" />
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    );
  }

  if (base.error) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-destructive">{base.error}</p>
        </CardContent>
      </Card>
    );
  }

  const { resolved, building, landUse, landUseError } = base;

  return (
    <div id="zj-result-container" className="space-y-5">
      {/* 위치 히어로 + 저장/공유/PDF */}
      {resolved && (
        <Card className="bg-gradient-primary text-white border-0 shadow-ambient-lg">
          <CardContent className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.12em] font-bold text-white/70">
                Location
              </div>
              <div className="font-headline font-bold text-lg md:text-xl tracking-tight truncate mt-0.5">
                {resolved.addressRoad ?? resolved.addressJibun}
              </div>
              <div className="text-[12px] text-white/70 mt-1 truncate">
                {resolved.addressJibun} · 법정동 {resolved.regionCode}
                {resolved.bjdongCode}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!isSaved && resolved) {
                    saveProperty({
                      address: address,
                      addressRoad: resolved.addressRoad,
                      buildingName: building?.[0]?.buildingName,
                      regionCode: resolved.regionCode,
                      builtYear: building?.[0]?.builtYear,
                      mainPurpose: building?.[0]?.mainPurpose,
                      avgSalePrice: shownSale?.avgPrice,
                      avgJeonseDeposit: shownJeonse?.avgDeposit,
                    });
                    toast.success("물건이 저장되었습니다");
                  }
                }}
                disabled={isSaved}
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center active:scale-95 transition-all",
                  isSaved ? "bg-white/30" : "bg-white/15 hover:bg-white/25",
                )}
                aria-label="물건 저장"
              >
                <Bookmark className="h-4 w-4" strokeWidth={2.5} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    toast.success("링크가 복사되었습니다");
                  }).catch(() => {
                    toast.error("복사 실패");
                  });
                }}
                className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center active:scale-95 transition-all"
                aria-label="검색 결과 공유"
              >
                <Share2 className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <ZjPdfExportButton />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 1장 요약 리포트 */}
      <ZjSummaryReportCard
        building={building}
        saleSummary={shownSale}
        jeonseSummary={shownJeonse}
      />

      {/* 건축물대장 + 노후도 */}
      {building && <ZjBuildingInfoCard records={building} />}

      {/* 부동산 유형 + 범위 필터 */}
      <Card>
        <CardContent className="space-y-4">
          <div>
            <span className="label-eyebrow">Property Type</span>
            <div className="font-headline font-bold text-lg mt-1">
              부동산 유형 & 범위
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
              유형
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setPropertyType(t);
                    setUserOverrode(true);
                  }}
                  className={cn(
                    "rounded-full h-11 text-[13px] font-semibold transition-all",
                    propertyType === t
                      ? "bg-gradient-primary text-white shadow-float"
                      : "bg-surface-container-low text-on-surface-variant active:scale-95",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
              범위
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFilterMode("building")}
                disabled={buildingFilterDisabled}
                className={cn(
                  "rounded-full h-11 text-[13px] font-semibold transition-all",
                  filterMode === "building"
                    ? "bg-gradient-primary text-white shadow-float"
                    : "bg-surface-container-low text-on-surface-variant active:scale-95",
                  buildingFilterDisabled && "opacity-40 cursor-not-allowed",
                )}
              >
                이 건물만
                {canFilterByBuilding && !currentTx.loading && (
                  <span className="ml-1.5 opacity-80">({buildingMatchCount}건)</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("region")}
                className={cn(
                  "rounded-full h-11 text-[13px] font-semibold transition-all",
                  filterMode === "region"
                    ? "bg-gradient-primary text-white shadow-float"
                    : "bg-surface-container-low text-on-surface-variant active:scale-95",
                )}
              >
                동네 전체
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed">
              {filterMode === "building"
                ? canFilterByBuilding
                  ? `지번(${targetJibun ?? "-"}) 또는 건물명(${targetBuildingName ?? "-"})과 일치하는 거래만 표시.`
                  : "건물 정보가 없어 이 건물만 필터를 쓸 수 없습니다."
                : `이 시군구(${resolved?.sigungu}) 전체 ${propertyType} 평균입니다.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 시세 트렌드 */}
      {currentTx.loading ? (
        <Skeleton className="h-72 rounded-[2rem]" />
      ) : (
        <ZjPriceTrendChart
          saleSummary={shownSale}
          jeonseSummary={shownJeonse}
          monthlySummary={shownMonthly}
        />
      )}

      {/* 가격 분포 산점도 */}
      {!currentTx.loading && (
        <ZjPriceScatterChart saleSummary={shownSale} jeonseSummary={shownJeonse} />
      )}

      {/* 실거래 내역 */}
      {currentTx.loading ? (
        <Skeleton className="h-96 rounded-[2rem]" />
      ) : (
        <ZjTransactionListCard
          saleSummary={shownSale}
          jeonseSummary={shownJeonse}
          monthlySummary={shownMonthly}
          regionLabel={
            filterMode === "building"
              ? `${targetBuildingName ?? targetJibun ?? "이 건물"} · ${propertyType}`
              : resolved
                ? `${resolved.sigungu} ${resolved.bname ?? ""} · ${propertyType}`.trim()
                : propertyType
          }
        />
      )}

      {/* 비슷한 매물 비교 힌트 (이 건물만 3건 미만일 때) */}
      <ZjSimilarDealsHint
        regionSale={currentTx.sale}
        dong={resolved?.bname}
        areaM2={building?.[0]?.totalArea && building?.[0]?.totalHouseholds
          ? Math.round(building[0].totalArea / (building[0].totalHouseholds || 1) * 0.7)
          : undefined}
        buildingMatchCount={buildingMatchCount}
        filterMode={filterMode}
      />

      {/* 보증금 적정성 (전세/매매/월세 3탭) */}
      <ZjAdequacyCard
        saleSummary={shownSale}
        jeonseSummary={shownJeonse}
        monthlySummary={shownMonthly}
        builtYear={building?.[0]?.builtYear}
        onAssess={handleAssess}
      />

      {/* 종합 위험 스코어 (적정성 결과 기반) */}
      <ZjRiskScoreCard
        adequacy={adequacyResult}
        builtYear={building?.[0]?.builtYear}
        saleRecords={shownSale?.records}
        compareType={adequacyCompareType}
      />

      {/* ===== Phase 3: 안전 검증 ===== */}

      {/* F17 사기 위험 탐지 (자동, 입력 불필요) */}
      <ZjFraudDetectionCard
        saleSummary={shownSale}
        jeonseSummary={shownJeonse}
        buildingAge={building?.[0]?.builtYear
          ? new Date().getFullYear() - building[0].builtYear
          : undefined}
      />

      {/* F14 등기부등본 (유료, 토스트 게이팅) */}
      <ZjRegistryCard address={resolved?.addressJibun} />

      {/* F15+F16 임대인/중개사 확인 (사업자번호 입력) */}
      <ZjSafetyVerificationCard />

      {/* 전세사기 뉴스 경고 */}
      <ZjNewsAlertCard sigungu={resolved?.sigungu} />

      {/* F18+F19+F20 범죄/재해/소음 환경 */}
      <ZjSafetyEnvironmentCard sido={resolved?.sido} sigungu={resolved?.sigungu} />

      {/* 주변 편의시설 + 지도 */}
      {resolved && (
        <ZjNearbyFacilitiesCard
          latitude={resolved.latitude}
          longitude={resolved.longitude}
          radiusM={1000}
        />
      )}

      {/* 용도지역 */}
      <ZjLandUseCard
        pnu={
          resolved
            ? resolved.bCode +
              (resolved.platGbCd ?? "0") +
              (resolved.bun ?? "0000") +
              (resolved.ji ?? "0000")
            : undefined
        }
      />

      {/* 재개발·재건축 */}
      <ZjRedevelopmentCard sido={resolved?.sido} sigungu={resolved?.sigungu} />
    </div>
  );
}
