-- People's Patterns — Redemption Codes
-- One-time-use codes included with Etsy/Craftsy pattern downloads.
-- Redeemed on peoplespatterns.com for a made-to-measure version of the same garment.

-- ── redemption_codes ──────────────────────────────────────────────────────────
create table if not exists redemption_codes (
  id               uuid default gen_random_uuid() primary key,
  code             text unique not null,
  garment_id       text not null,
  source           text not null default 'etsy',
  source_order_id  text,
  batch_id         text,
  created_at       timestamptz default now(),
  redeemed_by      uuid references profiles(id),
  redeemed_at      timestamptz
);
alter table redemption_codes enable row level security;
create policy "Users can read own redeemed codes"
  on redemption_codes for select
  using (auth.uid() = redeemed_by);

-- Index on batch_id for batch queries
create index idx_redemption_codes_batch on redemption_codes(batch_id);

-- ── purchases: add source tracking ───────────────────────────────────────────
alter table purchases add column if not exists redemption_code text;
alter table purchases add column if not exists source text default 'direct';
