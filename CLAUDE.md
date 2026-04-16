# 🤖 CLAUDE.md — 집지킴이 (ZipJikimi) 프로젝트 지침서

> Cursor + Claude CLI 환경에서 개발 시 반드시 따라야 할 규칙입니다.

---

## 1. 프로젝트 개요

- **앱 이름:** 집지킴이 (ZipJikimi)
- **목적:** 개인 전용 부동산 안전거래 검증 플랫폼
- **기술:** Next.js 14+ (App Router) / TypeScript / Supabase / Tailwind + shadcn/ui
- **배포:** Vercel (Git push → 자동 배포)
- **PWA:** 아이폰 홈화면 추가 지원 (standalone 모드)
- **⚠️ 주의:** 기존 Supabase 프로젝트와 DB 공유 — 충돌 방지 최우선

---

## 2. 네이밍 규칙 (충돌 방지 필수)

### 2.1 Supabase 테이블
```
접두사: zj_
예시: zj_properties, zj_transaction_cache, zj_checklists
❌ 접두사 없이 테이블 생성 절대 금지
```

### 2.2 Supabase Storage 버킷
```
접두사: zj-
예시: zj-documents, zj-photos
```

### 2.3 환경변수
```
접두사: ZJ_
예시: ZJ_DATA_GO_KR_API_KEY, ZJ_KAKAO_REST_KEY
클라이언트용: NEXT_PUBLIC_ZJ_KAKAO_MAP_KEY
```

### 2.4 라우트 경로
```
앱 라우트 그룹: /app/(zipjikimi)/
→ URL에 zipjikimi 미포함, 기존 앱 라우트와 완전 분리
```

### 2.5 컴포넌트/유틸/타입
```
컴포넌트: /components/zipjikimi/   →  Zj 접두사 (ZjSearchBar, ZjRiskBadge)
유틸:     /lib/zipjikimi/
타입:     /types/zipjikimi/        →  Zj 접두사 (ZjProperty, ZjRiskLevel)
훅:       /hooks/zipjikimi/
상수:     /constants/zipjikimi/
```

---

## 3. 폴더 구조

```
src/
├── app/
│   └── (zipjikimi)/
│       ├── layout.tsx                    # 집지킴이 전용 레이아웃 (PWA 메타태그 포함)
│       ├── page.tsx                      # 메인 (주소 검색 진입점)
│       ├── manifest.json                 # PWA 매니페스트
│       ├── sw.js                         # Service Worker (또는 next-pwa 자동생성)
│       ├── dashboard/page.tsx            # 물건 관리 대시보드
│       ├── property/
│       │   ├── [id]/page.tsx             # 물건 상세 (모든 분석)
│       │   └── new/page.tsx              # 새 물건 등록
│       ├── compare/page.tsx              # 물건 비교
│       ├── calculator/page.tsx           # 계산기 모음
│       ├── checklist/[propertyId]/page.tsx
│       ├── legal/
│       │   ├── page.tsx                  # 법률 가이드 목록
│       │   └── [slug]/page.tsx           # 개별 가이드
│       └── api/                          # API Routes (서버사이드)
│           ├── transaction/route.ts
│           ├── building/route.ts
│           ├── official-price/route.ts
│           ├── registry/route.ts         # 에이픽 (유료)
│           ├── broker/route.ts
│           ├── business/route.ts
│           ├── land-use/route.ts
│           ├── safety/
│           │   ├── crime/route.ts
│           │   ├── disaster/route.ts
│           │   └── noise/route.ts
│           ├── risk-score/route.ts
│           └── ai/contract-clause/route.ts
│
├── components/zipjikimi/
│   ├── ui/          # ZjSearchBar, ZjRiskBadge, ZjPropertyCard, ZjCompareTable
│   ├── map/         # ZjKakaoMap, ZjMapMarker, ZjMapOverlay
│   ├── charts/      # ZjPriceTrend, ZjRiskRadar
│   ├── checklist/   # ZjChecklistGroup, ZjChecklistItem
│   ├── calculator/  # ZjConversionCalc, ZjFeeCalc, ZjInsuranceCalc
│   ├── legal/       # ZjLegalCard, ZjDocTemplate
│   └── layout/      # ZjMobileNav, ZjBottomTabBar, ZjSafeArea, ZjPullToRefresh
│
├── lib/zipjikimi/
│   ├── api/         # 외부 API 호출 (dataGoKr, transaction, building, apick 등)
│   ├── calc/        # 계산 로직 (conversionRate, brokerageFee, insuranceCheck, riskScore)
│   ├── analysis/    # 분석 로직 (priceAdequacy, buildingAge, fraudDetection, registryAnalysis)
│   ├── supabase/    # client.ts, queries.ts, migrations/
│   ├── pwa/         # Service Worker 등록, 오프라인 동기화, 설치 프롬프트
│   └── utils/       # address, format, cache
│
├── types/zipjikimi/     # property, transaction, building, registry, risk, checklist, api
├── hooks/zipjikimi/     # usePropertySearch, useTransactionData, useRiskAssessment, useChecklist, usePWA
├── constants/zipjikimi/ # brokerageFeeTable, insuranceRules, riskThresholds, checklistItems, regionCodes
│
└── public/
    ├── icons/           # PWA 아이콘들
    │   ├── icon-192.png
    │   ├── icon-512.png
    │   ├── icon-maskable-192.png
    │   ├── icon-maskable-512.png
    │   └── apple-touch-icon-180.png
    └── splash/          # iOS 스플래시 이미지
        ├── splash-1290x2796.png    # iPhone 15 Pro Max / 16 Plus
        ├── splash-1179x2556.png    # iPhone 15 / 16
        └── splash-750x1334.png     # iPhone SE
```

