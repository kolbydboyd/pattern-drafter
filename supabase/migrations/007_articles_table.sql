-- Articles table — migrates static JS articles to Supabase for dynamic updates.
-- Supports the learn page, sitemap cron, and internal link updater.

create table if not exists articles (
  id            bigint generated always as identity primary key,
  slug          text unique not null,
  title         text not null,
  description   text not null,
  category      text not null,
  tags          text[] not null default '{}',
  youtube_id    text,
  date_published date not null,
  faq_schema    jsonb not null default '[]',
  body          text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index for date-based queries (sitemap, listing, link updater)
create index if not exists idx_articles_published
  on articles (date_published desc);

-- Index for slug lookups
create index if not exists idx_articles_slug on articles (slug);

-- Enable RLS
alter table articles enable row level security;

-- Public read access (articles are public content)
create policy "Public read articles"
  on articles for select
  using (true);

-- Service-role-only write access (crons and admin)
create policy "Service role write articles"
  on articles for all
  using (auth.role() = 'service_role');

-- Auto-update updated_at on changes
create or replace function update_articles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_updated_at
  before update on articles
  for each row
  execute function update_articles_updated_at();
