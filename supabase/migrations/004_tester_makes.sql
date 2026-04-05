-- Tester UGC & Social Proof: testers + tester_makes tables
-- Supports self-service photo submissions, admin approval, and public gallery display.

-- ── testers ──────────────────────────────────────────────────────────────────
-- A tester may or may not have a People's Patterns account.
create table if not exists testers (
  id               uuid default gen_random_uuid() primary key,
  display_name     text not null,
  instagram_handle text,
  email            text,
  user_id          uuid references profiles(id) on delete set null,
  created_at       timestamptz default now()
);
alter table testers enable row level security;

-- Public can read testers (needed to join with tester_makes for gallery)
create policy "Public read testers"
  on testers for select using (true);

-- ── tester_makes ─────────────────────────────────────────────────────────────
create table if not exists tester_makes (
  id             uuid default gen_random_uuid() primary key,
  tester_id      uuid references testers(id) on delete cascade not null,
  garment_id     text not null,
  photo_urls     text[] not null default '{}',
  caption        text,
  status         text not null default 'pending'
                   check (status in ('pending', 'approved', 'rejected', 'featured')),
  admin_notes    text,
  social_posted  boolean default false,
  created_at     timestamptz default now(),
  approved_at    timestamptz
);
alter table tester_makes enable row level security;

-- Public can only read approved or featured makes
create policy "Public read approved makes"
  on tester_makes for select
  using (status in ('approved', 'featured'));

-- Index for fast garment-specific gallery queries
create index if not exists idx_tester_makes_garment_status
  on tester_makes (garment_id, status);

-- ── Supabase Storage ─────────────────────────────────────────────────────────
-- Create a PUBLIC 'tester-makes' bucket for approved tester photos.
-- Run in Supabase Dashboard or via SQL:
-- insert into storage.buckets (id, name, public)
--   values ('tester-makes', 'tester-makes', true)
--   on conflict do nothing;