---

## 4. 코딩 규칙

### 4.1 파일 분리 원칙
```
✅ 하나의 파일 = 하나의 책임
✅ API 호출 → /lib/zipjikimi/api/
✅ 계산 로직 → /lib/zipjikimi/calc/
✅ 분석 로직 → /lib/zipjikimi/analysis/
✅ PWA 관련 → /lib/zipjikimi/pwa/
❌ page.tsx에 비즈니스 로직 직접 작성 금지
❌ 하나의 파일에 API 호출 + 계산 + 렌더링 혼합 금지
```

### 4.2 주석 규칙 (모든 파일 필수)
```typescript
/**
 * @file transaction.ts
 * @description 국토교통부 실거래가 API 호출 함수
 * @api 공공데이터포털 — 국토교통부_아파트 매매 실거래가 상세 자료
 * @see https://www.data.go.kr/data/15126469/openapi.do
 * @module lib/zipjikimi/api
 */

/**
 * 특정 지역의 아파트 매매 실거래가를 조회합니다.
 * @param regionCode - 법정동 코드 앞 5자리 (예: "11110" = 서울 종로구)
 * @param yearMonth - 조회 년월 (예: "202601")
 * @returns 실거래가 목록
 * @note API 일일 호출 한도: 1,000건 / 응답: XML → JSON 파싱 필요
 */
```

### 4.3 주석 필수 포함 항목
```
파일 상단: @file, @description, @api(해당시), @see(API URL), @module
함수: @param, @returns, @example, @note
상수: 출처 + 기준일
  예: // 2026년 기준 중개수수료 요율표 (국토교통부 공인중개사법 시행규칙)
복잡한 계산: 단계별 인라인 주석
```

### 4.4 타입 규칙
```typescript
// 모든 타입에 Zj 접두사 (기존 프로젝트 충돌 방지)
interface ZjProperty { ... }
type ZjTransactionType = "매매" | "전세" | "월세";
type ZjRiskLevel = "안전" | "주의" | "위험" | "매우위험";
```

### 4.5 에러 처리
```typescript
// 모든 외부 API 호출은 try-catch
// API 실패해도 앱 죽지 않도록 fallback
try {
  const data = await fetchAptTradeData(regionCode, yearMonth);
  return { success: true, data };
} catch (error) {
  console.error("[ZJ] 실거래가 조회 실패:", error);
  return { success: false, error: "데이터를 불러올 수 없습니다.", data: [] };
}
```

### 4.6 API 응답 캐싱
```
실거래가: TTL 24시간 / 건축물대장: 7일 / 공시가격: 30일
등기부등본: 캐시 안 함 (실시간 + 유료)
캐시 테이블: zj_*_cache (Supabase)
```

### 4.7 API 응답 형식 통일
```typescript
// 성공
{ success: true, data: [...], cached: boolean, timestamp: string }
// 실패
{ success: false, error: string, code: string }
```

---

## 5. PWA 규칙

### 5.1 레이아웃 (layout.tsx)에 필수 포함
```html
<!-- PWA 기본 -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#2563EB" />

<!-- iOS 전용 -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="집지킴이" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
<!-- + 스플래시 이미지 링크들 -->
```

