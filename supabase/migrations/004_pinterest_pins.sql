-- Pinterest pin automation — scheduled pins posted via IFTTT webhook
-- Images hosted in Supabase Storage (public bucket)

-- ── Storage bucket ──────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('pinterest-pins', 'pinterest-pins', true)
on conflict do nothing;

create policy "Public read pinterest-pins"
  on storage.objects for select
  using (bucket_id = 'pinterest-pins');

-- ── Pin schedule table ──────────────────────────────────────────────────────
create table pinterest_pins (
  id            uuid primary key default gen_random_uuid(),
  article_slug  text not null,
  pin_id        text not null unique,
  type          text not null,          -- comparison-table | infographic | how-to | product-feature | checklist
  title         text not null,
  description   text not null,
  board         text not null,
  image_url     text,                   -- Supabase Storage public URL (set after upload)
  link          text not null,          -- article path, e.g. /learn/how-to-measure-yourself
  scheduled_at  timestamptz not null,
  posted_at     timestamptz,
  ifttt_status  text default 'pending', -- pending | success | error
  error_message text,
  created_at    timestamptz default now()
);

create index idx_pinterest_pins_due
  on pinterest_pins (scheduled_at)
  where posted_at is null;

comment on table pinterest_pins is
  'Scheduled Pinterest pins — cron job fires IFTTT webhooks for due pins';
