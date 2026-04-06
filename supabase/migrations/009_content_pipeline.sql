-- Content pipeline: track videos/posts through production stages
CREATE TABLE IF NOT EXISTS content_pipeline (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  script      TEXT,
  shot_list   TEXT,
  status      TEXT NOT NULL DEFAULT 'idea'
              CHECK (status IN ('idea','script','shot-list','filming','editing','uploaded')),
  platform    TEXT NOT NULL DEFAULT 'youtube'
              CHECK (platform IN ('youtube','tiktok','instagram','pinterest','facebook','other')),
  url         TEXT,
  views       INTEGER,
  likes       INTEGER,
  comments    INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE content_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access" ON content_pipeline
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_content_pipeline_user_status ON content_pipeline(user_id, status);
