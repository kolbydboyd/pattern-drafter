-- Data play improvements: richer fit feedback + implicit measurement delta tracking.
--
-- 1. Allow multiple fit reviews per purchase (muslin + final garment)
-- 2. Add measurements_snapshot and sew_stage to fit_feedback
-- 3. Create measurement_deltas table for implicit fit signals
--
-- Run once against your Supabase project:
--   supabase db push   OR paste into the Supabase SQL editor.

-- ── fit_feedback: drop unique constraint, add new columns ──────────────────

-- Drop the one-review-per-purchase constraint so users can submit
-- separate feedback for muslin and final garment.
ALTER TABLE fit_feedback
  DROP CONSTRAINT IF EXISTS fit_feedback_user_id_purchase_id_key;

-- Sew stage: 'muslin' or 'final' — distinguishes test garment from finished piece.
ALTER TABLE fit_feedback
  ADD COLUMN IF NOT EXISTS sew_stage TEXT DEFAULT 'final'
    CHECK (sew_stage IN ('muslin', 'final'));

-- Freeze the exact measurements used when the pattern was generated.
-- This survives profile edits and makes every review self-contained for analysis.
ALTER TABLE fit_feedback
  ADD COLUMN IF NOT EXISTS measurements_snapshot JSONB;

-- Index for aggregation queries (garment × body area analysis)
CREATE INDEX IF NOT EXISTS idx_fit_feedback_garment
  ON fit_feedback(garment_id);

-- ── measurement_deltas: implicit fit signal from re-generation ─────────────

-- When a user re-generates a pattern with different measurements, the delta
-- between old and new values is a fit signal — they changed what didn't fit.
-- No explicit feedback required.
CREATE TABLE IF NOT EXISTS measurement_deltas (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  garment_id       TEXT NOT NULL,
  old_purchase_id  UUID REFERENCES purchases(id) ON DELETE SET NULL,
  new_purchase_id  UUID REFERENCES purchases(id) ON DELETE SET NULL,
  profile_id       UUID REFERENCES measurement_profiles(id) ON DELETE SET NULL,
  deltas           JSONB NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE measurement_deltas ENABLE ROW LEVEL SECURITY;

-- Service role only for inserts (server-side API).
-- Users can read their own deltas (useful for account dashboard history).
CREATE POLICY "Users can read own measurement deltas"
  ON measurement_deltas FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_measurement_deltas_garment
  ON measurement_deltas(garment_id);
CREATE INDEX IF NOT EXISTS idx_measurement_deltas_user
  ON measurement_deltas(user_id);
