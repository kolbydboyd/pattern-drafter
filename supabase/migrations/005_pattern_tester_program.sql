-- Pattern Tester Program
-- Tables: tester_applications, tester_assignments, tester_submissions

-- ── 1. Applications ──────────────────────────────────────────────────────────

create table if not exists tester_applications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  status        text not null default 'pending'
                  check (status in ('pending','approved','rejected','withdrawn')),
  experience    text not null default 'beginner'
                  check (experience in ('beginner','intermediate','advanced')),
  specialties   text[] not null default '{}',
  machine_types text[] not null default '{}',
  social_handle text,
  portfolio_url text,
  why_test      text not null default '',
  admin_notes   text,
  reviewed_by   uuid references auth.users(id),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_tester_apps_user   on tester_applications(user_id);
create index idx_tester_apps_status on tester_applications(status);

-- Only one active (non-withdrawn) application per user
create unique index idx_tester_apps_one_active
  on tester_applications(user_id) where status != 'withdrawn';

-- ── 2. Assignments (approved tester ↔ garment) ──────────────────────────────

create table if not exists tester_assignments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references tester_applications(id) on delete cascade,
  garment_id    text not null,
  purchase_id   uuid references purchases(id),
  status        text not null default 'assigned'
                  check (status in ('assigned','in_progress','submitted','featured','expired')),
  due_at        timestamptz not null default (now() + interval '30 days'),
  started_at    timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_tester_assign_user    on tester_assignments(user_id);
create index idx_tester_assign_status  on tester_assignments(status);

-- One active assignment per user per garment
create unique index idx_tester_assign_unique
  on tester_assignments(user_id, garment_id)
  where status not in ('expired');

-- ── 3. Submissions (photos + structured feedback) ────────────────────────────

create table if not exists tester_submissions (
  id              uuid primary key default gen_random_uuid(),
  assignment_id   uuid not null references tester_assignments(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  garment_id      text not null,

  -- Structured fit feedback
  overall_fit     text not null check (overall_fit in ('perfect','good','needs_adjustment','poor')),
  fit_areas       jsonb not null default '{}',
  difficulty_rating int not null check (difficulty_rating between 1 and 5),
  instructions_clarity int not null check (instructions_clarity between 1 and 5),
  would_sew_again boolean not null default true,

  -- Free-text
  fit_notes       text not null default '',
  construction_notes text not null default '',
  fabric_used     text not null default '',
  modifications   text not null default '',
  tips            text not null default '',

  -- Photos (Supabase Storage paths)
  photos          text[] not null default '{}',
  photo_captions  text[] not null default '{}',

  -- Feature consent
  feature_consent boolean not null default false,
  social_handle   text,

  -- Admin
  admin_notes     text,
  featured        boolean not null default false,
  featured_at     timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_tester_sub_assign  on tester_submissions(assignment_id);
create index idx_tester_sub_user    on tester_submissions(user_id);
create index idx_tester_sub_featured on tester_submissions(featured) where featured = true;

-- ── 4. RLS policies ──────────────────────────────────────────────────────────

alter table tester_applications enable row level security;
alter table tester_assignments  enable row level security;
alter table tester_submissions  enable row level security;

-- Applications: users see their own, admins see all (via service role)
create policy "Users read own applications"
  on tester_applications for select
  using (auth.uid() = user_id);

create policy "Users insert own applications"
  on tester_applications for insert
  with check (auth.uid() = user_id);

create policy "Users update own applications"
  on tester_applications for update
  using (auth.uid() = user_id);

-- Assignments: users see their own
create policy "Users read own assignments"
  on tester_assignments for select
  using (auth.uid() = user_id);

-- Submissions: users manage their own
create policy "Users read own submissions"
  on tester_submissions for select
  using (auth.uid() = user_id);

create policy "Users insert own submissions"
  on tester_submissions for insert
  with check (auth.uid() = user_id);

create policy "Users update own submissions"
  on tester_submissions for update
  using (auth.uid() = user_id);

-- Public read for featured submissions (gallery)
create policy "Anyone reads featured submissions"
  on tester_submissions for select
  using (featured = true);

-- ── 5. Storage bucket for tester photos ──────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('tester-photos', 'tester-photos', true)
on conflict (id) do nothing;

-- Testers can upload to their own folder
create policy "Testers upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'tester-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read for all tester photos
create policy "Public read tester photos"
  on storage.objects for select
  using (bucket_id = 'tester-photos');

-- ── 6. Add is_tester flag to profiles ────────────────────────────────────────

alter table profiles add column if not exists is_tester boolean not null default false;
alter table profiles add column if not exists is_admin  boolean not null default false;
