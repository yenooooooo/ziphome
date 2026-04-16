/**
 * @file format.ts
 * @description 집지킴이 공용 포맷 유틸 — 금액(만원 기준), 면적, 날짜, 전세가율
 * @module lib/zipjikimi/utils
 */

/**
 * 만원 단위 숫자를 "X억 Y,YYY만원" 한글 표기로 변환.
 * @param man 만원 단위 금액 (예: 85000 → "8억 5,000만원")
 * @param opts.compact true면 "8.5억" 식으로 축약
 * @example
 *   formatKRW(85000)             // "8억 5,000만원"
 *   formatKRW(85000, {compact})  // "8.5억"
 *   formatKRW(500)               // "500만원"
 */
export function formatKRW(
  man: number | null | undefined,
  opts: { compact?: boolean } = {},
): string {
  if (man === null || man === undefined || Number.isNaN(man)) return "-";
  const sign = man < 0 ? "-" : "";
  const abs = Math.abs(Math.round(man));

  if (opts.compact) {
    // 1억 미만 → "X,XXX만원"
    if (abs < 10000) return `${sign}${abs.toLocaleString()}만원`;
    // 소수 1자리로 반올림 (예: 1.95 → 2.0, 1.94 → 1.9)
    const roundedEok = Math.round(abs / 1000) / 10;
    // 정수면 "X억", 소수면 "X.Y억"
    const text =
      roundedEok === Math.floor(roundedEok)
        ? `${roundedEok}억`
        : `${roundedEok.toFixed(1)}억`;
    return `${sign}${text}`;
  }

  const eok = Math.floor(abs / 10000);
  const rem = abs % 10000;
  if (eok === 0) return `${sign}${abs.toLocaleString()}만원`;
  if (rem === 0) return `${sign}${eok}억원`;
  return `${sign}${eok}억 ${rem.toLocaleString()}만원`;
}

/** 원 단위를 만원 단위로 변환 (정수, 반올림) */
export function wonToMan(won: number): number {
  return Math.round(won / 10000);
}

/**
 * m² → 평 변환 (1평 = 3.3058m²)
 * @example formatArea(84.5) // "84.5㎡ (25.6평)"
 */
export function formatArea(m2: number | null | undefined): string {
  if (m2 === null || m2 === undefined || Number.isNaN(m2)) return "-";
  const pyeong = m2 / 3.3058;
  return `${m2.toFixed(1)}㎡ (${pyeong.toFixed(1)}평)`;
}

/**
 * 전세가율 = 전세보증금 / 매매가 → 0~1 실수를 % 표시
 * @example formatRatio(0.82) // "82.0%"
 */
export function formatRatio(
  ratio: number | null | undefined,
  digits = 1,
): string {
  if (ratio === null || ratio === undefined || Number.isNaN(ratio)) return "-";
  return `${(ratio * 100).toFixed(digits)}%`;
}

/**
 * YYYY-MM-DD 또는 YYYYMMDD 문자열을 "2026년 4월 15일"로 포맷.
 */
export function formatKoreanDate(input: string | Date | null | undefined): string {
  if (!input) return "-";
  const d = input instanceof Date ? input : parseFlexibleDate(input);
  if (!d || Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function parseFlexibleDate(s: string): Date | null {
  const cleaned = s.replace(/[^0-9]/g, "");
  if (cleaned.length === 8) {
    const y = Number(cleaned.slice(0, 4));
    const m = Number(cleaned.slice(4, 6));
    const d = Number(cleaned.slice(6, 8));
    return new Date(y, m - 1, d);
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * 건물 연식 → 등급 (CLAUDE.md F10 기준)
 *   5년 미만 신축 / 5~15 양호 / 15~25 보통 / 25~35 노후 / 35년+ 재건축
 */
export function classifyBuildingAge(builtYear: number): {
  years: number;
  label: "신축" | "양호" | "보통" | "노후" | "재건축";
} {
  const now = new Date().getFullYear();
  const years = now - builtYear;
  let label: "신축" | "양호" | "보통" | "노후" | "재건축";
  if (years < 5) label = "신축";
  else if (years < 15) label = "양호";
  else if (years < 25) label = "보통";
  else if (years < 35) label = "노후";
  else label = "재건축";
  return { years, label };
}
