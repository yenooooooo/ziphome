/**
 * @file ZjRiskBadge.tsx
 * @description Guardian's "Status Glow Chip" — 큰 라운드 상태 칩 (점 X)
 *              4단계: 안전/주의/위험/매우위험
 * @module components/zipjikimi/ui
 */

import { cn } from "@/lib/utils";
import type { ZjRiskLevel } from "@/types/zipjikimi/property";

const STYLES: Record<ZjRiskLevel, string> = {
  안전: "chip-safe",
  주의: "chip-caution",
  위험: "chip-danger",
  매우위험: "chip-critical",
};

export interface ZjRiskBadgeProps {
  level: ZjRiskLevel;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ZjRiskBadge({
  level,
  className,
  size = "md",
}: ZjRiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold tracking-tight",
        STYLES[level],
        size === "sm" && "px-2.5 py-1 text-[11px]",
        size === "md" && "px-3.5 py-1.5 text-xs",
        size === "lg" && "px-5 py-2 text-sm",
        className,
      )}
    >
      {level}
    </span>
  );
}
