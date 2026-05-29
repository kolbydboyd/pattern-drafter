-- Pattern Tester Program v2: expanded intake + paid-slot tracking

-- ── 1. Expand tester_applications with intake fields ─────────────────────────

alter table tester_applications
  add column if not exists full_name             text,
  add column if not exists location              text,
  add column if not exists measurements          jsonb not null default '{}',
  add column if not exists pattern_categories    text[] not null default '{}',
  add column if not exists has_printer           boolean not null default false,
  add column if not exists agreement_accepted    boolean not null default false,
  add column if not exists agreement_accepted_at timestamptz,
  add column if not exists agreement_version     text,
  add column if not exists media_consent         boolean not null default false;

-- ── 2. Paid-slot tracking on tester_assignments ──────────────────────────────

alter table tester_assignments
  add column if not exists is_paid_slot    boolean not null default false,
  add column if not exists paid_slot_month text; -- 'YYYY-MM', populated only when is_paid_slot = true

create index if not exists idx_tester_assign_paid_month
  on tester_assignments(paid_slot_month) where is_paid_slot = true;
