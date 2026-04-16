/**
 * @file api/business/route.ts
 * @description F16 사업자등록 상태 확인 (국세청 API)
 * @api POST /api/business  body: { businessNumber: "1234567890" }
 * @see https://www.data.go.kr/data/15081808/openapi.do
 * @module app/(zipjikimi)/api/business
 */

import { NextResponse } from "next/server";
import type { ZjApiResponse } from "@/types/zipjikimi/api";

interface ZjBusinessStatus {
  businessNumber: string;
  status: "계속사업자" | "휴업자" | "폐업자" | "알수없음";
  taxType?: string;
  closingDate?: string;
}

export async function POST(
  req: Request,
): Promise<NextResponse<ZjApiResponse<ZjBusinessStatus>>> {
  const body = (await req.json()) as { businessNumber?: string };
  const bn = body.businessNumber?.replace(/[^0-9]/g, "");

  if (!bn || bn.length !== 10) {
    return NextResponse.json({
      success: false,
      error: "사업자번호는 10자리 숫자입니다.",
      code: "INVALID_BN",
    });
  }

  const key = process.env.ZJ_DATA_GO_KR_API_KEY;
  if (!key) {
    return NextResponse.json({
      success: false,
      error: "ZJ_DATA_GO_KR_API_KEY 환경변수가 필요합니다.",
      code: "MISSING_KEY",
    });
  }

  try {
    const res = await fetch(
      `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; ZipJikimi/1.0)",
          Accept: "application/json",
        },
        body: JSON.stringify({ b_no: [bn] }),
      },
    );

    const json = (await res.json()) as {
      code?: number;
      msg?: string;
      data?: Array<{
        b_no?: string;
        b_stt?: string;
        b_stt_cd?: string;
        tax_type?: string;
        end_dt?: string;
      }>;
    };

    // odcloud.kr 에러 응답 처리
    if (json.code && json.code !== 0) {
      const errMsg = json.msg ?? "알 수 없는 오류";
      if (json.code === -401 || errMsg.includes("인증키")) {
        return NextResponse.json({
          success: false,
          error:
            "국세청 사업자조회 API 활용신청이 필요합니다. data.go.kr → '국세청_사업자등록정보 진위확인 및 상태조회 서비스' 활용신청 후 사용 가능합니다.",
          code: "API_NOT_SUBSCRIBED",
        });
      }
      return NextResponse.json({
        success: false,
        error: `국세청 API 오류: ${errMsg}`,
        code: "NTS_ERROR",
      });
    }

    const item = json.data?.[0];
    if (!item) {
      return NextResponse.json({
        success: true,
        data: {
          businessNumber: bn,
          status: "알수없음" as const,
        },
        cached: false,
        timestamp: new Date().toISOString(),
      });
    }

    let status: ZjBusinessStatus["status"];
    switch (item.b_stt_cd) {
      case "01":
        status = "계속사업자";
        break;
      case "02":
        status = "휴업자";
        break;
      case "03":
        status = "폐업자";
        break;
      default:
        status = "알수없음";
    }

    return NextResponse.json({
      success: true,
      data: {
        businessNumber: bn,
        status,
        taxType: item.tax_type || undefined,
        closingDate: item.end_dt || undefined,
      },
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      error: message,
      code: "FETCH_FAILED",
    });
  }
}
