-- Add measurements and opts snapshots to the purchases table.
-- These freeze the exact inputs used at time of purchase so patterns
-- can always be re-downloaded, even if the linked profile is later
-- updated or deleted.
--
-- Run once against your Supabase project:
--   supabase db push   OR paste into the Supabase SQL editor.

ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS measurements JSONB,
  ADD COLUMN IF NOT EXISTS opts         JSONB;
