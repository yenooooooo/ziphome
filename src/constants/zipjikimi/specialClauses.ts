/**
 * @file specialClauses.ts
 * @description F22 — 계약서 특약사항 프리셋 템플릿
 *   Claude API 대신 거래 유형/상황별 미리 정의된 특약 목록 제공.
 * @module constants/zipjikimi
 */

export type ZjClauseCategory = "deposit" | "maintenance" | "tax" | "transfer" | "termination" | "general";

export interface ZjSpecialClause {
  id: string;
  category: ZjClauseCategory;
  label: string;
  /** 어떤 거래유형에 적용 */
  dealTypes: ("전세" | "월세" | "매매")[];
  text: string;
}

export const ZJ_CLAUSE_CATEGORIES: Record<ZjClauseCategory, string> = {
  deposit: "보증금 보호",
  maintenance: "하자·수선",
  tax: "세금·공과금",
  transfer: "소유권·양도",
  termination: "해지·갱신",
  general: "기타",
};

export const ZJ_SPECIAL_CLAUSES: ZjSpecialClause[] = [
  // ===== 보증금 보호 =====
  {
    id: "dep-01",
    category: "deposit",
    label: "선순위 담보 변동 금지",
    dealTypes: ["전세", "월세"],
    text: "임대인은 본 계약 기간 중 임차 목적물에 대하여 근저당권, 전세권, 가등기 등 선순위 담보물권을 추가 설정하거나 변경하지 아니한다. 이를 위반할 경우 임차인은 즉시 계약을 해지하고 보증금 전액의 반환을 청구할 수 있다.",
  },
  {
    id: "dep-02",
    category: "deposit",
    label: "보증금 반환 보증",
    dealTypes: ["전세", "월세"],
    text: "임대인은 임차인의 전세보증금반환보증보험(HUG/HF/SGI) 가입에 적극 협조하며, 보험 가입에 필요한 서류(등기사항전부증명서, 인감증명서 등)를 지체 없이 제공한다.",
  },
  {
    id: "dep-03",
    category: "deposit",
    label: "보증금 반환 기한",
    dealTypes: ["전세", "월세"],
    text: "임대차 계약 종료일로부터 1개월 이내에 보증금 전액을 임차인 명의 계좌로 반환한다. 지연 시 연 5%의 지연이자를 가산한다.",
  },

  // ===== 하자·수선 =====
  {
    id: "mnt-01",
    category: "maintenance",
    label: "입주 전 하자 보수",
    dealTypes: ["전세", "월세"],
    text: "임대인은 입주일 전까지 다음 항목의 하자를 보수 완료한다: [도배/장판/보일러/배관/방수/기타]. 미이행 시 임차인이 직접 보수하고 그 비용을 보증금에서 공제할 수 있다.",
  },
  {
    id: "mnt-02",
    category: "maintenance",
    label: "주요 시설 보증기간",
    dealTypes: ["전세", "월세"],
    text: "임대인은 입주일로부터 90일 이내 발생하는 주요 시설물(보일러, 배관, 방수, 전기설비) 하자에 대해 48시간 이내 보수를 이행한다. 보수 불이행 시 임차인이 직접 보수하고 비용을 청구한다.",
  },
  {
    id: "mnt-03",
    category: "maintenance",
    label: "곰팡이·결로 책임",
    dealTypes: ["전세", "월세"],
    text: "구조적 원인에 의한 곰팡이, 결로, 누수 발생 시 임대인의 비용으로 원인 제거 및 보수한다. 임차인의 생활 부주의에 의한 경우는 제외한다.",
  },

  // ===== 세금·공과금 =====
  {
    id: "tax-01",
    category: "tax",
    label: "세금 완납 확인",
    dealTypes: ["전세", "월세", "매매"],
    text: "임대인(매도인)은 계약일 현재 해당 부동산에 대한 재산세, 종합부동산세 등 국세·지방세가 완납되었음을 확인하며, 체납 사실이 발견될 경우 계약을 해지하고 보증금(계약금) 전액을 즉시 반환한다.",
  },
  {
    id: "tax-02",
    category: "tax",
    label: "관리비 정산 기준",
    dealTypes: ["전세", "월세"],
    text: "입주일 이전의 관리비, 수도·전기·가스 요금은 임대인이 부담하고, 입주일 이후는 임차인이 부담한다. 정산은 입주일 기준 검침값을 근거로 한다.",
  },

  // ===== 소유권·양도 =====
  {
    id: "trn-01",
    category: "transfer",
    label: "소유권 이전 시 보증금 승계",
    dealTypes: ["전세", "월세"],
    text: "임대차 기간 중 임대 목적물의 소유권이 제3자에게 이전되는 경우, 양수인은 본 임대차 계약상 임대인의 지위를 승계하며 보증금 반환 의무를 연대하여 부담한다.",
  },
  {
    id: "trn-02",
    category: "transfer",
    label: "경매·공매 시 보증금 보호",
    dealTypes: ["전세"],
    text: "본 부동산이 경매 또는 공매 절차에 진행되는 경우, 임대인은 임차인에게 지체 없이 통지하며, 임차인의 보증금 반환을 위해 최대한 협조한다.",
  },

  // ===== 해지·갱신 =====
  {
    id: "ter-01",
    category: "termination",
    label: "계약갱신청구권 고지",
    dealTypes: ["전세", "월세"],
    text: "임차인은 주택임대차보호법 제6조의3에 따른 계약갱신청구권을 가지며, 임대인은 정당한 사유 없이 이를 거절하지 아니한다.",
  },
  {
    id: "ter-02",
    category: "termination",
    label: "중도 해지 조건",
    dealTypes: ["전세", "월세"],
    text: "임차인은 잔여 계약기간이 6개월 이상인 경우 2개월 전 서면 통보로 계약을 해지할 수 있다. 이 경우 위약금은 보증금의 10%를 초과할 수 없다.",
  },

  // ===== 기타 =====
  {
    id: "gen-01",
    category: "general",
    label: "반려동물 허용",
    dealTypes: ["전세", "월세"],
    text: "임차인은 소형 반려동물(체중 10kg 이하)을 사육할 수 있다. 퇴거 시 반려동물로 인한 훼손은 임차인이 원상복구한다.",
  },
  {
    id: "gen-02",
    category: "general",
    label: "주차장 사용",
    dealTypes: ["전세", "월세"],
    text: "임대인은 임차인에게 지정 주차구역 1면을 무상으로 제공하며, 계약 기간 중 변경하지 아니한다.",
  },
  {
    id: "gen-03",
    category: "general",
    label: "중개보수 부담 명시",
    dealTypes: ["전세", "월세", "매매"],
    text: "중개보수는 법정 상한 범위 내에서 임대인(매도인)과 임차인(매수인)이 각각 부담한다. 구체적 금액은 별도 합의한다.",
  },
];
