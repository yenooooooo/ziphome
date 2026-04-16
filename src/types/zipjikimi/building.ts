/**
 * @file building.ts
 * @description 건축물대장 관련 타입 (F02)
 * @module types/zipjikimi
 */

/** 건축물대장 표제부 정규화 레코드 */
export interface ZjBuildingRecord {
  /** 관리건축물대장 PK */
  mgmBldrgstPk?: string;
  /** 건물명 */
  buildingName?: string;
  /** 동 이름 (예: "101동") */
  dongName?: string;
  /** 대지 위치 (지번 주소) */
  platAddress?: string;
  /** 도로명 주소 */
  roadAddress?: string;
  /** 주용도 (예: "아파트", "다가구주택") */
  mainPurpose?: string;
  /** 구조 (예: "철근콘크리트구조") */
  structure?: string;
  /** 사용승인일 (YYYYMMDD) */
  approvalDate?: string;
  /** 준공년도 (사용승인일 앞 4자리) */
  builtYear?: number;
  /** 연면적 (㎡) */
  totalArea?: number;
  /** 건축면적 (㎡) */
  buildingArea?: number;
  /** 대지면적 (㎡) */
  platArea?: number;
  /** 지상층수 */
  groundFloors?: number;
  /** 지하층수 */
  undergroundFloors?: number;
  /** 건폐율 (%) */
  buildingCoverageRatio?: number;
  /** 용적률 (%) */
  floorAreaRatio?: number;
  /** 총 세대수 또는 호수 (주용도에 따라) */
  totalHouseholds?: number;
  /** 호수 (업무시설·오피스텔 용 — hoCnt) */
  totalUnits?: number;
  /** 실내 자주식 주차 (대) */
  indoorParkingCount?: number;
  /** 실외 자주식 주차 (대) */
  outdoorParkingCount?: number;
  /** 기계식 주차 (대) */
  mechParkingCount?: number;
  /** 총 주차 (실내+실외+기계) */
  totalParkingCount?: number;
  /** 승용 엘리베이터 (대) */
  passengerElevatorCount?: number;
  /** 비상용 엘리베이터 (대) */
  emergencyElevatorCount?: number;
  /** 용도지역 (예: "일반주거지역") */
  zoneName?: string;
  /** 원시 응답 (디버깅/추가 분석용) */
  raw?: Record<string, unknown>;
}
