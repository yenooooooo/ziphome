/**
 * @file calculator/page.tsx
 * @description 계산기 허브 — Guardian's Lens editorial 레이아웃
 *   3개 탭: 전월세 전환 / 중개수수료 / 전세보증보험
 * @module app/(zipjikimi)/calculator
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ZjMobileHeader from "@/components/zipjikimi/layout/ZjMobileHeader";
import ZjConversionCalc from "@/components/zipjikimi/calculator/ZjConversionCalc";
import ZjBrokerageFeeCalc from "@/components/zipjikimi/calculator/ZjBrokerageFeeCalc";
import ZjInsuranceCalc from "@/components/zipjikimi/calculator/ZjInsuranceCalc";
import ZjLoanSimulator from "@/components/zipjikimi/calculator/ZjLoanSimulator";

export default function ZjCalculatorPage() {
  return (
    <>
      <ZjMobileHeader title="계산기" />
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pt-2 md:pt-8 pb-10 space-y-6">
        <div className="space-y-2 md:space-y-3 pt-4 md:pt-0">
          <span className="label-eyebrow">Calculators</span>
          <h1 className="font-headline font-extrabold text-[1.75rem] md:text-[2.5rem] tracking-tight leading-tight">
            필요한 숫자, <br className="md:hidden" />
            바로 계산
          </h1>
          <p className="text-sm text-on-surface-variant">
            기준금리 · 법정 요율 자동 반영
          </p>
        </div>

        <Tabs defaultValue="conversion" className="w-full pt-2">
          <TabsList className="w-full h-12 rounded-full bg-surface-container-low p-1 overflow-x-auto">
            <TabsTrigger
              value="conversion"
              className="flex-1 rounded-full text-[12px] data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-float font-semibold"
            >
              전환
            </TabsTrigger>
            <TabsTrigger
              value="brokerage"
              className="flex-1 rounded-full text-[12px] data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-float font-semibold"
            >
              수수료
            </TabsTrigger>
            <TabsTrigger
              value="insurance"
              className="flex-1 rounded-full text-[12px] data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-float font-semibold"
            >
              보험
            </TabsTrigger>
            <TabsTrigger
              value="loan"
              className="flex-1 rounded-full text-[12px] data-[state=active]:bg-surface-container-lowest data-[state=active]:shadow-float font-semibold"
            >
              대출+비교
            </TabsTrigger>
          </TabsList>
          <TabsContent value="conversion" className="mt-6">
            <ZjConversionCalc />
          </TabsContent>
          <TabsContent value="brokerage" className="mt-6">
            <ZjBrokerageFeeCalc />
          </TabsContent>
          <TabsContent value="insurance" className="mt-6">
            <ZjInsuranceCalc />
          </TabsContent>
          <TabsContent value="loan" className="mt-6">
            <ZjLoanSimulator />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
