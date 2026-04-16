/**
 * @file checklistItems.ts
 * @description F21 — 전세사기 예방 체크리스트 항목 (4단계)
 * @module constants/zipjikimi
 */

export type ZjChecklistPhase = "pre" | "during" | "post" | "moving";

export interface ZjChecklistItem {
  id: string;
  phase: ZjChecklistPhase;
  label: string;
  detail?: string;
  critical?: boolean;
}

export const ZJ_CHECKLIST_PHASES: Record<
  ZjChecklistPhase,
  { label: string; eyebrow: string }
> = {
  pre: { label: "계약 전", eyebrow: "Before Contract" },
  during: { label: "계약 시", eyebrow: "At Signing" },
  post: { label: "계약 후", eyebrow: "After Contract" },
  moving: { label: "이사", eyebrow: "Moving Day" },
};

export const ZJ_CHECKLIST_ITEMS: ZjChecklistItem[] = [
  // ===== 계약 전 =====
  { id: "pre-01", phase: "pre", label: "등기부등본 열람", detail: "소유자·근저당·압류·가등기 확인. 계약 당일 재확인 필수.", critical: true },
  { id: "pre-02", phase: "pre", label: "전세가율 확인", detail: "전세보증금 / 매매 시세 = 80% 이상이면 깡통전세 위험.", critical: true },
  { id: "pre-03", phase: "pre", label: "건축물대장 확인", detail: "용도(주택 맞는지), 면적, 위반건축물 여부." },
  { id: "pre-04", phase: "pre", label: "공인중개사 자격 확인", detail: "중개업 등록증 + 행정처분 이력 조회." },
  { id: "pre-05", phase: "pre", label: "임대인 신분 확인", detail: "등기부 소유자와 계약 상대방 일치 여부. 대리인이면 위임장+인감증명." },
  { id: "pre-06", phase: "pre", label: "실거래가 시세 비교", detail: "동일 평형 최근 거래가와 비교. 시세보다 20%+ 저렴하면 의심." },
  { id: "pre-07", phase: "pre", label: "전세보증보험 가입 가능 확인", detail: "HUG/HF/SGI 가입 요건 사전 확인. 가입 불가면 계약 재고." },
  { id: "pre-08", phase: "pre", label: "현장 방문 + 점검", detail: "누수, 곰팡이, 보일러, 수도, 전기, 도배 상태. 사진 촬영." },
  { id: "pre-09", phase: "pre", label: "주변 환경 확인", detail: "소음, 일조권, 주차, 교통, 편의시설." },
  { id: "pre-10", phase: "pre", label: "국세/지방세 완납증명 요구", detail: "임대인의 세금 체납 여부. 체납 시 보증금 우선변제 위협." },

  // ===== 계약 시 =====
  { id: "dur-01", phase: "during", label: "등기부등본 재확인 (당일)", detail: "계약 직전 인터넷등기소에서 재열람. 전일과 변경사항 없는지.", critical: true },
  { id: "dur-02", phase: "during", label: "특약사항 삽입", detail: "선순위 담보 변동 금지, 하자 보수 책임, 계약 해지 조건 등.", critical: true },
  { id: "dur-03", phase: "during", label: "계약서 원본 수령", detail: "임대인·임차인·중개사 각 1부. 서명/날인 확인." },
  { id: "dur-04", phase: "during", label: "중개수수료 확인", detail: "법정 상한 이내인지. 현금영수증/세금계산서 수령." },
  { id: "dur-05", phase: "during", label: "보증금 계좌 확인", detail: "임대인 본인 명의 계좌로만 송금. 대리인 계좌 X.", critical: true },
  { id: "dur-06", phase: "during", label: "잔금일 명시", detail: "잔금일 + 입주일이 계약서에 명확히 기재." },

  // ===== 계약 후 =====
  { id: "post-01", phase: "post", label: "전입신고 (입주 당일)", detail: "주민센터 방문 또는 정부24 온라인. 입주 당일 즉시.", critical: true },
  { id: "post-02", phase: "post", label: "확정일자 받기", detail: "전입신고와 동시에 확정일자. 대항력 + 우선변제권 확보.", critical: true },
  { id: "post-03", phase: "post", label: "전세보증보험 가입", detail: "HUG: 전입+확정일자 후 가입. 전입 전 가입하면 무효.", critical: true },
  { id: "post-04", phase: "post", label: "임대차 신고", detail: "보증금 6천만 또는 월세 30만 초과 시 30일 이내 신고 의무." },
  { id: "post-05", phase: "post", label: "등기부등본 재확인 (잔금 후)", detail: "잔금 지급 후 근저당 추가 설정 여부 확인." },
  { id: "post-06", phase: "post", label: "하자 보수 요청", detail: "입주 후 발견된 하자 사진 촬영 + 내용증명 발송 (2주 이내 권장)." },

  // ===== 이사 =====
  { id: "mov-01", phase: "moving", label: "이사 전 검침 (전기/가스/수도)", detail: "이전 세대 사용량과 분리. 검침 사진 촬영." },
  { id: "mov-02", phase: "moving", label: "인터넷/TV 이전 신청", detail: "이사 1~2주 전 신청." },
  { id: "mov-03", phase: "moving", label: "우편물 전송 신청", detail: "우체국 방문 또는 온라인. 6개월간 전달." },
  { id: "mov-04", phase: "moving", label: "주소 변경 (각종)", detail: "은행, 카드, 보험, 면허증, 건강보험 등." },
  { id: "mov-05", phase: "moving", label: "퇴거 시 원상복구", detail: "벽 못 구멍, 시트지 등 원상복구. 사진으로 기록." },
  { id: "mov-06", phase: "moving", label: "보증금 반환 확인", detail: "퇴거일에 보증금 전액 수령. 미반환 시 임차권등기명령 검토." },
];
