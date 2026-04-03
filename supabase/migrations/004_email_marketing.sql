-- Email marketing system: opt-in tracking, welcome sequence drip, weekly digest,
-- and credit pack support.
--
-- Run once against your Supabase project:
--   supabase db push   OR paste into the Supabase SQL editor.

-- ── profiles: marketing opt-in + credit pack credits ─────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT false;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS credit_pack_credits INT DEFAULT 0;

-- ── newsletter: marketing opt-in flag ────────────────────────────────────────

ALTER TABLE newsletter
  ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT true;

-- ── welcome_sequence: drip schedule per subscriber ───────────────────────────
-- Each row represents one email in the 5-part welcome series.
-- The cron job picks up rows where scheduled_for <= now() and sent_at IS NULL.

CREATE TABLE IF NOT EXISTS welcome_sequence (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email          TEXT NOT NULL,
  step           INT NOT NULL CHECK (step BETWEEN 0 AND 4),
  scheduled_for  TIMESTAMPTZ NOT NULL,
  sent_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Prevent double-enrollment: one row per email per step
ALTER TABLE welcome_sequence
  ADD CONSTRAINT welcome_sequence_email_step_unique UNIQUE (email, step);

CREATE INDEX IF NOT EXISTS idx_welcome_sequence_pending
  ON welcome_sequence(scheduled_for) WHERE sent_at IS NULL;

ALTER TABLE welcome_sequence ENABLE ROW LEVEL SECURITY;

-- Service role inserts/updates only. Users can read their own rows.
CREATE POLICY "Users can read own welcome sequence"
  ON welcome_sequence FOR SELECT USING (auth.uid() = user_id);

-- ── digest_state: single-row tracker for weekly digest ───────────────────────

CREATE TABLE IF NOT EXISTS digest_state (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  last_sent_at        TIMESTAMPTZ,
  last_article_slugs  JSONB DEFAULT '[]'::jsonb
);

-- Seed the single row so the cron has something to read/update
INSERT INTO digest_state (last_sent_at, last_article_slugs)
SELECT NULL, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM digest_state);

ALTER TABLE digest_state ENABLE ROW LEVEL SECURITY;
