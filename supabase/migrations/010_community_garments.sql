-- Community garments: user-submitted flat-lay measurements for fit reference
-- Approved entries are surfaced in the fit-library UI's "Community" tab.
-- Moderation: approved defaults to false; admin sets true after review.

CREATE TABLE IF NOT EXISTS community_garments (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  garment_type      text        NOT NULL,           -- 'jeans', 'tee', etc.
  brand             text,                           -- optional, e.g. 'Levi's'
  style             text,                           -- optional, e.g. 'Slim Fit 511'
  size_label        text        NOT NULL,           -- e.g. 'M', '32W', '00'
  measurement_method text       NOT NULL DEFAULT 'flat-lay' CHECK (measurement_method IN ('flat-lay', 'finished')),
  measurements      jsonb       NOT NULL,           -- finished measurements in inches (circumferences converted)
  raw_flat_lay      jsonb,                          -- original flat-lay values before ×2 conversion
  approved          boolean     NOT NULL DEFAULT false,
  helpful_count     integer     NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Index for the primary query: garment_type + approved + sort
CREATE INDEX IF NOT EXISTS community_garments_type_approved_idx
  ON community_garments (garment_type, approved, helpful_count DESC, created_at DESC);

-- Index for admin moderation queue
CREATE INDEX IF NOT EXISTS community_garments_pending_idx
  ON community_garments (approved, created_at DESC)
  WHERE approved = false;

-- RLS: anyone can read approved entries
ALTER TABLE community_garments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_garments_read_approved"
  ON community_garments FOR SELECT
  USING (approved = true);

-- Authenticated users can insert their own submissions
CREATE POLICY "community_garments_insert_own"
  ON community_garments FOR INSERT
  WITH CHECK (submitted_by = auth.uid() OR submitted_by IS NULL);

-- Anonymous submissions allowed (submitted_by IS NULL) via service role in edge function
-- For now, allow anon inserts so the UI works without sign-in
CREATE POLICY "community_garments_insert_anon"
  ON community_garments FOR INSERT
  WITH CHECK (submitted_by IS NULL);

-- Helper function: safely increment helpful_count
CREATE OR REPLACE FUNCTION increment_helpful_count(row_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE community_garments
  SET helpful_count = helpful_count + 1
  WHERE id = row_id AND approved = true;
$$;
