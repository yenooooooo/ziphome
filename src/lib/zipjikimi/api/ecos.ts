/**
 * @file ecos.ts
 * @description 한국은행 ECOS Open API — 기준금리 조회 (F04 전환계산 용)
 * @api https://ecos.bok.or.kr/api/
 * @see https://ecos.bok.or.kr/api/ (StatisticSearch)
 * @module lib/zipjikimi/api
 *
 * @note 기준금리 통계:
 *   - 통계표 코드: 722Y001 (한국은행 기준금리)
 *   - 항목 코드:   0101000
 *   - 주기:        D (일별, 금리 변경일 기록)
 */

const BASE = "https://ecos.bok.or.kr/api/StatisticSearch";
const STAT_CODE = "722Y001";
const ITEM_CODE = "0101000";

export interface ZjBaseRate {
  /** 금리 (연 %) — 예: 3.5 */
  rate: number;
  /** 고시 날짜 (YYYYMMDD) */
  effectiveDate: string;
}

/**
 * 최근 한국은행 기준금리 조회.
 * @returns 가장 최신의 rate + effectiveDate
 */
export async function fetchLatestBaseRate(): Promise<ZjBaseRate> {
  const key = process.env.ZJ_ECOS_API_KEY;
  if (!key) {
    throw new Error("[ZJ] ZJ_ECOS_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  // 최근 2년치 중 최신 1건
  const today = new Date();
  const end =
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - 2);
  const start =
    startDate.getFullYear().toString() +
    String(startDate.getMonth() + 1).padStart(2, "0") +
    String(startDate.getDate()).padStart(2, "0");

  const url = `${BASE}/${key}/json/kr/1/100/${STAT_CODE}/D/${start}/${end}/${ITEM_CODE}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    next: { revalidate: 60 * 60 * 12 }, // 12h
  });
  if (!res.ok) {
    throw new Error(`[ZJ] ECOS API 오류: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as {
    StatisticSearch?: {
      row?: Array<{ TIME?: string; DATA_VALUE?: string }>;
    };
    RESULT?: { CODE?: string; MESSAGE?: string };
  };

  if (json.RESULT && json.RESULT.CODE !== "INFO-000") {
    throw new Error(`[ZJ] ECOS 오류: ${json.RESULT.MESSAGE}`);
  }

  const rows = json.StatisticSearch?.row ?? [];
  if (rows.length === 0) {
    throw new Error("[ZJ] ECOS 기준금리 데이터가 비어있습니다.");
  }
  // 최신순 정렬 (TIME 내림차순)
  rows.sort((a, b) => (b.TIME ?? "").localeCompare(a.TIME ?? ""));
  const latest = rows[0];
  return {
    rate: Number(latest.DATA_VALUE ?? 0),
    effectiveDate: String(latest.TIME ?? ""),
  };
}
