# 🏠 집지킴이 (ZipJikimi) — 프로젝트 계획서 v2

> **개인 전용 부동산 안전거래 검증 플랫폼**
> 전국 월세/전세/매매 거래 시 사기 방지 + 안전 검증 + 법률 방어를 위한 올인원 도구
> 웹 + 아이폰 PWA (홈화면 추가) 지원
> 
> 배포: https://ziphome.vercel.app
> 저장소: https://github.com/yenooooooo/ziphome

---

## 1. 프로젝트 개요

### 1.1 목적
- 전국 모든 월세/전세/매매 건물의 안전성을 검증하는 개인 전용 웹앱
- 부동산 거래 전/중/후 모든 단계에서 사기 방지 및 피해 대응 가능
- 흩어진 공공데이터와 법률 지식을 한 곳에 모아 "방어 무기"로 활용
- **아이폰 홈화면에 추가하여 네이티브 앱처럼 사용 가능 (PWA)**
- **부동산 초보도 쉽게 사용** — 용어 툴팁, 탭 자동 추천, 쉬운 설명 토글

### 1.2 사용자
- 1인 전용 (본인만 사용)
- **PC 웹 브라우저** — 집에서 상세 분석할 때
- **아이폰 PWA (홈화면 추가)** — 집 보러 다니면서 현장에서 즉시 검증할 때

### 1.3 기술 스택 (실제 구현)
| 구분 | 기술 |
|------|------|
| 프레임워크 | **Next.js 16.2.3** (App Router, TypeScript, Turbopack) |
| 스타일링 | **Tailwind CSS v4** + **shadcn/ui** (new-york) |
| 디자인 시스템 | **Guardian's Lens** — 딥 네이비 (#00113b) + 글래스모피즘 + 앰비언트 섀도우 |
| 폰트 | **Manrope** (헤드라인) + **Inter** (본문) + Pretendard (한글 폴백) |
| DB | Supabase (기존 프로젝트 공유 — 테이블 접두사: `zj_`) |
| 로컬 저장 | **localStorage** (물건 저장, 체크리스트, 검색 이력) |
| 배포 | **Vercel** (Git push → 자동 배포) |
| 지도 | **카카오맵 JavaScript SDK** (동적 로드, SVG 마커) |
| 차트 | **Recharts** (LineChart, ScatterChart, ResponsiveContainer) |
| PWA | 수동 Service Worker + Web App Manifest (iOS 메타태그) |
| PDF | **html2canvas-pro + jsPDF** (검증 결과 내보내기) |
| XML 파싱 | **fast-xml-parser** (공공데이터 API) |
| 유료 API | 에이픽(Apick) — 등기부등본 열람 (토스트 게이팅, 키 없으면 안내) |
| AI | Claude API 키 등록됨 — 향후 특약 자동 생성 연동 가능 (현재 프리셋 방식) |

### 1.4 PWA (실제 구현)
| 항목 | 스펙 |
|------|------|
| 홈화면 아이콘 | 192x192, 512x512 PNG (maskable 포함) + apple-touch-icon 180 |
| 스플래시 | iPhone 15 Pro Max / 15 / SE 3종 |
| 상태바 | `black-translucent` |
| 오프라인 | 기본 페이지 셸 캐시 (Network First HTML, Cache First 정적 자산) |
| 디스플레이 | `standalone` |
| 방향 | `portrait` |
| 테마 색상 | `#00113b` (딥 네이비) |
| 아이콘 생성 | SVG 원본 → sharp 자동 변환 (`scripts/generate-icons.mjs`) |

---

## 2. 전체 기능 목록 (구현 완료)

### Phase 0 — 세팅 + PWA + 디자인 ✅
- [x] Next.js 16 + Tailwind v4 + shadcn/ui 프로젝트
- [x] PWA: manifest.json, sw.js, iOS 메타태그
- [x] 아이콘/스플래시 생성 파이프라인 (sharp)
- [x] 모바일 레이아웃: 글래스모피즘 플로팅 탭바 + Safe Area
- [x] PC 레이아웃: 프리미엄 사이드바 네비 (활성 항목 그라디언트)
- [x] Guardian's Lens 디자인 시스템 전면 적용
- [x] 환경변수 템플릿 (.env.example)

### Phase 1 — MVP 핵심 ✅
- [x] **F01: 실거래가 조회** — 국토부 4종(아파트/오피스텔/연립다세대/단독다가구) × 매매/전월세 8개 엔드포인트
  - 매매/전세/월세 3탭 분리 (월세 섞임 방지)
  - "이 건물만" / "동네 전체" 필터 (지번 + 건물명 부분 매칭)
  - 전체 보기 모달 + 페이지네이션 (20건/페이지)
