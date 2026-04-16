/**
 * @file transaction.ts
 * @description 국토교통부 실거래가 API — 부동산 4종 × 거래 2종 = 8개 엔드포인트 통합 클라이언트
 * @api 공공데이터포털 — 국토교통부 실거래가 정보
 * @see https://www.data.go.kr/data/15126469/openapi.do (아파트 매매)
 * @see https://www.data.go.kr/data/15126471/openapi.do (아파트 전월세)
 * @module lib/zipjikimi/api
 *
 * @note 모든 응답은 ZjTransactionRecord 로 정규화. 금액 단위: 만원.
 *       XML 응답의 "거래금액" 필드는 "85,000" 처럼 콤마 포함 문자열 → 숫자 변환 필요.
 */

import { fetchDataGoKrXml } from "./dataGoKr";
import type {
  ZjTransactionRecord,
  ZjPropertyType,
  ZjDealCategory,
} from "@/types/zipjikimi/transaction";

const BASE = "https://apis.data.go.kr/1613000";

/** 부동산 유형 + 거래 종류별 엔드포인트 매핑 */
const ENDPOINTS: Record<ZjPropertyType, Record<ZjDealCategory, string>> = {
  아파트: {
    매매: `${BASE}/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev`,
    전월세: `${BASE}/RTMSDataSvcAptRent/getRTMSDataSvcAptRent`,
  },
  오피스텔: {
    매매: `${BASE}/RTMSDataSvcOffiTrade/getRTMSDataSvcOffiTrade`,
    전월세: `${BASE}/RTMSDataSvcOffiRent/getRTMSDataSvcOffiRent`,
  },
  연립다세대: {
    매매: `${BASE}/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade`,
    전월세: `${BASE}/RTMSDataSvcRHRent/getRTMSDataSvcRHRent`,
  },
  단독다가구: {
    매매: `${BASE}/RTMSDataSvcSHTrade/getRTMSDataSvcSHTrade`,
    전월세: `${BASE}/RTMSDataSvcSHRent/getRTMSDataSvcSHRent`,
  },
};

/** 콤마 포함 금액 문자열을 정수(만원)로 변환 */
function parseMan(raw: string | number | undefined): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === "number") return raw;
  const cleaned = String(raw).replace(/[,\s]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function pickNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function pickString(v: unknown): string | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  return String(v).trim() || undefined;
}

/**
 * data.go.kr 원시 아이템을 ZjTransactionRecord 로 정규화.
 * 국토부 실거래 API v2/v3 응답은 영문 camelCase 필드.
 *
 * 매매: dealAmount, dealYear/Month/Day, excluUseAr, floor, buildYear, aptNm/offiNm/..., umdNm, sggCd
 * 전월세: deposit, monthlyRent, contractTerm, contractType, (나머지 동일)
 */
function normalize(
  raw: Record<string, unknown>,
  propertyType: ZjPropertyType,
  dealCategory: ZjDealCategory,
  regionCode: string,
): ZjTransactionRecord {
  const salePriceMan =
    dealCategory === "매매" ? parseMan(raw["dealAmount"] as string) : undefined;
  const depositMan =
    dealCategory === "전월세" ? parseMan(raw["deposit"] as string) : undefined;
  const monthlyRentMan =
    dealCategory === "전월세" ? parseMan(raw["monthlyRent"] as string) : undefined;

  // 전월세: 월세금액이 0 초과면 "월세", 아니면 "전세"
  const rentType: "전세" | "월세" | undefined =
    dealCategory === "전월세"
      ? monthlyRentMan && monthlyRentMan > 0
        ? "월세"
        : "전세"
      : undefined;

  // 건물명: 부동산 유형에 따라 필드명이 다름
  //   아파트: aptNm / 오피스텔: offiNm / 연립다세대: mhouseNm 또는 rghouseNm / 단독다가구: houseType 또는 rghouseNm
  const buildingName =
    pickString(raw["aptNm"]) ||
    pickString(raw["offiNm"]) ||
    pickString(raw["mhouseNm"]) ||
    pickString(raw["rghouseNm"]) ||
    pickString(raw["houseType"]);

  return {
    propertyType,
    dealCategory,
    rentType,
    dealYear: pickNumber(raw["dealYear"]) ?? 0,
    dealMonth: pickNumber(raw["dealMonth"]) ?? 0,
    dealDay: pickNumber(raw["dealDay"]),
    salePrice: salePriceMan,
    deposit: depositMan,
    monthlyRent: monthlyRentMan,
    areaM2: pickNumber(raw["excluUseAr"]),
    floor: pickNumber(raw["floor"]),
    builtYear: pickNumber(raw["buildYear"]),
    buildingName,
    dong: pickString(raw["umdNm"]),
    jibun: pickString(raw["jibun"]),
    regionCode: pickString(raw["sggCd"]) ?? regionCode,
    contractType: pickString(raw["contractType"]),
  };
}

/**
 * 특정 부동산/거래유형/년월의 실거래 목록 조회.
 * @param regionCode 법정동 5자리 (시군구)
 * @param yearMonth "YYYYMM"
 * @param propertyType 아파트/오피스텔/연립다세대/단독다가구
 * @param dealCategory 매매/전월세
 */
export async function fetchTransactions(
  regionCode: string,
  yearMonth: string,
  propertyType: ZjPropertyType,
  dealCategory: ZjDealCategory,
): Promise<ZjTransactionRecord[]> {
  const endpoint = ENDPOINTS[propertyType][dealCategory];
  const { items } = await fetchDataGoKrXml<Record<string, unknown>>(endpoint, {
    LAWD_CD: regionCode,
    DEAL_YMD: yearMonth,
    numOfRows: 1000,
    pageNo: 1,
  });
  return items.map((item) => normalize(item, propertyType, dealCategory, regionCode));
}

/**
 * 여러 달을 병렬로 가져와서 하나로 합침.
 */
export async function fetchTransactionsMulti(
  regionCode: string,
  yearMonths: string[],
  propertyType: ZjPropertyType,
  dealCategory: ZjDealCategory,
): Promise<ZjTransactionRecord[]> {
  const settled = await Promise.allSettled(
    yearMonths.map((ym) =>
      fetchTransactions(regionCode, ym, propertyType, dealCategory),
    ),
  );
  const out: ZjTransactionRecord[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled") out.push(...r.value);
    else console.warn("[ZJ] 실거래가 부분 조회 실패:", r.reason);
  }
  // 최신 → 과거 정렬
  return out.sort(
    (a, b) =>
      b.dealYear - a.dealYear ||
      b.dealMonth - a.dealMonth ||
      (b.dealDay ?? 0) - (a.dealDay ?? 0),
  );
}
