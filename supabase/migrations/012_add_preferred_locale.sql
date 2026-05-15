-- Add preferred_locale column to profiles for email localization.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_locale text NOT NULL DEFAULT 'en'
  CHECK (preferred_locale IN ('en', 'en-CA', 'fr-CA', 'es', 'nl', 'de'));
