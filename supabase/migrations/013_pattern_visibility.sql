-- Tracks which patterns are hidden from public view.
-- A row's presence means the pattern is hidden. No row = visible (default).
-- Admin can insert/delete; public can only read (so the frontend can filter).

CREATE TABLE IF NOT EXISTS pattern_hidden (
  garment_id text PRIMARY KEY
);

ALTER TABLE pattern_hidden ENABLE ROW LEVEL SECURITY;

CREATE POLICY pattern_hidden_public_read ON pattern_hidden
  FOR SELECT USING (true);

CREATE POLICY pattern_hidden_admin_write ON pattern_hidden
  FOR ALL USING (is_admin());