- [x] **F02: 건축물대장** — 국토부 API, 주차장/엘리베이터/세대수(호수) 표시
- [x] **F03: 보증금 적정성 판단** — 전세/매매/월세 3탭
  - 면적 ±20% + 건축년도 ±5년 필터
  - 4단계 판정 (적정/다소높음/위험/저평가의심)
  - 전세가율: 면적 필터된 매매 평균 기준
  - 월세: 환산보증금 + 보증금 회수 비율 (실질)
  - 신뢰도 배지 (높음/보통/낮음/부족)
  - 자주 거래되는 면적 칩 (자동 채움)
  - **초보 친화 UX**: 탭 자동 추천 질문, 예시 시나리오, 쉬운 설명 토글, 용어 툴팁 (?)
- [x] **F04: 전월세 전환 계산기** — ECOS 기준금리 자동 조회 + 수동 입력
- [x] **F05: 전세보증보험 판단** — HUG 기준, 환산보증금/부채비율/보증료
- [x] **F06: 중개수수료 계산기** — 2026년 법정 요율표
- [x] **F07: 공시가격** — 스텁 (단지코드 매칭 필요, 추후 구현)
- [x] 주소 → 법정동 변환 (카카오 로컬 REST API + KA 헤더)
- [x] 공공데이터 XML 공통 클라이언트 (User-Agent 필수, resultCode "00"/"000" 허용)

### Phase 2 — 지도 + 환경 분석 ✅
- [x] **F08: 카카오맵** — SDK 동적 로드, SVG 원형 마커, 반경 원
- [x] **F09: 주변 편의시설** — 카카오 로컬 카테고리 검색 7종 + 도보 시간(80m/분)
- [x] **F10: 건물 노후도** — 준공년도 기반 5단계 등급 (건축물대장 연동)
- [x] **F11: 용도지역** — VWorld NED API (클라이언트 Rewrite 프록시, PNU platGbCd 양쪽 시도)
- [x] **F12: 재개발·재건축** — 지역별 공식 정비사업 포털 링크
- [x] **F13: 시세 트렌드 차트** — Recharts 매매/전세/월세 3탭 + 3개월 이동평균선

### Phase 3 — 안전 검증 + 사기 방지 ✅
- [x] **F14: 등기부등본** — 에이픽 토스트 게이팅 (키 없으면 안내, 있으면 조회)
  - 분석 UI: 소유자/근저당/압류/가압류/전세권/소유권이전 + 위험 등급
- [x] **F15+F16: 임대인/중개사 확인** — 사업자번호 입력 → 국세청 계속/휴업/폐업 조회
- [x] **F17: 사기 위험 탐지** — 전세가율 90%+, 가격 급락, 저평가, 노후, 거래 희소 자동 감지
- [x] **F18+F19+F20: 안전 환경** — 범죄(경찰청)/자연재해(안전디딤돌)/산사태(산림청)/소음(국가소음) 포털 링크

### Phase 4 — 계약 도우미 + 법률 방어 ✅
- [x] **F21: 전세사기 예방 체크리스트** — 4단계 28항목, 중요 표시, localStorage 저장, 진행률 바
- [x] **F22: 특약사항 템플릿** — 6카테고리 16종 프리셋 + 복사 버튼 (Claude API 대신)
- [x] **F23: 이사 타임라인** — 입주일 기준 D-30~D+30 15단계, 필수 항목 배지
- [x] **F24: 임대차 신고 안내** — 의무 기준(6천만/30만), 과태료 경고
- [x] **F25: 법률 대응 가이드** — 내용증명/임차권등기/보증금 소송/분쟁조정/특별법 5종

### Phase 5 — 관리 + 비교 ✅
- [x] **F26: 물건 관리 대시보드** — localStorage 저장, 상태 관리(검토중/계약진행/완료/취소), 메모
  - 검색 결과에서 북마크(저장) 버튼
- [x] **F27: 물건 비교** — 2~3개 선택 → 주요 항목 테이블 (주소/용도/매매/전세/준공/노후도/상태)
- [x] **F28: 서류 관리** — 스텁 (Supabase Storage 연동 예정)

