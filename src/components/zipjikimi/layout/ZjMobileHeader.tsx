/**
 * @file ZjMobileHeader.tsx
 * @description 모바일 상단 글래스 헤더 — Guardian's Lens
 * @module components/zipjikimi/layout
 */

import { cn } from "@/lib/utils";

export interface ZjMobileHeaderProps {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  /** 투명 배경 (히어로 섹션 위에 올릴 때) */
  transparent?: boolean;
}

export default function ZjMobileHeader({
  title,
  left,
  right,
  className,
  transparent,
}: ZjMobileHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 md:hidden safe-top",
        transparent ? "bg-transparent" : "glass",
        className,
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2 min-w-11">{left}</div>
        {title && (
          <h1 className="text-[15px] font-headline font-bold tracking-tight truncate">
            {title}
          </h1>
        )}
        <div className="flex items-center gap-2 min-w-11 justify-end">{right}</div>
      </div>
    </header>
  );
}
