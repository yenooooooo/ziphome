"use client";

/**
 * @file legal/page.tsx
 * @description F22 특약 템플릿 + F24 임대차 신고 + F25 법률 가이드 통합 페이지
 * @module app/(zipjikimi)/legal
 */

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  FileText,
  Scale,
  AlertTriangle,
  ExternalLink,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";
import {
  ZJ_SPECIAL_CLAUSES,
  ZJ_CLAUSE_CATEGORIES,
  type ZjClauseCategory,
} from "@/constants/zipjikimi/specialClauses";

const CATEGORIES = Object.entries(ZJ_CLAUSE_CATEGORIES) as [
  ZjClauseCategory,
  string,
][];

export default function ZjLegalPage() {
  return (
    <>
      <ZjMobileHeader title="법률 가이드" />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-4 md:pt-8 pb-10 space-y-6">
        <div className="space-y-2">
          <span className="label-eyebrow">Legal Watch</span>
          <h1 className="font-headline font-extrabold text-[1.75rem] md:text-[2.5rem] tracking-tight leading-tight">
            법률 가이드
          </h1>
        </div>

        <Tabs defaultValue="clauses">
          <TabsList className="w-full h-12 rounded-full bg-surface-container-low p-1">
            <TabsTrigger
              value="clauses"
              className="flex-1 rounded-full text-[13px] data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-float font-semibold"
            >
              특약 템플릿
            </TabsTrigger>
            <TabsTrigger
              value="guide"
              className="flex-1 rounded-full text-[13px] data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-float font-semibold"
            >
              법률 대응
            </TabsTrigger>
            <TabsTrigger
              value="report"
              className="flex-1 rounded-full text-[13px] data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-float font-semibold"
            >
              신고·상담
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clauses" className="mt-6">
            <ClausesTab />
          </TabsContent>
          <TabsContent value="guide" className="mt-6">
            <LegalGuideTab />
          </TabsContent>
          <TabsContent value="report" className="mt-6">
            <ReportTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ===== F22 특약 템플릿 =====
function ClausesTab() {
  const [activeCat, setActiveCat] = useState<ZjClauseCategory>("deposit");
  const filtered = ZJ_SPECIAL_CLAUSES.filter((c) => c.category === activeCat);

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-on-surface-variant leading-relaxed">
        거래 유형에 맞는 특약을 선택하고 <strong>복사</strong>해서 계약서에
        삽입하세요.
      </p>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveCat(key)}
            className={cn(
              "rounded-full px-4 h-9 text-[13px] font-semibold transition-all",
              activeCat === key
                ? "bg-gradient-primary text-white shadow-float"
                : "bg-surface-container-low text-on-surface-variant active:scale-95",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((clause) => (
          <Card key={clause.id}>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-headline font-bold text-[14px]">
                    {clause.label}
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {clause.dealTypes.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-bold uppercase tracking-wider bg-surface-container-low rounded-full px-2 py-0.5 text-on-surface-variant"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(clause.text);
                    toast.success("특약이 복사되었습니다");
                  }}
                  className="shrink-0 h-10 w-10 rounded-full bg-surface-container-low hover:bg-primary hover:text-white flex items-center justify-center transition-all active:scale-95"
                  title="복사"
                >
                  <Copy className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                {clause.text}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===== F25 법률 대응 가이드 =====
const LEGAL_GUIDES = [
  {
    icon: FileText,
    title: "내용증명 발송",
    desc: "보증금 반환 청구, 하자 보수 요청 등 법적 통지. 우체국 또는 전자내용증명(e-그린우편).",
    steps: [
      "내용증명 양식 작성 (보내는 사람/받는 사람/내용)",
      "우체국 방문 또는 인터넷우체국 e-그린우편",
      "3통 작성 (발신/수신/우체국 보관)",
      "발송일로부터 도달 추정 (보통 2~3일)",
    ],
    url: "https://www.epost.go.kr/",
  },
  {
    icon: Scale,
    title: "임차권등기명령",
    desc: "임대차 종료 후 보증금 미반환 시, 이사해도 대항력 유지하는 등기.",
    steps: [
      "관할 법원에 임차권등기명령 신청 (비용 약 5만원)",
      "임대차 계약서 + 전입세대열람 + 등기부등본 첨부",
      "법원 결정 → 등기촉탁 → 등기부에 임차권 등기",
      "등기 완료 후 이사해도 우선변제권 유지",
    ],
    url: "https://ecfs.scourt.go.kr/",
  },
  {
    icon: AlertTriangle,
    title: "보증금 반환 소송",
    desc: "내용증명 후에도 미반환 시. 소액사건(3천만 이하)은 간이절차.",
    steps: [
      "소장 작성 (대한법률구조공단 무료 법률 상담 활용)",
      "관할 법원에 소장 제출",
      "소액사건(3천만 이하): 1회 변론으로 판결 가능",
      "판결 후 강제집행 신청 (부동산 경매 등)",
    ],
    url: "https://www.klac.or.kr/",
  },
  {
    icon: Scale,
    title: "주택임대차분쟁조정",
    desc: "소송 전 분쟁조정위원회로 빠르게 해결 (무료).",
    steps: [
      "대한법률구조공단 주택임대차분쟁조정위원회 신청",
      "조정기일 지정 (보통 2~4주)",
      "조정 성립 시 재판상 화해 효력",
      "불성립 시 소송으로 전환",
    ],
    url: "https://www.klac.or.kr/",
  },
  {
    icon: AlertTriangle,
    title: "전세사기피해자 특별법",
    desc: "전세사기 피해 인정 → 경매 유예, 대출 지원, 주거 안정.",
    steps: [
      "전세피해지원센터 상담 (1533-8119)",
      "피해자 결정 신청 (관할 시·도지사)",
      "피해자 인정 시: 경·공매 유예, LH 긴급주거 지원",
      "우선매수권 또는 보증금 우선변제 신청",
    ],
    url: "https://jeonse.go.kr/",
  },
];

function LegalGuideTab() {
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-on-surface-variant leading-relaxed">
        보증금 미반환, 하자 분쟁, 전세사기 대응 절차를 단계별로 안내합니다.
      </p>
      {LEGAL_GUIDES.map((guide) => {
        const Icon = guide.icon;
        return (
          <Card key={guide.title}>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary-fixed flex items-center justify-center shrink-0">
                  <Icon
                    className="h-5 w-5 text-on-primary-fixed"
                    strokeWidth={2.2}
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-headline font-bold text-[15px]">
                    {guide.title}
                  </div>
                  <div className="text-[12px] text-on-surface-variant mt-0.5">
                    {guide.desc}
                  </div>
                </div>
              </div>
              <ol className="space-y-2 ml-1">
                {guide.steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-[13px] leading-relaxed"
                  >
                    <span className="shrink-0 h-5 w-5 rounded-full bg-surface-container flex items-center justify-center text-[11px] font-bold text-on-surface-variant">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <a
                href={guide.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary"
              >
                자세히 보기 <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ===== F24 신고·상담 =====
const REPORT_LINKS = [
  {
    title: "임대차 신고",
    desc: "보증금 6천만 또는 월세 30만 초과 시 30일 이내 의무 신고",
    url: "https://rtms.molit.go.kr/",
    note: "주민센터 방문 또는 온라인 신고 가능",
  },
  {
    title: "전세피해지원센터",
    desc: "전세사기 피해 상담 + 법률 지원 + 긴급주거",
    url: "https://jeonse.go.kr/",
    phone: "1533-8119",
  },
  {
    title: "대한법률구조공단",
    desc: "무료 법률 상담 + 소송 대리 (소득 기준 충족 시)",
    url: "https://www.klac.or.kr/",
    phone: "132",
  },
  {
    title: "전자소송",
    desc: "온라인으로 소장 제출 + 사건 진행 조회",
    url: "https://ecfs.scourt.go.kr/",
  },
  {
    title: "인터넷등기소",
    desc: "등기부등본 열람 + 등기신청",
    url: "https://www.iros.go.kr/",
  },
  {
    title: "HUG 전세보증보험",
    desc: "전세보증금반환보증 가입 + 가입 가능 여부 확인",
    url: "https://www.khug.or.kr/",
    phone: "1566-9009",
  },
];

function ReportTab() {
  return (
    <div className="space-y-4">
      <Card className="bg-error-container/40 border-0">
        <CardContent>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-on-error-container shrink-0 mt-0.5" />
            <div className="text-[13px] text-on-error-container leading-relaxed">
              <strong>임대차 신고 의무</strong>: 보증금 6천만원 또는 월세
              30만원 초과 시 계약일로부터 <strong>30일 이내</strong> 신고 필수.
              미신고 시 과태료 최대 100만원.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {REPORT_LINKS.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-4 active:scale-[0.99] transition-transform hover:bg-surface-container"
          >
            <div className="min-w-0">
              <div className="font-semibold text-[14px]">{link.title}</div>
              <div className="text-[12px] text-on-surface-variant mt-0.5">
                {link.desc}
              </div>
              {link.phone && (
                <div className="flex items-center gap-1 mt-1 text-[12px] text-primary font-semibold">
                  <Phone className="h-3 w-3" />
                  {link.phone}
                </div>
              )}
            </div>
            <ExternalLink
              className="h-4 w-4 text-outline shrink-0"
              strokeWidth={2.5}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