### 추가 기능 (계획서 외 구현) ✅
- [x] **종합 위험 스코어** — 4축(가격/전세가율/노후도/추세) 0~100점 + 간이 스코어(입력 전)
- [x] **요약 리포트 카드** — 스크롤 전 핵심 1초 파악 (건물명/평균/간이 위험도/경고)
- [x] **검색 이력** — localStorage 최근 5건, 홈+검색 페이지 칩 원클릭 재검색
- [x] **공유 버튼** — URL 클립보드 복사
- [x] **PDF 내보내기** — html2canvas-pro + jsPDF, 검증 결과 전체 캡처 다운로드
- [x] **주소 자동완성** — 카카오 키워드+주소 검색 드롭다운 (디바운스 300ms, 키보드 탐색)
- [x] **대출 시뮬레이션** — 전세대출 월 실부담 (이자+보험) 계산
- [x] **5년 총비용 비교** — 전세/월세/매매 실부담 바 차트 + "X가 Y만원 유리" 결론
- [x] **가격 분포 산점도** — 면적별/층별 ScatterChart + 평균 라인
- [x] **전세사기 뉴스 피드** — Google News RSS 파싱, 시군구별 자동 수집
- [x] **중개사 조회 API** — 공공데이터 BrokerService 연동
- [x] **비슷한 매물 힌트** — "이 건물만" 3건 미만 시 동일 동 유사 면적 거래 3건 추천
- [x] **초보 친화 UX** — 탭 자동 추천 질문, 입력 예시 시나리오, 쉬운 설명 토글, 용어 툴팁 (?)

---

## 3. 물건 상세 카드 스택 (주소 검색 결과)

검색 시 표시되는 카드 순서 (총 19장):

| # | 카드 | 기능 |
|---|------|------|
| 1 | 위치 히어로 | 도로명/지번 + 저장/공유/PDF 버튼 |
| 2 | 요약 리포트 | 건물명/용도/노후도 + 매매/전세 평균 + 간이 위험도 + 핵심 경고 |
| 3 | 건축물대장 | 건물명/용도/구조/준공/층수/면적/주차/엘리베이터/세대 |
| 4 | 부동산 유형 & 범위 | 4종 유형 탭 + 이 건물만/동네 전체 필터 |
| 5 | 시세 트렌드 | 매매/전세/월세 3탭 월별 라인 + 3개월 이동평균 |
| 6 | 가격 분포 산점도 | 면적별/층별 ScatterChart + 평균선 |
| 7 | 실거래 내역 | 3탭 + 최근 10건 + 전체 모달 (페이지네이션) |
| 8 | 비슷한 매물 힌트 | "이 건물만" 3건 미만 시 자동 |
| 9 | 보증금 적정성 | 3탭(전세/매매/월세) + 초보 UX + 평형 칩 + 신뢰도 |
| 10 | 종합 위험 스코어 | 4축 게이지 + breakdown 바 + 권고 액션 |
| 11 | 사기 위험 탐지 | 전세가율 90%+/가격 급락/저평가/노후/거래 희소 자동 감지 |
| 12 | 등기부등본 | 에이픽 유료 게이팅 + 분석 UI |
| 13 | 임대인/중개사 확인 | 사업자번호 입력 → 국세청 조회 |
| 14 | 전세사기 뉴스 | Google News RSS 시군구별 피드 |
| 15 | 안전 환경 | 범죄/재해/소음 포털 링크 4종 |
| 16 | 주변 편의시설 | 카카오맵 + 7카테고리 칩 + 도보 시간 |
| 17 | 용도지역 | VWorld 프록시 + PNU 양쪽 시도 |
| 18 | 재개발·재건축 | 정비사업 포털 링크 |

---

## 4. 페이지 구성 (21 routes)

### 정적 페이지 (○)
| 경로 | 설명 |
|------|------|
| `/` | 홈 — 히어로 + 검색 + 최근 검색 + Market Pulse + Quick Actions |
| `/property/new` | 새 물건 검증 — 자동완성 검색 + 결과 19장 카드 스택 |
| `/calculator` | 계산기 4탭 — 전환/수수료/보험/대출+비교 |
| `/checklist` | 체크리스트 — 4단계 28항목 + 이사 타임라인 링크 |
| `/checklist/timeline` | 이사 D-Day 타임라인 15단계 |
| `/dashboard` | 물건 관리 대시보드 (저장/상태/메모) |
| `/dashboard/documents` | 서류 관리 (스텁) |
| `/compare` | 물건 비교 테이블 |
| `/legal` | 법률 가이드 3탭 — 특약 템플릿/법률 대응/신고·상담 |

