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
  insert into public.profiles (id, email)
  values (new.id, new.email);
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

-- ── Migration: add profile_id to existing purchases table ─────────────────────
-- Run this once if the table already exists (new installs use the CREATE above):
--   alter table purchases
--     add column if not exists profile_id uuid references measurement_profiles(id) on delete set null;
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

-- ── Supabase Storage ──────────────────────────────────────────────────────────
-- Create a private 'patterns' bucket in the Supabase Dashboard:
--   Storage → New bucket → Name: "patterns" → Public: OFF
-- Or via SQL:
-- insert into storage.buckets (id, name, public) values ('patterns', 'patterns', false)
--   on conflict do nothing;
