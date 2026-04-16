/**
 * @file ZjBuildingInfoCard.tsx
 * @description F02 건축물대장 카드 — Guardian's Lens 섹션 스타일
 * @module components/zipjikimi/ui
 */

import { Card, CardContent } from "@/components/ui/card";
import { Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { classifyBuildingAge, formatArea } from "@/lib/zipjikimi/utils/format";
import type { ZjBuildingRecord } from "@/types/zipjikimi/building";

export interface ZjBuildingInfoCardProps {
  records: ZjBuildingRecord[];
}

const AGE_CHIP: Record<string, string> = {
  신축: "chip-safe",
  양호: "chip-safe",
  보통: "chip-caution",
  노후: "chip-danger",
  재건축: "chip-critical",
};

export default function ZjBuildingInfoCard({ records }: ZjBuildingInfoCardProps) {
  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-2">
          <span className="label-eyebrow">Building Registry</span>
          <div className="font-headline font-bold text-lg">건축물대장</div>
          <p className="text-sm text-on-surface-variant pt-2">
            해당 주소의 건축물대장 정보가 없습니다. 신축이거나 지번 매칭이 실패했을 수 있습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  const primary = records[0];
  const age =
    primary.builtYear !== undefined ? classifyBuildingAge(primary.builtYear) : null;

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="label-eyebrow">Building Registry</span>
            <div className="font-headline font-bold text-lg mt-1">
              {primary.buildingName ?? primary.mainPurpose ?? "건축물 정보"}
            </div>
          </div>
          {age && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold shrink-0",
                AGE_CHIP[age.label],
              )}
            >
              {age.label} · {age.years}년
            </span>
          )}
        </div>

        <div className="rounded-[1.5rem] bg-surface-container-low p-5 grid grid-cols-2 gap-x-4 gap-y-3.5">
          {primary.mainPurpose && <Stat label="용도" value={primary.mainPurpose} />}
          {primary.structure && <Stat label="구조" value={primary.structure} />}
          {primary.builtYear && (
            <Stat label="준공" value={`${primary.builtYear}년`} />
          )}
          {primary.groundFloors !== undefined && (
            <Stat
              label="층수"
              value={`지상 ${primary.groundFloors}${
                primary.undergroundFloors ? ` / 지하 ${primary.undergroundFloors}` : ""
              }`}
            />
          )}
          {primary.totalArea !== undefined && (
            <Stat label="연면적" value={formatArea(primary.totalArea)} />
          )}
          {primary.totalHouseholds !== undefined && primary.totalHouseholds > 0 && (
            <Stat
              label={
                (primary.mainPurpose?.includes("업무") ||
                  primary.mainPurpose?.includes("오피스텔"))
                  ? "호수"
                  : "세대수"
              }
              value={`${primary.totalHouseholds.toLocaleString()}${
                (primary.mainPurpose?.includes("업무") ||
                  primary.mainPurpose?.includes("오피스텔"))
                  ? "호"
                  : "세대"
              }`}
            />
          )}
          {primary.totalParkingCount !== undefined && primary.totalParkingCount > 0 && (
            <Stat
              label="주차"
              value={`${primary.totalParkingCount}대${
                primary.mechParkingCount
                  ? ` (기계식 ${primary.mechParkingCount})`
                  : ""
              }`}
            />
          )}
          {primary.passengerElevatorCount !== undefined &&
            primary.passengerElevatorCount > 0 && (
              <Stat
                label="엘리베이터"
                value={`승용 ${primary.passengerElevatorCount}대${
                  primary.emergencyElevatorCount
                    ? ` / 비상 ${primary.emergencyElevatorCount}`
                    : ""
                }`}
              />
            )}
        </div>

        {records.length > 1 && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Building className="h-3.5 w-3.5" />+ 이 주소에 다른 동 {records.length - 1}개가
            더 등록되어 있습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
        {label}
      </div>
      <div className="text-[14px] font-semibold text-on-surface">{value}</div>
    </div>
  );
}