### 5.2 Safe Area 대응 (모든 레이아웃 컴포넌트)
```css
/* 상단: 다이나믹 아일랜드 / 노치 대응 */
padding-top: env(safe-area-inset-top);

/* 하단: 홈 인디케이터 대응 */
padding-bottom: env(safe-area-inset-bottom);

/* 하단 탭바 높이에 safe area 추가 */
.bottom-tab-bar {
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
}
```

### 5.3 모바일 레이아웃 구조
```
┌──────────────────────────┐
│  상태바 (safe-area-top)    │ ← black-translucent
├──────────────────────────┤
│                          │
│    콘텐츠 영역            │ ← 스크롤 가능
│                          │
├──────────────────────────┤
│  하단 탭바                │ ← 고정, 5개 탭
│  (홈/검색/물건/체크/더보기) │
│  (safe-area-bottom)      │
└──────────────────────────┘
```

### 5.4 PC vs 모바일 레이아웃 분기
```
- PC (768px 이상): 사이드바 네비게이션 + 넓은 콘텐츠 영역
- 모바일 (768px 미만): 하단 탭바 + 풀스크린 콘텐츠
- 반응형 기준: Tailwind md: 브레이크포인트 사용
- 모바일 우선 설계 (집 보러 다닐 때 주로 폰 사용)
```

### 5.5 오프라인 동기화
```
- 오프라인에서 변경된 체크리스트 → IndexedDB에 임시 저장
- 온라인 복귀 감지 (navigator.onLine + online 이벤트)
- 복귀 시 Supabase에 자동 동기화
- 동기화 실패 시 재시도 큐 유지
- /lib/zipjikimi/pwa/offlineSync.ts 에서 관리
```

### 5.6 PWA 설치 유도
```
- 첫 방문 시: "홈 화면에 추가하면 앱처럼 사용할 수 있어요" 배너
- iOS는 beforeinstallprompt 미지원 → 수동 안내 모달
  ("공유 버튼 → 홈 화면에 추가" 가이드 이미지)
- /lib/zipjikimi/pwa/installPrompt.ts
- /hooks/zipjikimi/usePWA.ts
```

---

## 6. Supabase 규칙

### 6.1 테이블 생성
```sql
-- 모든 테이블: zj_ 접두사
-- PK: id UUID DEFAULT gen_random_uuid()
-- 필수 컬럼: created_at, updated_at
-- 상세 스키마: DATABASE.sql 참고
```

### 6.2 쿼리 함수 위치
```
모든 Supabase 쿼리 → /lib/zipjikimi/supabase/queries.ts
컴포넌트에서 supabase 클라이언트 직접 호출 ❌
```

---

## 7. UI/UX 가이드

### 7.1 디자인 시스템
```
기본: shadcn/ui + Tailwind
색상:
  Primary: #2563EB (파란, 신뢰감)
  안전: #16A34A (초록)
  주의: #EAB308 (노랑)
  위험: #EA580C (주황)
  매우위험: #DC2626 (빨강)
스타일: Toss/카카오 참고 — 깔끔한 카드형
모바일 우선: 터치 타겟 44px 이상, 큰 텍스트
```

### 7.2 핵심 UX 흐름
```
[주소 입력] → [건물 기본정보] → [시세 분석] → [위험도]
    ↓
[상세 탭]
  ├── 시세: 실거래가 + 트렌드 + 적정성
  ├── 안전: 등기부등본 + 위험신호 + 범죄/재해
  ├── 환경: 지도 + 주변시설 + 소음 + 용도지역
  ├── 계산: 전환 + 수수료 + 보험
  └── 체크: 단계별 체크 + 법률 가이드
```

---

## 8. Git 규칙

### 8.1 브랜치
```
main     — 프로덕션 (Vercel 자동 배포)
develop  — 개발 통합
feature/F01-실거래가
feature/F08-지도
feature/PWA-설정
fix/캐시-버그수정
```

### 8.2 커밋 메시지
```
feat(F01): 아파트 매매 실거래가 조회 API 연동
feat(PWA): manifest.json + iOS 메타태그 + 아이콘 설정
feat(mobile): 하단 탭바 + Safe Area 대응
fix(F14): 등기부등본 파싱 에러 수정
style: ZjPropertyCard 모바일 반응형 개선
```

---

## 9. 개발 시 주의사항

### API 호출
```
- 공공데이터포털: 일일 1,000건 한도 → 캐싱 먼저 구현
- 에이픽 (유료): 개발 중 mock 데이터 사용 → 최종 연동 시에만 실제 호출
- 대부분 공공 API: XML 응답 → fast-xml-parser로 파싱
```

