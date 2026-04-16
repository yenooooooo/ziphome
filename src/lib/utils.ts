/**
 * @file utils.ts
 * @description 공용 유틸 — shadcn/ui + 전역에서 사용하는 클래스 네임 합성 헬퍼
 * @module lib
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind 클래스 충돌 해결 + 조건부 클래스 합성.
 * shadcn/ui 컴포넌트들이 내부에서 사용하는 표준 헬퍼.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
