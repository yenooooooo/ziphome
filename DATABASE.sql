-- ============================================================
-- 집지킴이 (ZipJikimi) — Supabase 초기 마이그레이션
-- ============================================================
-- ⚠️ 기존 Supabase 프로젝트와 공유 — 모든 테이블 zj_ 접두사
-- 실행 전 기존 테이블 이름 충돌 확인 필수
-- ============================================================

-- 1. 관심 물건 (핵심 테이블)
CREATE TABLE IF NOT EXISTS zj_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  address_detail TEXT,
  address_jibun TEXT,
  region_code VARCHAR(10),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  transaction_type VARCHAR(10) NOT NULL
    CHECK (transaction_type IN ('매매', '전세', '월세')),
  deposit BIGINT,
  monthly_rent BIGINT,
  sale_price BIGINT,
  building_name TEXT,
  building_use TEXT,
  building_structure TEXT,
  total_floors INTEGER,
  target_floor INTEGER,
  area_m2 DOUBLE PRECISION,
  built_year INTEGER,
  risk_level VARCHAR(20),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  price_adequacy VARCHAR(20),
  jeonse_ratio DOUBLE PRECISION,
  memo TEXT,
  status VARCHAR(20) DEFAULT '검토중'
    CHECK (status IN ('검토중', '계약진행', '계약완료', '취소')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zj_properties_address ON zj_properties (address);
CREATE INDEX IF NOT EXISTS idx_zj_properties_region ON zj_properties (region_code);
CREATE INDEX IF NOT EXISTS idx_zj_properties_status ON zj_properties (status);

-- 2. 실거래가 캐시 (TTL: 24시간)
CREATE TABLE IF NOT EXISTS zj_transaction_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region_code VARCHAR(10) NOT NULL,
  year_month VARCHAR(6) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL,
  response_data JSONB NOT NULL,
  record_count INTEGER,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(region_code, year_month, transaction_type)
);

CREATE INDEX IF NOT EXISTS idx_zj_tx_cache_lookup
  ON zj_transaction_cache (region_code, year_month, transaction_type);

-- 3. 건축물대장 캐시 (TTL: 7일)
CREATE TABLE IF NOT EXISTS zj_building_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL UNIQUE,
  sigungu_code VARCHAR(10),
  bjdong_code VARCHAR(10),
  response_data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- 4. 공시가격 캐시 (TTL: 30일)
CREATE TABLE IF NOT EXISTS zj_official_price_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  price_year INTEGER NOT NULL,
  official_price BIGINT,
  price_type VARCHAR(20),
  response_data JSONB,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  UNIQUE(address, price_year)
);

-- 5. 등기부등본 열람 기록 (유료 — 캐시X, 기록 보관)
CREATE TABLE IF NOT EXISTS zj_registry_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES zj_properties(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  owner_name TEXT,
  owner_match BOOLEAN,
  mortgage_total BIGINT,
  mortgage_details JSONB,
  seizure_exists BOOLEAN DEFAULT FALSE,
  provisional_seizure BOOLEAN DEFAULT FALSE,
  provisional_registration BOOLEAN DEFAULT FALSE,
  jeonse_right_exists BOOLEAN DEFAULT FALSE,
  ownership_changes INTEGER,
  registry_risk_level VARCHAR(20),
  registry_risk_details JSONB,
  raw_response JSONB,
  api_cost INTEGER,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zj_registry_property ON zj_registry_records (property_id);

-- 6. 체크리스트 진행 상태
CREATE TABLE IF NOT EXISTS zj_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES zj_properties(id) ON DELETE CASCADE,
  checklist_type VARCHAR(20) NOT NULL
    CHECK (checklist_type IN ('pre_contract', 'contract', 'post_contract', 'moving')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_items INTEGER DEFAULT 0,
  checked_items INTEGER DEFAULT 0,
  completion_rate DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zj_checklist_property ON zj_checklists (property_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_zj_checklist_unique
  ON zj_checklists (property_id, checklist_type);

-- 7. 위험도 평가 기록
CREATE TABLE IF NOT EXISTS zj_risk_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES zj_properties(id) ON DELETE CASCADE,
  score_price INTEGER,
  score_building INTEGER,
  score_registry INTEGER,
  score_location INTEGER,
  score_jeonse_ratio INTEGER,
  total_score INTEGER,
  risk_level VARCHAR(20),
  risk_summary TEXT,
  risk_details JSONB,
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zj_risk_property ON zj_risk_assessments (property_id);

-- 8. 서류 메타데이터
CREATE TABLE IF NOT EXISTS zj_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES zj_properties(id) ON DELETE SET NULL,
  document_type VARCHAR(30) NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(50),
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zj_doc_property ON zj_documents (property_id);

-- 9. 물건 비교 세트
CREATE TABLE IF NOT EXISTS zj_comparison_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  property_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 사기 위험 데이터
CREATE TABLE IF NOT EXISTS zj_fraud_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT,
  region TEXT,
  alert_type VARCHAR(30) NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  source_url TEXT,
  source_name TEXT,
  published_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zj_fraud_address ON zj_fraud_alerts (address);
CREATE INDEX IF NOT EXISTS idx_zj_fraud_region ON zj_fraud_alerts (region);

-- 11. 법률 가이드 콘텐츠
CREATE TABLE IF NOT EXISTS zj_legal_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(30) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  related_laws TEXT[],
  related_links JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION zj_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER zj_properties_updated
  BEFORE UPDATE ON zj_properties
  FOR EACH ROW EXECUTE FUNCTION zj_update_timestamp();

CREATE TRIGGER zj_checklists_updated
  BEFORE UPDATE ON zj_checklists
  FOR EACH ROW EXECUTE FUNCTION zj_update_timestamp();

CREATE TRIGGER zj_legal_guides_updated
  BEFORE UPDATE ON zj_legal_guides
  FOR EACH ROW EXECUTE FUNCTION zj_update_timestamp();

-- 캐시 정리 쿼리 (주기적 실행)
-- DELETE FROM zj_transaction_cache WHERE expires_at < NOW();
-- DELETE FROM zj_building_cache WHERE expires_at < NOW();
-- DELETE FROM zj_official_price_cache WHERE expires_at < NOW();
