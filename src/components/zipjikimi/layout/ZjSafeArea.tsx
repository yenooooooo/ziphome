/**
 * @file ZjSafeArea.tsx
 * @description iOS Safe Area 래퍼 — 노치/다이나믹 아일랜드/홈 인디케이터 영역 여백 처리
 * @module components/zipjikimi/layout
 */

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ZjSafeAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** 어느 방향에 safe-area 패딩을 적용할지 */
  top?: boolean;
  bottom?: boolean;
  x?: boolean;
}

/**
 * 자식 콘텐츠를 Safe Area 경계 안으로 밀어넣는 래퍼.
 * @example
 * <ZjSafeArea top bottom x>...</ZjSafeArea>
 */
export default function ZjSafeArea({
  top = false,
  bottom = false,
  x = false,
  className,
  children,
  ...rest
}: ZjSafeAreaProps) {
  return (
    <div
      className={cn(
        top && "safe-top",
        bottom && "safe-bottom",
        x && "safe-x",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
