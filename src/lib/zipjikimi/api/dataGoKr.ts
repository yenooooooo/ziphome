/**
 * @file dataGoKr.ts
 * @description 공공데이터포털 (data.go.kr) 공통 fetch — XML → JSON 파싱 + 에러 매핑
 * @api 공공데이터포털
 * @see https://www.data.go.kr/
 * @module lib/zipjikimi/api
 *
 * @note 대부분의 국토부 API는 XML 기본 응답. _type=json 지원 엔드포인트도 있지만
 *       안정성을 위해 XML 파싱 통일. ServiceKey는 data.go.kr 발급 키 (디코딩 버전).
 */

import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  parseTagValue: true,
  numberParseOptions: { leadingZeros: false, hex: false, skipLike: /^\d{8,}$/ },
});

export interface ZjDataGoKrResult<T> {
  /** 응답 body 안의 items (단일 item도 배열로 정규화) */
  items: T[];
  totalCount: number;
  pageNo: number;
  numOfRows: number;
}

/**
 * 공공데이터포털 XML API 공통 호출자.
 * @param endpoint 전체 URL (예: http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/...)
 * @param params 쿼리 파라미터 (serviceKey는 자동 주입)
 * @param itemTag 응답 XML에서 item 태그명 (보통 "item")
 */
export async function fetchDataGoKrXml<T>(
  endpoint: string,
  params: Record<string, string | number>,
  itemTag = "item",
): Promise<ZjDataGoKrResult<T>> {
  const key = process.env.ZJ_DATA_GO_KR_API_KEY;
  if (!key) {
    throw new Error("[ZJ] ZJ_DATA_GO_KR_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  // ServiceKey는 디코딩 버전으로 받았으므로 fetch 시 재인코딩
  const query = new URLSearchParams({
    serviceKey: key,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const url = `${endpoint}?${query.toString()}`;
  const res = await fetch(url, {
    headers: {
      // ⚠️ 공공데이터포털 WAF가 User-Agent 없으면 "Request Blocked" 로 차단.
      //     Node.js 기본 UA 로는 통과 안 됨 — 브라우저 UA 지정 필수.
      "User-Agent":
        "Mozilla/5.0 (compatible; ZipJikimi/1.0; +https://github.com/zipjikimi)",
      Accept: "application/xml, text/xml",
    },
    // 공공데이터포털은 간헐적으로 느림 — 15초 타임아웃
    signal: AbortSignal.timeout(15000),
    // Next.js: 10분 revalidate (페이지 레벨 캐시, Supabase 캐시와 별개)
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new Error(
      `[ZJ] data.go.kr ${res.status} ${res.statusText} @ ${endpoint}${
        bodyText ? ` — ${bodyText.slice(0, 200)}` : ""
      }`,
    );
  }

  const xml = await res.text();
  const parsed = parser.parse(xml) as ZjDataGoKrEnvelope<T>;

  const header = parsed?.response?.header;
  if (header) {
    const code = String(header.resultCode ?? "").trim();
    const msg = (header.resultMsg ?? "").toString().toUpperCase();
    // 정상 코드: "000" / "00" / 0 / "NORMAL SERVICE" / "OK"
    const ok =
      code === "000" ||
      code === "00" ||
      code === "0" ||
      msg.includes("NORMAL") ||
      msg === "OK";
    if (!ok) {
      throw new Error(
        `[ZJ] data.go.kr API 오류 (${code}): ${header.resultMsg ?? "unknown"}`,
      );
    }
  }

  const body = parsed?.response?.body;
  if (!body) {
    return { items: [], totalCount: 0, pageNo: 1, numOfRows: 0 };
  }

  // items.item 은 단일 객체 또는 배열 둘 다 가능 — 배열로 정규화
  const rawItems = body.items?.[itemTag];
  const items: T[] = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  return {
    items,
    totalCount: Number(body.totalCount ?? 0),
    pageNo: Number(body.pageNo ?? 1),
    numOfRows: Number(body.numOfRows ?? items.length),
  };
}

interface ZjDataGoKrEnvelope<T> {
  response?: {
    header?: {
      resultCode?: string | number;
      resultMsg?: string;
    };
    body?: {
      items?: Record<string, T | T[]>;
      totalCount?: string | number;
      pageNo?: string | number;
      numOfRows?: string | number;
    };
  };
}
