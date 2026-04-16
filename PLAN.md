# 🏠 집지킴이 (ZipJikimi) — 프로젝트 계획서

> **개인 전용 부동산 안전거래 검증 플랫폼**
> 전국 월세/전세/매매 거래 시 사기 방지 + 안전 검증 + 법률 방어를 위한 올인원 도구
> 웹 + 아이폰 PWA (홈화면 추가) 지원

---

## 1. 프로젝트 개요

### 1.1 목적
- 전국 모든 월세/전세/매매 건물의 안전성을 검증하는 개인 전용 웹앱
- 부동산 거래 전/중/후 모든 단계에서 사기 방지 및 피해 대응 가능
- 흩어진 공공데이터와 법률 지식을 한 곳에 모아 "방어 무기"로 활용
- **아이폰 홈화면에 추가하여 네이티브 앱처럼 사용 가능 (PWA)**

### 1.2 사용자
- 1인 전용 (본인만 사용)
- **PC 웹 브라우저** — 집에서 상세 분석할 때
- **아이폰 PWA (홈화면 추가)** — 집 보러 다니면서 현장에서 즉시 검증할 때

### 1.3 기술 스택
| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14+ (App Router, TypeScript) |
| 스타일링 | Tailwind CSS + shadcn/ui |
| DB | Supabase (기존 프로젝트 공유 — 테이블 접두사: `zj_`) |
| 배포 | Vercel (Git push → 자동 배포) |
| 지도 | 카카오맵 JavaScript API |
| 차트 | Recharts 또는 Chart.js |
| PWA | next-pwa + Web App Manifest + Service Worker |
| 유료 API | 에이픽(Apick) — 등기부등본 열람 |
| AI | Claude API — 계약서 특약 자동 생성, 상황별 대응 가이드 |

### 1.4 PWA 요구사항
| 항목 | 스펙 |
|------|------|
| 홈화면 아이콘 | 192x192, 512x512 PNG (maskable 포함) |
| 스플래시 스크린 | Apple 전용 apple-touch-startup-image 대응 |
| 상태바 스타일 | `black-translucent` (콘텐츠가 상태바 영역까지 확장) |
| 오프라인 지원 | 기본 페이지 셸 + 최근 조회 물건 데이터 캐싱 |
| 디스플레이 모드 | `standalone` (브라우저 UI 없이 앱처럼) |
| 방향 | `portrait` 고정 (모바일) |
| 테마 색상 | `#2563EB` (Primary Blue) |
| 배경 색상 | `#FFFFFF` |

---

## 2. 전체 기능 목록

### Phase 1 — 핵심 기능 (MVP)

#### F01. 실거래가 조회
- **설명:** 주소 입력 시 해당 건물/동네의 매매·전월세 실거래가 이력 조회
- **데이터:** 아파트, 빌라(연립다세대), 오피스텔, 단독다가구 전부 지원
- **표시:** 최근 거래 목록 + 평균가 + 최고/최저가
- **모바일:** 거래 목록 카드형 스크롤, 터치 친화적 필터
- **API 출처:**
  - 국토교통부 실거래가 정보 (공공데이터포털)
  - https://www.data.go.kr/dataset/3050988/openapi.do
  - 아파트 매매: https://www.data.go.kr/data/15126469/openapi.do
  - 아파트 전월세: https://www.data.go.kr/data/15126471/openapi.do
  - 오피스텔/빌라/단독 각각 별도 API 존재 (동일 포털에서 검색)
  - **비용:** 무료 / 회원가입 후 API 키 발급

#### F02. 건축물대장 정보 조회
- **설명:** 건물의 기본 정보 (준공년도, 층수, 용도, 면적, 구조 등)
- **활용:** 건물 노후도 판단, 불법건축물 여부 간접 확인
- **API 출처:**
  - 국토교통부 건축물대장정보 서비스
  - https://www.data.go.kr/data/15044713/openapi.do
  - **비용:** 무료

#### F03. 보증금 적정성 판단
- **설명:** 입력한 보증금이 동네 시세 대비 적정한지 자동 분석
- **로직:**
  - 동일 동/면적/거래유형의 최근 1~2년 실거래가 평균 산출
  - 입력 보증금과 비교하여 "적정 / 다소 높음 / 위험(깡통전세 주의)" 등급 부여
  - 매매가 대비 전세가 비율(전세가율) 계산 → 80% 이상이면 경고
