/**
 * @file landUse.ts
 * @description F11 — 용도지역 조회 (VWorld NED API)
 * @api VWorld API — https://api.vworld.kr/ned/data/getLandUseAttr
 * @see https://www.vworld.kr/dev/v4api.do
 * @module lib/zipjikimi/api
 *
 * @note ⚠️ data.go.kr이 아닌 VWorld API. 별도 무료 키 발급 필요.
 *        https://www.vworld.kr/ 가입 → 인증키 발급 → 서비스 도메인 등록
 *        env: ZJ_VWORLD_API_KEY
 *
 * @note PNU(19자리) = 법정동코드(10) + 산여부(1) + 본번(4) + 부번(4)
 */

import { XMLParser } from "fast-xml-parser";
import type {
  ZjLandUseRecord,
  ZjLandUseSummary,
  ZjLandZoneCategory,
} from "@/types/zipjikimi/landUse";

const VWORLD_ENDPOINT = "https://api.vworld.kr/ned/data/getLandUseAttr";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  parseTagValue: true,
  numberParseOptions: { leadingZeros: false, hex: false, skipLike: /^\d{8,}$/ },
});

/** 용도지역명 → 대분류 */
function classifyZone(name: string): ZjLandZoneCategory {
  if (name.includes("주거")) return "주거";
  if (name.includes("상업")) return "상업";
  if (name.includes("공업")) return "공업";
  if (name.includes("녹지")) return "녹지";
  if (name.includes("관리")) return "관리";
  if (name.includes("농림")) return "농림";
  if (name.includes("자연환경")) return "자연환경보전";
  return "기타";
}

function pickString(v: unknown): string | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  return String(v).trim() || undefined;
}

function normalize(raw: Record<string, unknown>): ZjLandUseRecord {
  const zoneName =
    pickString(raw["prposAreaDstrcCodeNm"]) ?? pickString(raw["prposArea"]) ?? "-";
  return {
    zoneName,
    category: classifyZone(zoneName),
    districtName: pickString(raw["dstrcCodeNm"]) ?? pickString(raw["dstrcNm"]),
    areaName: pickString(raw["areaNm"]),
    overlaps: !!raw["cnflcAt"],
    raw,
  };
}

/** PNU 생성 — b_code(10) + platGbCd(1) + bun(4) + ji(4) = 19자리 */
export function buildPnu(
  bCode: string,
  platGbCd: string,
  bun: string,
  ji: string,
): string {
  return `${bCode}${platGbCd}${bun.padStart(4, "0")}${ji.padStart(4, "0")}`;
}

export interface ZjLandUseQuery {
  pnu: string;
}

/** VWorld 키가 설정되지 않은 경우를 판별 */
export function hasVworldKey(): boolean {
  return !!process.env.ZJ_VWORLD_API_KEY;
}

/**
 * PNU → 용도지역 조회 (VWorld).
 */
export async function fetchLandUse(q: ZjLandUseQuery): Promise<ZjLandUseSummary> {
  const key = process.env.ZJ_VWORLD_API_KEY;
  if (!key) {
    throw new Error(
      "[ZJ] ZJ_VWORLD_API_KEY 환경변수가 필요합니다 (VWorld 인증키). https://www.vworld.kr/ 에서 무료 발급.",
    );
  }

  const params = new URLSearchParams({
    key,
    pnu: q.pnu,
    format: "xml",
    numOfRows: "100",
    pageNo: "1",
    domain: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "http://localhost:3000"),
  });

  const res = await fetch(`${VWORLD_ENDPOINT}?${params}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ZipJikimi/1.0; +https://github.com/zipjikimi)",
      Accept: "application/xml, text/xml",
    },
    signal: AbortSignal.timeout(15000),
    next: { revalidate: 60 * 60 * 24 * 7 }, // 7일
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[ZJ] VWorld LandUse ${res.status}: ${body.slice(0, 200)}`);
  }

  const xml = await res.text();
  const parsed = parser.parse(xml) as {
    landUses?: {
      field?: Record<string, unknown> | Record<string, unknown>[];
      totalCount?: string | number;
    };
    RESULT?: { resultCode?: string | number; resultMsg?: string };
  };

  // 에러 응답 처리
  if (parsed.RESULT && String(parsed.RESULT.resultCode ?? "") !== "0") {
    throw new Error(
      `[ZJ] VWorld 오류: ${parsed.RESULT.resultMsg ?? "unknown"}`,
    );
  }

  const fields = parsed.landUses?.field;
  const items: Record<string, unknown>[] = Array.isArray(fields)
    ? fields
    : fields
      ? [fields]
      : [];
  const records = items.map(normalize);
  const primary =
    records.find((r) => ["주거", "상업", "공업", "녹지"].includes(r.category)) ??
    records[0];
  return { primary, records, pnu: q.pnu };
}
