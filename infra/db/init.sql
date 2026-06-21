-- TimescaleDB init script
-- Run on first DB startup via docker-entrypoint-initdb.d

CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email            TEXT UNIQUE NOT NULL,
  display_name     TEXT,
  income_bracket   TEXT,
  region_code      TEXT DEFAULT 'US',
  grid_zone        TEXT DEFAULT 'CAISO_NORTH',
  has_ev           BOOLEAN DEFAULT FALSE,
  has_solar        BOOLEAN DEFAULT FALSE,
  plaid_access_token TEXT,  -- AES-256 encrypted at app layer
  baseline_kg_year NUMERIC(10,2),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Footprint records (TimescaleDB hypertable)
CREATE TABLE IF NOT EXISTS footprint_records (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category         TEXT NOT NULL CHECK (category IN ('food','transport','energy','shopping','other')),
  sub_category     TEXT,
  co2e_kg          NUMERIC(10,4) NOT NULL,
  source           TEXT NOT NULL CHECK (source IN ('plaid','utility_api','manual','scanner','onboarding')),
  label            TEXT,
  transaction_id   TEXT,
  emission_factor_id TEXT,
  amount_usd       NUMERIC(10,2),
  recorded_at      TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

SELECT create_hypertable('footprint_records', 'recorded_at', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_fp_user_recorded ON footprint_records (user_id, recorded_at DESC);

-- Carbon debt ledger
CREATE TABLE IF NOT EXISTS carbon_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  co2e_kg         NUMERIC(10,4) NOT NULL,
  debt_remaining  NUMERIC(10,4) NOT NULL,
  description     TEXT,
  occurred_at     TIMESTAMPTZ NOT NULL,
  cleared_at      TIMESTAMPTZ,
  receipt_url     TEXT
);

-- Actions taken
CREATE TABLE IF NOT EXISTS user_actions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_id       TEXT NOT NULL,
  action_type     TEXT NOT NULL,
  co2e_saved_kg   NUMERIC(10,4),
  completed_at    TIMESTAMPTZ DEFAULT now()
);