- **모바일:** 큰 텍스트로 등급 표시 + 색상 코드 (초록/노랑/빨강)
- **데이터:** F01 실거래가 데이터 활용 (추가 API 불필요)

#### F04. 전월세 전환 계산기
- **설명:** 전세 ↔ 월세 상호 변환 계산
- **로직:**
  - 전환율 = 한국은행 기준금리 + 대통령령 가산율 (현재 약 2%)
  - 월세 = (전세보증금 - 월세보증금) × 전환율 / 12
- **모바일:** 큰 숫자 키패드 + 슬라이더로 금액 조절
- **참고 데이터:**
  - 한국은행 기준금리: https://ecos.bok.or.kr/ (ECOS Open API)
  - 전월세전환율 통계: 한국부동산원 Open API
  - https://www.reb.or.kr/r-one/portal/openapi/openApiIntroPage.do
  - **비용:** 무료

#### F05. 전세보증보험 가입 가능 여부 판단
- **설명:** HUG/HF/SGI 전세보증보험 가입 가능한지 사전 판단
- **로직:**
  - 보증금 한도: 수도권 7억, 비수도권 5억 이하
  - 반전세의 경우 전월세전환율 적용 환산액 계산
  - 보증료 계산: 보증금액 × 보증료율 × 계약기간/365
  - 부채비율 추정: (선순위채권 + 보증금) / 주택가액
- **데이터:** 사용자 입력 + F01/F03 데이터 활용
- **참고:** HUG 보증가능여부 간편확인: https://www.khug.or.kr/hug/web/ig/dr/igdr000001.jsp

#### F06. 중개수수료 계산기
- **설명:** 거래 유형(매매/전세/월세)과 금액에 따른 법정 수수료 상한 자동 계산
- **로직:** 국토교통부 공인중개사법 시행규칙 별표 기준
- **데이터:** 계산 로직만 (API 불필요)

#### F07. 공시가격 조회
- **설명:** 해당 건물의 공시가격 조회 + 매매가 대비 비율 분석
- **활용:** 재산세/종부세 예상, 고평가/저평가 판단
- **API 출처:**
  - 공동주택 공시가격: https://www.data.go.kr/dataset/3050651/openapi.do
  - 부동산공시가격알리미: https://www.realtyprice.kr/
  - **비용:** 무료

---

### Phase 2 — 지도 + 환경 분석

#### F08. 지도 기반 검색 및 표시
- **설명:** 카카오맵 위에 검색 물건 위치 표시 + 주변 정보 오버레이
- **모바일:** 터치 줌/스크롤 + 현재 위치 기반 검색 (GPS)
- **API 출처:**
  - 카카오맵 JavaScript SDK: https://apis.map.kakao.com/
  - 카카오 로컬 API: https://developers.kakao.com/docs/latest/ko/local/dev-guide
  - **비용:** 무료 (일 30만 건)

#### F09. 주변 편의시설 정보
- **설명:** 지하철역, 버스정류장, 편의점, 마트, 병원, 학교 등 거리 표시
- **API 출처:**
  - 카카오 로컬 API (카테고리 검색) — F08과 동일
  - 부동산 빅데이터 플랫폼: https://www.bigdata-realestate.kr/
  - **비용:** 무료

#### F10. 건물 노후도 분석
- **설명:** 준공년도 기반 건물 상태 등급화
- **로직:** 5년 미만 신축 / 5~15년 양호 / 15~25년 보통 / 25~35년 노후 / 35년+ 재건축
- **데이터:** F02 건축물대장 준공년도 활용

#### F11. 용도지역 확인
- **설명:** 해당 필지의 용도지역(주거/상업/공업 등) 및 개발 가능성
- **API 출처:**
  - 국토교통부 토지이용규제정보서비스: https://www.data.go.kr/data/15056930/openapi.do
  - 토지e음: https://www.eum.go.kr/
  - **비용:** 무료

#### F12. 재개발·재건축 정보
- **설명:** 해당 지역의 정비사업 진행 현황
- **API 출처:**
  - 서울시 정비사업현황: https://data.seoul.go.kr/
  - 정비사업 통합정보: https://cleanup.go.kr/
  - **비용:** 무료

#### F13. 시세 트렌드 차트
- **설명:** 과거 실거래가 추이 시각화 (매매/전세/전세가율)
- **모바일:** 가로 스크롤 차트 + 터치로 데이터포인트 확인
- **데이터:** F01 실거래가 데이터 연도별 활용

