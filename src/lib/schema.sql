-- People's Patterns — Database Schema
-- Run in Supabase SQL editor (Dashboard → SQL Editor → New query)
-- Copyright (c) 2026 People's Patterns LLC. All rights reserved.

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Auto-populated via trigger on auth.users insert (see trigger below).
create table if not exists profiles (
  id         uuid references auth.users on delete cascade primary key,
  email      text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Trigger: create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, free_credits)
  values (new.id, new.email, 1);
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── measurement_profiles ──────────────────────────────────────────────────────
create table if not exists measurement_profiles (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references profiles(id) on delete cascade not null,
  name         text not null,
  measurements jsonb not null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  archived     boolean default false
);
alter table measurement_profiles enable row level security;
create policy "Users can CRUD own measurement profiles"
  on measurement_profiles for all using (auth.uid() = user_id);

-- ── purchases ─────────────────────────────────────────────────────────────────
create table if not exists purchases (
  id                    uuid default gen_random_uuid() primary key,
  user_id               uuid references profiles(id) on delete cascade not null,
  garment_id            text not null,
  profile_id            uuid references measurement_profiles(id) on delete set null,
  stripe_payment_intent text,
  amount_cents          integer,
  purchased_at          timestamptz default now(),
  download_count        integer default 0
);

-- ── Migrations: run these once on existing installs ───────────────────────────
--   alter table profiles add column if not exists free_credits integer default 0;
--   update profiles set free_credits = 1 where free_credits = 0; -- grant existing users one credit
--   alter table measurement_profiles
--     add column if not exists last_used_at timestamptz;
--   alter table purchases
--     add column if not exists profile_id uuid references measurement_profiles(id) on delete set null;
--   alter table purchases
--     add column if not exists last_generated_at timestamptz;
--   alter table purchases
--     add column if not exists status text default 'active';
--   alter table purchases
--     add column if not exists trashed_at timestamptz default null;
--   alter table purchases
--     add column if not exists display_name text default null;
--   alter table purchases
--     add column if not exists notes text default null;
--   alter table purchases
--     add column if not exists downloaded_at timestamptz[] default '{}';
--   alter table purchases
--     add column if not exists a0_addon boolean default false;
--
-- ── Auto-delete trashed patterns older than 30 days (run once in Supabase) ────
-- Requires pg_cron extension enabled in Supabase Dashboard → Extensions
--   select cron.schedule(
--     'delete-old-trash',
--     '0 3 * * *',
--     $$
--       delete from purchases
--       where status = 'trashed'
--       and trashed_at < now() - interval '30 days';
--     $$
--   );
alter table purchases enable row level security;
create policy "Users can read own purchases"
  on purchases for select using (auth.uid() = user_id);

-- ── wishlist ──────────────────────────────────────────────────────────────────
create table if not exists wishlist (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references profiles(id) on delete cascade not null,
  garment_id text not null,
  added_at   timestamptz default now(),
  unique (user_id, garment_id)
);
alter table wishlist enable row level security;
create policy "Users can CRUD own wishlist"
  on wishlist for all using (auth.uid() = user_id);

-- ── orders ────────────────────────────────────────────────────────────────────
create table if not exists orders (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references profiles(id) on delete cascade not null,
  stripe_session text,
  status         text default 'pending',
  items          jsonb,
  total_cents    integer,
  created_at     timestamptz default now()
);
alter table orders enable row level security;
create policy "Users can read own orders"
  on orders for select using (auth.uid() = user_id);

-- ── gift_cards ────────────────────────────────────────────────────────────────
create table if not exists gift_cards (
  id           uuid default gen_random_uuid() primary key,
  code         text unique not null,
  amount_cents integer not null,
  redeemed_by  uuid references profiles(id),
  redeemed_at  timestamptz
);
alter table gift_cards enable row level security;
create policy "Users can read unredeemed cards or own cards"
  on gift_cards for select
  using (redeemed_by is null or auth.uid() = redeemed_by);

-- ── Helper functions ──────────────────────────────────────────────────────────
-- Called by api/generate-pattern.js (service role) after each PDF download
create or replace function increment_download_count(p_user_id uuid, p_garment_id text)
returns void language plpgsql security definer as $$
begin
  update purchases
  set download_count = download_count + 1
  where user_id = p_user_id and garment_id = p_garment_id;
end;
$$;

-- ── newsletter ────────────────────────────────────────────────────────────────
-- Simple email list for new-pattern notifications (no account required)
create table if not exists newsletter (
  id           uuid default gen_random_uuid() primary key,
  email        text unique not null,
  subscribed_at timestamptz default now()
);
alter table newsletter enable row level security;
-- No user-facing RLS needed — inserts handled by service role via api/join-list.js

-- ── pattern_sessions ──────────────────────────────────────────────────────────
-- Tracks when users generate a pattern preview (client calls /api/log-generation).
-- Used by the email cron to identify generated-but-not-purchased users.
create table if not exists pattern_sessions (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete set null,
  email       text,
  garment_id  text not null,
  generated_at timestamptz default now(),
  purchased   boolean default false
);
alter table pattern_sessions enable row level security;
create policy "Users can insert own pattern sessions"
  on pattern_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own pattern sessions"
  on pattern_sessions for update using (auth.uid() = user_id);
-- Migration: run once on existing installs
--   (table is new, no migration needed)

-- ── email_log ─────────────────────────────────────────────────────────────────
-- Tracks every transactional email sent. Check before sending to prevent duplicates.
create table if not exists email_log (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references profiles(id) on delete set null,
  email      text not null,
  template   text not null,
  sent_at    timestamptz default now(),
  garment_id text,
  metadata   jsonb
);
alter table email_log enable row level security;
-- Service role only — no user-facing reads needed
-- Migration: run once on existing installs
--   (table is new, no migration needed)

-- ── fit_feedback ──────────────────────────────────────────────────────────────
-- Structured sewing fit feedback submitted after a pattern is sewn.
create table if not exists fit_feedback (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references profiles(id) on delete cascade not null,
  purchase_id      uuid references purchases(id) on delete cascade not null,
  garment_id       text not null,
  profile_id       uuid references measurement_profiles(id) on delete set null,
  overall_fit      text check (overall_fit in ('perfect','good','needs_adjustment','poor')) not null,
  specific_feedback jsonb,
  notes            text,
  photo_url        text,
  created_at       timestamptz default now(),
  unique (user_id, purchase_id)
);
alter table fit_feedback enable row level security;
create policy "Users can CRUD own fit feedback"
  on fit_feedback for all using (auth.uid() = user_id);
-- Migration: run once on existing installs
--   (table is new, no migration needed)

-- ── Supabase Storage ──────────────────────────────────────────────────────────
-- Create a private 'patterns' bucket in the Supabase Dashboard:
--   Storage → New bucket → Name: "patterns" → Public: OFF
-- Or via SQL:
-- insert into storage.buckets (id, name, public) values ('patterns', 'patterns', false)
--   on conflict do nothing;
