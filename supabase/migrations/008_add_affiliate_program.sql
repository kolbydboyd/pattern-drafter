-- Affiliate program tables.
-- Run in Supabase SQL editor or via: supabase db push

-- ── affiliates ───────────────────────────────────────────────────────────────
create table if not exists affiliates (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references profiles(id) on delete set null,
  name            text not null,
  email           text not null unique,
  code            text not null unique,
  commission_rate numeric(4,2) default 0.30,
  status          text default 'pending'
                  check (status in ('pending','active','paused','rejected')),
  paypal_email    text,
  website_url     text,
  social_handles  jsonb default '{}',
  notes           text,
  created_at      timestamptz default now(),
  approved_at     timestamptz
);

create unique index if not exists idx_affiliates_code on affiliates(code);
create index if not exists idx_affiliates_user on affiliates(user_id);

-- ── affiliate_clicks ─────────────────────────────────────────────────────────
create table if not exists affiliate_clicks (
  id           uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete cascade not null,
  landing_page text,
  referrer     text,
  ip_hash      text,
  user_agent   text,
  created_at   timestamptz default now()
);

create index if not exists idx_aff_clicks_affiliate on affiliate_clicks(affiliate_id);
create index if not exists idx_aff_clicks_created on affiliate_clicks(created_at);

-- ── affiliate_conversions ────────────────────────────────────────────────────
create table if not exists affiliate_conversions (
  id                uuid default gen_random_uuid() primary key,
  affiliate_id      uuid references affiliates(id) on delete cascade not null,
  order_id          uuid references orders(id) on delete set null,
  customer_user_id  uuid references profiles(id) on delete set null,
  order_total_cents int not null,
  commission_cents  int not null,
  commission_rate   numeric(4,2) not null,
  status            text default 'pending'
                    check (status in ('pending','approved','paid','rejected')),
  created_at        timestamptz default now()
);

create index if not exists idx_aff_conv_affiliate on affiliate_conversions(affiliate_id);
create index if not exists idx_aff_conv_status on affiliate_conversions(status);

-- ── affiliate_payouts ────────────────────────────────────────────────────────
create table if not exists affiliate_payouts (
  id           uuid default gen_random_uuid() primary key,
  affiliate_id uuid references affiliates(id) on delete cascade not null,
  amount_cents int not null,
  method       text default 'paypal'
               check (method in ('paypal','credit','other')),
  paypal_email text,
  notes        text,
  paid_at      timestamptz default now()
);

create index if not exists idx_aff_payouts_affiliate on affiliate_payouts(affiliate_id);

-- ── Tag orders with the affiliate who referred them ──────────────────────────
alter table orders
  add column if not exists affiliate_id uuid references affiliates(id) on delete set null;

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Affiliates can read their own row. Everything else is service-role only.
alter table affiliates enable row level security;
create policy "Affiliates can read own row"
  on affiliates for select using (auth.uid() = user_id);

alter table affiliate_clicks enable row level security;
-- No user-facing RLS - reads via service-role API only

alter table affiliate_conversions enable row level security;
-- No user-facing RLS - reads via service-role API only

alter table affiliate_payouts enable row level security;
-- No user-facing RLS - reads via service-role API only