### 법정동 코드
```
- 실거래가 API: 법정동 코드 5자리 필요 (예: 11110 = 서울 종로구)
- /constants/zipjikimi/regionCodes.ts 에 전국 코드표
- 주소 → 코드 변환: /lib/zipjikimi/utils/address.ts
```

### 금액 단위
```
- API 응답 / DB 저장: 만원 단위 (BIGINT)
- UI 표시: "8억 5,000만원" 포맷
- /lib/zipjikimi/utils/format.ts
```

### 보안
```
- API 키: 서버 사이드 (API Routes)에서만 사용
- 카카오맵 JS 키만 NEXT_PUBLIC_ 허용 (도메인 제한 설정 필수)
- 에이픽 키: 절대 클라이언트 노출 금지
```

### PWA 주의
```
- iOS Safari는 Push Notification 미지원 (iOS 16.4+부터 제한적 지원)
- beforeinstallprompt 이벤트 iOS 미지원 → 수동 설치 안내 필요
- Service Worker 업데이트: skipWaiting + clients.claim 패턴 사용
- 아이폰 PWA에서 외부 링크 열면 Safari로 빠짐 → target="_blank" 주의
```

---

## 10. 개발 순서 체크리스트

```
Phase 0 — 세팅 + PWA
[ ] Next.js + Tailwind + shadcn/ui 프로젝트 생성
[ ] PWA: manifest.json, Service Worker, iOS 메타태그
[ ] PWA: 아이콘 (192/512/maskable/apple-touch-icon) 생성
[ ] PWA: 스플래시 이미지 생성 (주요 iPhone 해상도)
[ ] 모바일 레이아웃: 하단 탭바 + Safe Area
[ ] Supabase 테이블 생성 (DATABASE.sql)
[ ] API 키 발급 (공공데이터포털, 카카오, ECOS)
[ ] Vercel 초기 배포 + 아이폰 실기기 PWA 테스트

Phase 1 — MVP 핵심
[ ] F01: 실거래가 조회 (아파트/빌라/오피스텔/단독)
[ ] F02: 건축물대장 조회
[ ] F03: 보증금 적정성 판단
[ ] F04: 전월세 전환 계산기
[ ] F05: 전세보증보험 판단
[ ] F06: 중개수수료 계산기
[ ] F07: 공시가격 조회
[ ] 메인 UI + 주소 검색 + 모바일 최적화

Phase 2 — 지도 + 환경
[ ] F08: 카카오맵 연동
[ ] F09: 주변 편의시설
[ ] F10: 건물 노후도
[ ] F11: 용도지역
[ ] F12: 재개발/재건축
[ ] F13: 시세 트렌드 차트

Phase 3 — 안전 검증
[ ] F14: 등기부등본 (에이픽)
[ ] F15: 공인중개사 확인
[ ] F16: 사업자등록 확인
[ ] F17: 사기 위험 탐지
[ ] F18: 범죄 통계
[ ] F19: 자연재해
[ ] F20: 소음 환경

Phase 4 — 계약 도우미
[ ] F21: 체크리스트
[ ] F22: AI 특약 생성
[ ] F23: 이사 체크리스트
[ ] F24: 임대차 신고 안내
[ ] F25: 법률 대응 가이드
[ ] 오프라인 체크리스트 동기화

Phase 5 — 관리 + 비교
[ ] F26: 물건 관리 대시보드
[ ] F27: 물건 비교
[ ] F28: 서류 관리 + 모바일 카메라 업로드
[ ] 전체 PWA 최종 점검
```

---

## 11. 참고 라이브러리

```
필수:
- next-pwa             — PWA 자동 설정 (SW 생성, 캐싱)
- fast-xml-parser      — 공공데이터 XML 파싱
- recharts             — 시세 차트
- @supabase/supabase-js
- lucide-react         — 아이콘

선택:
- @tanstack/react-query — API 상태 + 클라이언트 캐싱
- zustand              — 전역 상태 (비교 세트 등)
- idb-keyval           — IndexedDB 간편 사용 (오프라인 데이터)
- date-fns
- react-hook-form + zod
- workbox-precaching   — SW 세밀 제어 (next-pwa 대신 쓸 경우)
```

---

> 이 지침서는 프로젝트 진행 중 지속 업데이트됩니다.
> 새 기능 추가 시 해당 섹션의 폴더 구조와 규칙을 먼저 업데이트하세요.