### API Routes (ƒ)
| 경로 | 설명 |
|------|------|
| `/api/address` | 카카오 로컬 주소 해석 |
| `/api/search-keyword` | 카카오 키워드+주소 자동완성 |
| `/api/transaction` | 국토부 실거래가 (4종×2) |
| `/api/building` | 국토부 건축물대장 |
| `/api/conversion-rate` | 한국은행 ECOS 기준금리 |
| `/api/official-price` | 공시가격 (스텁) |
| `/api/land-use` | VWorld 토지이용규제 |
| `/api/nearby` | 카카오 로컬 주변시설 |
| `/api/registry` | 에이픽 등기부등본 (게이팅) |
| `/api/business` | 국세청 사업자등록 상태 |
| `/api/broker` | 공공데이터 중개사 조회 |
| `/api/news` | Google News RSS 전세사기 뉴스 |

---

## 5. 환경변수

```
# Supabase
ZJ_SUPABASE_URL / ZJ_SUPABASE_ANON_KEY / ZJ_SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_ZJ_SUPABASE_URL / NEXT_PUBLIC_ZJ_SUPABASE_ANON_KEY

# 공공데이터포털 (국토부/국세청)
ZJ_DATA_GO_KR_API_KEY

# 카카오
NEXT_PUBLIC_ZJ_KAKAO_MAP_KEY (JavaScript 키)
ZJ_KAKAO_REST_KEY (REST API 키)

# 한국은행 ECOS
ZJ_ECOS_API_KEY

# 한국부동산원 R-ONE
ZJ_REB_API_KEY

# VWorld (용도지역)
ZJ_VWORLD_API_KEY / NEXT_PUBLIC_ZJ_VWORLD_API_KEY

# 에이픽 (등기부등본, 유료)
ZJ_APICK_API_KEY

# Anthropic (향후 AI 연동)
ZJ_ANTHROPIC_API_KEY
```

---

## 6. 디자인 시스템 — Guardian's Lens

- **Creative North Star:** "The Digital Curator" — 프리미엄 컨시어지
- **Primary:** #00113b (딥 네이비) / Accent: #5f8aff
- **Surface 계층:** #f8f9ff → #eff4ff → #e5eeff → #dce9ff → #d3e4fe
- **No-Line Rule:** 보더 대신 톤 변화로 영역 구분
- **Corner Radius:** 카드 2rem / 입력 1.5rem / 히어로 3rem / 버튼 pill(full)
- **그라디언트 CTA:** primary → on-primary-container 135deg
- **앰비언트 섀도우:** `0 20px 40px rgba(11,28,48,0.06)` (순수 검정 금지)
- **글래스모피즘:** 하단 탭바 + 모바일 헤더 (70% opacity + blur 20px)
- **위험도 칩:** 안전(green)/주의(amber)/위험(orange)/매우위험(red) — 큰 라운드 Status Glow
- **Editorial 타이포:** Manrope 헤드라인 (tracking -0.02em) + label-eyebrow (all-caps tracking)

---

## 7. 버그 수정 이력

- 국토부 API User-Agent 필수 (WAF 차단 우회)
- 국토부 실거래 영문 camelCase 필드 파싱 (한글 X)
- 건축물대장 resultCode "00" = NORMAL SERVICE 허용
- React Strict Mode double-mount useEffect cancelled 플래그 → useRef fetchedRef로 교체
- setState 함수형 업데이트 비동기 타이밍 → shouldFetch 패턴 제거
- VWorld CORS → Next.js Rewrite 프록시 (`/api/vworld/*`)
- VWorld 해외 IP 502 → Rewrite가 Edge에서 프록시
- VWorld PNU platGbCd 불일치 (카카오 0 vs VWorld 1) → 양쪽 자동 시도
- formatKRW compact 반올림 버그 (rem 9500+ → undefined)
- 무한 루프 방지: useMemo 참조 안정화 + resultKey 문자열 비교
- division by zero 가드 (riskScore, fraudDetection)

---

## 8. 향후 계획 (미구현)

- F07 공시가격 완전 연동 (단지코드 매칭 DB)
- F28 서류 관리 (Supabase Storage + 카메라 촬영)
- 오프라인 체크리스트 동기화 (IndexedDB → Supabase)
- 다크 모드 (CSS 토큰 이미 정의, 토글만 추가)
- Claude API 특약 자동 생성 (프리셋 → AI 생성으로 업그레이드)
- 동네 전세가율 히트맵 (카카오맵 오버레이)
- 계약 D-Day 카운트다운 위젯 (대시보드)
- PWA 오프라인 IndexedDB 캐시 (최근 조회 3건)
