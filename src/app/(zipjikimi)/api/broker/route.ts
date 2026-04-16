/**
 * @file api/broker/route.ts
 * @description F15 — 공인중개사 조회 (공공데이터 중개업 API)
 * @api GET /api/broker?name=중개사명&region=11545
 * @module app/(zipjikimi)/api/broker
 */

import { NextResponse } from "next/server";
import { fetchDataGoKrXml } from "@/lib/zipjikimi/api/dataGoKr";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

interface ZjBrokerResult {
  name: string;
  representative?: string;
  address?: string;
  registrationNo?: string;
  status?: string;
  sanctions?: string[];
}

const ENDPOINT =
  "https://apis.data.go.kr/1613000/BrokerService/getBrokerInfo";

export async function GET(
  req: Request,
): Promise<NextResponse<ZjApiResponse<ZjBrokerResult[]>>> {
  const url = new URL(req.url);
  const name = url.searchParams.get("name")?.trim();
  const region = url.searchParams.get("region")?.trim();

  if (!name) {
    return NextResponse.json({
      success: false,
      error: "name 파라미터가 필요합니다.",
      code: "MISSING_NAME",
    });
  }

  try {
    const { items } = await fetchDataGoKrXml<Record<string, unknown>>(
      ENDPOINT,
      {
        brkrNm: name,
        ...(region ? { sigunguCd: region } : {}),
        numOfRows: 10,
        pageNo: 1,
      },
    );

    const results: ZjBrokerResult[] = items.map((raw) => ({
      name: String(raw["brkrNm"] ?? raw["ldcgOfficNm"] ?? name),
      representative: raw["rprsntvNm"]
        ? String(raw["rprsntvNm"])
        : undefined,
      address: raw["bsnmCmpnmAdres"]
        ? String(raw["bsnmCmpnmAdres"])
        : undefined,
      registrationNo: raw["jurirno"]
        ? String(raw["jurirno"])
        : undefined,
      status: raw["sttusSeNm"]
        ? String(raw["sttusSeNm"])
        : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: results,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      error: `중개사 조회 실패: ${message}`,
      code: "FETCH_FAILED",
    });
  }
}
