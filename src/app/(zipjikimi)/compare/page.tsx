"use client";

/**
 * @file compare/page.tsx
 * @description F27 — 물건 비교 (저장된 물건 2~3개 나란히)
 * @module app/(zipjikimi)/compare
 */

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Search,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatKRW, classifyBuildingAge } from "@/lib/zipjikimi/utils/format";
import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";
import { useSavedProperties } from "@/hooks/zipjikimi/useSavedProperties";

export default function ZjComparePage() {
  const { properties } = useSavedProperties();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  }

  const compared = properties.filter((p) => selected.has(p.id));

  return (
    <>
      <ZjMobileHeader title="물건 비교" />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-4 md:pt-8 pb-10 space-y-6">
        <div className="space-y-2">
          <span className="label-eyebrow">Compare</span>
          <h1 className="font-headline font-extrabold text-[1.75rem] md:text-[2.5rem] tracking-tight leading-tight">
            물건 비교
          </h1>
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <Building2 className="h-10 w-10 text-outline mx-auto" />
              <div className="font-headline font-bold text-lg">
                저장된 물건이 없습니다
              </div>
              <p className="text-sm text-on-surface-variant">
                물건을 2개 이상 저장하면 나란히 비교할 수 있습니다.
              </p>
              <Link href="/property/new">
                <Button className="mt-2">
                  <Search className="h-4 w-4" />
                  물건 검증하러 가기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 물건 선택 (최대 3개) */}
            <Card>
              <CardContent className="space-y-3">
                <div className="label-eyebrow">
                  비교할 물건 선택 (최대 3개, {selected.size}/3)
                </div>
                <div className="space-y-2">
                  {properties.map((p) => {
                    const isSelected = selected.has(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleSelect(p.id)}
                        disabled={!isSelected && selected.size >= 3}
                        className={cn(
                          "w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 transition-all",
                          isSelected
                            ? "bg-primary-fixed/40"
                            : "bg-surface-container-low active:bg-surface-container",
                          !isSelected && selected.size >= 3 && "opacity-40",
                        )}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-outline shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-[14px] truncate">
                            {p.buildingName ?? p.addressRoad ?? p.address}
                          </div>
                          <div className="text-[11px] text-on-surface-variant truncate">
                            {p.address}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 비교 테이블 */}
            {compared.length >= 2 && (
              <Card>
                <CardContent className="space-y-4">
                  <div className="label-eyebrow">비교 결과</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr>
                          <th className="text-left py-2 pr-3 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold w-24">
                            항목
                          </th>
                          {compared.map((p) => (
                            <th
                              key={p.id}
                              className="text-left py-2 px-2 font-headline font-bold text-[13px] min-w-[120px]"
                            >
                              {p.buildingName ?? p.address.split(" ").slice(-1)[0]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        <CompareRow
                          label="주소"
                          values={compared.map((p) => p.addressRoad ?? p.address)}
                        />
                        <CompareRow
                          label="용도"
                          values={compared.map((p) => p.mainPurpose ?? "-")}
                        />
                        <CompareRow
                          label="매매 평균"
                          values={compared.map((p) =>
                            p.avgSalePrice
                              ? formatKRW(p.avgSalePrice, { compact: true })
                              : "-",
                          )}
                        />
                        <CompareRow
                          label="전세 평균"
                          values={compared.map((p) =>
                            p.avgJeonseDeposit
                              ? formatKRW(p.avgJeonseDeposit, { compact: true })
                              : "-",
                          )}
                        />
                        <CompareRow
                          label="준공"
                          values={compared.map((p) =>
                            p.builtYear ? `${p.builtYear}년` : "-",
                          )}
                        />
                        <CompareRow
                          label="노후도"
                          values={compared.map((p) =>
                            p.builtYear
                              ? classifyBuildingAge(p.builtYear).label
                              : "-",
                          )}
                        />
                        <CompareRow
                          label="상태"
                          values={compared.map((p) => p.status)}
                        />
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {compared.length < 2 && selected.size > 0 && (
              <p className="text-sm text-on-surface-variant text-center">
                2개 이상 선택하면 비교 테이블이 표시됩니다.
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}

function CompareRow({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <tr>
      <td className="py-2.5 pr-3 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold align-top">
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} className="py-2.5 px-2 font-medium align-top">
          {v}
        </td>
      ))}
    </tr>
  );
}
