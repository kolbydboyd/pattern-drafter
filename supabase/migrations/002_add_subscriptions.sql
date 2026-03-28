-- Add subscription support: subscriptions table + profile columns for
-- subscription state, bundle credits, and Stripe customer linkage.
--
-- Run once against your Supabase project:
--   supabase db push   OR paste into the Supabase SQL editor.

-- ── Subscriptions table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id     TEXT,
  plan_id                TEXT NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'active',
  credits_per_period     INT  NOT NULL DEFAULT 0,
  current_credits        INT  NOT NULL DEFAULT 0,
  canceled_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user     ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe   ON subscriptions(stripe_subscription_id);

-- ── Profile columns for subscription state ───────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_plan      TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status    TEXT,
  ADD COLUMN IF NOT EXISTS subscription_credits   INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bundle_credits         INT DEFAULT 0;

-- ── Bundle ID on purchases (tracks which bundle a purchase came from) ────────

ALTER TABLE purchases
  ADD COLUMN IF NOT EXISTS bundle_id TEXT;