---

### Phase 3 — 안전 검증 + 사기 방지

#### F14. 등기부등본 열람 및 분석 (유료)
- **설명:** 주소 입력 → 등기부등본 자동 조회 → 위험 요소 분석
- **분석 항목:** 소유자 일치 여부, 근저당 설정, 가등기/압류/가압류, 전세권, 소유권 이전 빈도
- **위험도 자동 산출:** 근저당+보증금 > 매매가 80% → 고위험 등
- **API 출처:**
  - 에이픽(Apick) API: https://apick.app/dev_guide/iros1
  - **비용:** 건당 900원 (충전식)
  - 대안: CODEF (https://developer.codef.io/), 하이픈 (https://hyphen.im/)

#### F15. 공인중개사 자격 확인
- **설명:** 중개업소/대표자 실제 등록 여부 + 행정처분 이력
- **API 출처:** https://www.data.go.kr/ → "중개업" 검색
- **비용:** 무료

#### F16. 사업자등록 상태 확인
- **설명:** 임대인 폐업/휴업 여부 확인
- **API 출처:** 국세청: https://www.data.go.kr/data/15081808/openapi.do
- **비용:** 무료

#### F17. 사기이력 및 위험 신호 탐지
- **설명:** 등기부 기반 위험 신호 + 전세가율 이상 탐지 + 사기 뉴스 DB
- **데이터:** HUG 대위변제: https://www.khug.or.kr/ / 전세피해지원센터: https://jeonse.go.kr/

#### F18. 범죄 발생 현황
- **API 출처:** 경찰청: https://www.data.go.kr/ → "범죄통계" 검색 / **무료**

#### F19. 자연재해 위험도
- **API 출처:** 행정안전부: https://www.data.go.kr/ → "자연재해" / 산사태: https://sansatai.forest.go.kr/ / **무료**

#### F20. 소음 환경
- **API 출처:** 국가소음정보시스템: https://www.noiseinfo.or.kr/ / **무료**

---

### Phase 4 — 계약 도우미 + 법률 방어

#### F21. 전세사기 예방 체크리스트
- **설명:** 계약 전/중/후 단계별 체크리스트 (앱 내 다른 기능과 연동)
- **모바일:** 큰 체크박스 + 스와이프 완료 + 오프라인 가능

#### F22. 계약서 특약사항 자동 생성 (AI)
- **설명:** 거래 유형/상황별 특약을 Claude API로 자동 생성
- **모바일:** 생성된 특약 길게 눌러 클립보드 복사
- **기술:** Claude API — https://docs.anthropic.com/ / pay-as-you-go

#### F23. 이사 체크리스트 타임라인
- **설명:** 계약 후 할일 날짜별 타임라인 (전입신고, 확정일자, 보증보험 등)
- **모바일:** 세로 타임라인 UI

#### F24. 임대차 신고 확인 안내
- **참고:** https://rtms.molit.go.kr/ (신고 대상: 보증금 6천만 또는 월세 30만 초과)

#### F25. 상황별 법률 대응 가이드
- **구성:** 내용증명 작성법, 임차권등기명령, 반환소송 흐름, 분쟁조정위, 특별법 요건, 최우선변제 기준
- **참고 법률:** 주택임대차보호법, 민법 임대차편, 전세사기피해자 특별법, 공인중개사법
- **참고:** 법률구조공단 https://www.klac.or.kr/ / 전자소송 https://ecfs.scourt.go.kr/ / 전세피해지원 https://jeonse.go.kr/

---

### Phase 5 — 관리 + 비교 도구

#### F26. 물건 관리 대시보드
- **기능:** 물건 등록, 자동 데이터 연동, 파일 첨부, 체크리스트 진행률, 종합 위험도
- **모바일:** 카드형 물건 목록 + 스와이프 상태 변경

#### F27. 물건 비교 기능
- **설명:** 후보 2~3개 나란히 비교 (시세/노후도/위험도/보험/수수료)
- **모바일:** 좌우 스와이프로 물건 전환

#### F28. 서류 관리
- **설명:** 서류 목록 관리 + 파일 저장
- **모바일:** 카메라 바로 촬영 → 업로드 (현장 서류 사진)
- **저장:** Supabase Storage

---

## 3. PWA 구성 상세

### 3.1 Web App Manifest (manifest.json)
```json
{
  "name": "집지킴이 - 부동산 안전거래",
  "short_name": "집지킴이",
  "description": "전국 월세/전세/매매 안전거래 검증 도구",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFFFFF",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 3.2 iOS(아이폰) 전용 메타태그
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="집지킴이" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />

<!-- 스플래시: iPhone 15 Pro Max / 16 Plus -->
<link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/splash/splash-1290x2796.png" />
<!-- iPhone 15 / 16 -->
<link rel="apple-touch-startup-image" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" href="/splash/splash-1179x2556.png" />
<!-- iPhone SE -->
<link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/splash/splash-750x1334.png" />
```

### 3.3 Service Worker 캐싱 전략
```
정적 자산 (CSS, JS, 이미지)     → Cache First (빠른 로딩)
API 응답 (실거래가, 건축물대장)  → Network First + 캐시 Fallback
지도 타일                       → Cache First (용량 주의)
HTML 페이지                     → Network First (항상 최신)
```

### 3.4 오프라인 대응
```
- 네트워크 없을 때: 최근 조회한 물건 데이터는 IndexedDB에서 표시
- 체크리스트 체크/해제: 오프라인 가능 → 온라인 복귀 시 Supabase 동기화
- 계산기 (전환/수수료/보험): API 호출 없이 작동 → 완전 오프라인 가능
- 지도: 오프라인 불가 → "인터넷 연결이 필요합니다" 안내
```

### 3.5 모바일 UX 핵심
```
- Safe Area: env(safe-area-inset-*) 로 노치/다이나믹 아일랜드 대응
- 하단 네비게이션: 모바일 하단 탭바 (홈/검색/물건목록/체크리스트/더보기)
- 풀투리프레시: 데이터 새로고침
- 큰 터치 타겟: 최소 44x44px (Apple HIG)
- 스와이프 제스처: 물건 카드 삭제, 비교 물건 전환
- 카메라 접근: 서류 촬영 (input type="file" accept="image/*" capture)
```

---

## 4. API 총정리

### 무료 API
| API명 | 제공처 | 용도 | 신청 URL |
|--------|--------|------|----------|
| 아파트 매매 실거래가 | 국토교통부 | F01 | https://www.data.go.kr/data/15126469/openapi.do |
| 아파트 전월세 실거래가 | 국토교통부 | F01 | https://www.data.go.kr/data/15126471/openapi.do |
| 오피스텔 매매/전월세 | 국토교통부 | F01 | https://www.data.go.kr/dataset/3050988/openapi.do |
| 연립다세대 매매/전월세 | 국토교통부 | F01 | 동일 포털 검색 |
| 단독다가구 매매/전월세 | 국토교통부 | F01 | 동일 포털 검색 |
| 건축물대장 | 국토교통부 | F02, F10 | https://www.data.go.kr/data/15044713/openapi.do |
| 공동주택 공시가격 | 국토교통부 | F07 | https://www.data.go.kr/dataset/3050651/openapi.do |
| 토지이용규제정보 | 국토교통부 | F11 | https://www.data.go.kr/data/15056930/openapi.do |
| 한국은행 경제통계 | 한국은행 | F04 | https://ecos.bok.or.kr/ |
| 부동산 통계 | 한국부동산원 | F04, F13 | https://www.reb.or.kr/r-one/portal/openapi/ |
| 등기정보 현황 | 대법원 | F17 | https://data.iros.go.kr/rp/oa/openOapiAppl.do |
| 카카오맵 SDK | 카카오 | F08, F09 | https://apis.map.kakao.com/ |
| 카카오 로컬 API | 카카오 | F08, F09 | https://developers.kakao.com/docs/latest/ko/local/dev-guide |
| 사업자등록 상태조회 | 국세청 | F16 | https://www.data.go.kr/data/15081808/openapi.do |
| 범죄 발생 통계 | 경찰청 | F18 | https://www.data.go.kr/ → "범죄통계" |
| 자연재해 위험지구 | 행정안전부 | F19 | https://www.data.go.kr/ → "자연재해" |

### 유료 API
| API명 | 제공처 | 용도 | 비용 | URL |
|--------|--------|------|------|-----|
| 등기부등본 열람 | 에이픽 | F14 | 건당 900원 | https://apick.app/ |
| Claude API | Anthropic | F22 | pay-as-you-go | https://docs.anthropic.com/ |

### API 키 발급 순서
1. 공공데이터포털 계정 → 필요 API 일괄 신청
2. 카카오 개발자 → JavaScript + REST API 키
3. 에이픽 회원가입 → 포인트 충전 (개발 중 최소 사용)
4. 한국은행 ECOS API 키

---

## 5. 데이터베이스 (Supabase)

> ⚠️ 기존 프로젝트 공유 — 모든 테이블 `zj_` 접두사 / 상세는 DATABASE.sql 참고

### 테이블 목록
```
zj_properties, zj_transaction_cache, zj_building_cache,
zj_official_price_cache, zj_registry_records, zj_checklists,
zj_documents, zj_risk_assessments, zj_legal_guides,
zj_fraud_alerts, zj_comparison_sets
```

### Storage 버킷
```
zj-documents (PDF/계약서), zj-photos (현장사진/카메라촬영)
```

### 환경변수
```
ZJ_SUPABASE_URL, ZJ_SUPABASE_ANON_KEY
ZJ_DATA_GO_KR_API_KEY
NEXT_PUBLIC_ZJ_KAKAO_MAP_KEY
ZJ_KAKAO_REST_KEY, ZJ_APICK_API_KEY
ZJ_ECOS_API_KEY, ZJ_ANTHROPIC_API_KEY
```

---

## 6. 개발 일정

### Phase 0 — 세팅 + PWA 기반 (3일)
- Day 0-1: Next.js + Tailwind + shadcn + PWA 설정 (manifest, SW, iOS 메타태그, 아이콘/스플래시)
- Day 2: Supabase 테이블 생성 + API 키 발급
- Day 3: 모바일 레이아웃 (하단 탭바 + Safe Area) + Vercel 초기 배포

### Phase 1 — MVP (2주)
- Day 4~6: F01(실거래가) + F02(건축물대장) + F03(적정성)
- Day 7~9: F04(전환) + F05(보험) + F06(수수료) + F07(공시가격)
- Day 10~13: 메인 UI + 주소 검색 + 모바일 최적화
- Day 14~17: 테스트 + PWA 아이폰 실기기 테스트

### Phase 2 — 지도 + 환경 (2주)
- Day 18~21: F08(지도) + F09(주변시설) + F10(노후도)
- Day 22~25: F11(용도지역) + F12(재개발) + F13(시세차트)
- Day 26~31: UI 통합 + 지도 모바일 터치 최적화

### Phase 3 — 안전 검증 (2주)
- Day 32~35: F14(등기부등본) + F15(중개사) + F16(사업자)
- Day 36~39: F17(사기탐지) + F18(범죄) + F19(재해) + F20(소음)
- Day 40~45: 위험도 스코어링 + 경고 UI

### Phase 4 — 계약 도우미 (1.5주)
- Day 46~49: F21(체크리스트) + F22(특약) + F23(이사)
- Day 50~52: F24(신고) + F25(법률가이드)
- Day 53~55: 콘텐츠 + 오프라인 체크리스트 동기화

### Phase 5 — 관리 + 비교 (1.5주)
- Day 56~59: F26(대시보드) + F27(비교)
- Day 60~62: F28(서류) + 모바일 카메라 업로드
- Day 63~66: 전체 통합 테스트 + PWA 최종 점검 + 배포

**총: 약 10주 (Phase별 독립 배포 가능)**

---

## 7. 참고 사이트

### 공공 데이터
공공데이터포털 https://www.data.go.kr/ | 서울열린데이터 https://data.seoul.go.kr/ | 등기정보광장 https://data.iros.go.kr/ | 부동산통계 https://www.reb.or.kr/r-one/ | 빅데이터플랫폼 https://www.bigdata-realestate.kr/ | 공간정보포털 http://www.nsdi.go.kr/ | ECOS https://ecos.bok.or.kr/ | 실거래가 https://rt.molit.go.kr/ | 공시가격 https://www.realtyprice.kr/

### 안전·법률
전세피해지원 https://jeonse.go.kr/ | 법률구조공단 https://www.klac.or.kr/ | 전자소송 https://ecfs.scourt.go.kr/ | 인터넷등기소 https://www.iros.go.kr/ | HUG https://www.khug.or.kr/ | 정비사업 https://cleanup.go.kr/ | 임대차신고 https://rtms.molit.go.kr/

### 유료 API
에이픽 https://apick.app/ | CODEF https://codef.io/ | 하이픈 https://hyphen.im/
