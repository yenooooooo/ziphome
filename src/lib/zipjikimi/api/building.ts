/**
 * @file building.ts
 * @description 국토교통부 건축물대장 API — 표제부 조회
 * @api 공공데이터포털 — 건축물대장정보 서비스
 * @see https://www.data.go.kr/data/15044713/openapi.do
 * @module lib/zipjikimi/api
 */

import { fetchDataGoKrXml } from "./dataGoKr";
import type { ZjBuildingRecord } from "@/types/zipjikimi/building";

const ENDPOINT =
  "https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo";

function pickNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function pickString(v: unknown): string | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  return String(v).trim() || undefined;
}

/** 원시 표제부 → ZjBuildingRecord 정규화 */
function normalize(raw: Record<string, unknown>): ZjBuildingRecord {
  const approvalDate = pickString(raw["useAprDay"]);
  const builtYear =
    approvalDate && /^\d{8}$/.test(approvalDate)
      ? Number(approvalDate.slice(0, 4))
      : undefined;

  return {
    mgmBldrgstPk: pickString(raw["mgmBldrgstPk"]),
    buildingName: pickString(raw["bldNm"]),
    dongName: pickString(raw["dongNm"]),
    platAddress: pickString(raw["platPlc"]),
    roadAddress: pickString(raw["newPlatPlc"]),
    mainPurpose: pickString(raw["mainPurpsCdNm"]),
    structure: pickString(raw["strctCdNm"]),
    approvalDate,
    builtYear,
    totalArea: pickNumber(raw["totArea"]),
    buildingArea: pickNumber(raw["archArea"]),
    platArea: pickNumber(raw["platArea"]),
    groundFloors: pickNumber(raw["grndFlrCnt"]),
    undergroundFloors: pickNumber(raw["ugrndFlrCnt"]),
    buildingCoverageRatio: pickNumber(raw["bcRat"]),
    floorAreaRatio: pickNumber(raw["vlRat"]),
    // 공동주택(아파트/빌라)은 hhldCnt(세대수) / 업무시설·오피스텔은 hoCnt(호수)
    //   둘 중 0 이 아닌 값 우선 선택. 추가로 주용도 기준 표시 단위 판단용 hoCnt 도 보관.
    totalHouseholds:
      pickNumber(raw["hhldCnt"]) ||
      pickNumber(raw["totHhldCnt"]) ||
      pickNumber(raw["hoCnt"]) ||
      undefined,
    totalUnits: pickNumber(raw["hoCnt"]),
    indoorParkingCount: pickNumber(raw["indrAutoUtcnt"]),
    outdoorParkingCount: pickNumber(raw["oudrAutoUtcnt"]),
    mechParkingCount: pickNumber(raw["indrMechUtcnt"]),
    totalParkingCount:
      (pickNumber(raw["indrAutoUtcnt"]) ?? 0) +
      (pickNumber(raw["oudrAutoUtcnt"]) ?? 0) +
      (pickNumber(raw["indrMechUtcnt"]) ?? 0),
    passengerElevatorCount: pickNumber(raw["rideUseElvtCnt"]),
    emergencyElevatorCount: pickNumber(raw["emgenUseElvtCnt"]),
    zoneName: pickString(raw["jiyukNm"]),
    raw,
  };
}

export interface ZjBuildingQuery {
  sigunguCd: string; // 5자리
  bjdongCd: string; // 5자리
  bun?: string; // 4자리
  ji?: string; // 4자리
  platGbCd?: string; // "0" 대지 / "1" 산
}

/**
 * 건축물대장 표제부 조회. 복합건물(아파트 동)의 경우 여러 레코드가 반환됨.
 */
export async function fetchBuildingRegister(
  q: ZjBuildingQuery,
): Promise<ZjBuildingRecord[]> {
  const { items } = await fetchDataGoKrXml<Record<string, unknown>>(ENDPOINT, {
    sigunguCd: q.sigunguCd,
    bjdongCd: q.bjdongCd,
    bun: q.bun ?? "0000",
    ji: q.ji ?? "0000",
    platGbCd: q.platGbCd ?? "0",
    numOfRows: 100,
    pageNo: 1,
  });
  return items.map(normalize);
}
