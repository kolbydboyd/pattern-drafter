-- Photo alt-text and optimization metadata for tester submissions.
-- Alt-text is auto-generated from structured data (garment, fit, fabric, view).

-- Add alt_texts array parallel to photos array
alter table tester_submissions
  add column if not exists photo_alt_texts text[] not null default '{}';

-- Add photo_views for structured context (front, back, side, detail, flat-lay)
alter table tester_submissions
  add column if not exists photo_views text[] not null default '{}';

-- Track optimization status
alter table tester_submissions
  add column if not exists photos_optimized boolean not null default false;

-- Site-assets bucket for sitemap and other generated files
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "Public read site-assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');
