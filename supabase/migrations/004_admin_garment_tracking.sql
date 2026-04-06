-- Admin dashboard: garment catalog tracking and photo storage.
-- Run once: supabase db push  OR paste into the Supabase SQL editor.
--
-- MANUAL STEP: Create a Supabase Storage bucket named "admin-photos"
-- (private, no public access) via the Supabase dashboard.

-- ── garment_catalog ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS garment_catalog (
  id           text PRIMARY KEY,
  name         text NOT NULL,
  category     text NOT NULL,
  difficulty   text,
  tier         int NOT NULL DEFAULT 0,
  dev_status   text NOT NULL DEFAULT 'planned',
  muslin_status text NOT NULL DEFAULT 'not-started',
  muslin_notes text,
  priority     int NOT NULL DEFAULT 0,
  engine_needs text,
  freesewing_ref text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE garment_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_select_garment_catalog ON garment_catalog
  FOR SELECT USING (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');
CREATE POLICY admin_insert_garment_catalog ON garment_catalog
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');
CREATE POLICY admin_update_garment_catalog ON garment_catalog
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');
CREATE POLICY admin_delete_garment_catalog ON garment_catalog
  FOR DELETE USING (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');

-- ── garment_photos ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS garment_photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garment_id   text NOT NULL REFERENCES garment_catalog(id) ON DELETE CASCADE,
  photo_type   text NOT NULL,
  storage_path text NOT NULL,
  caption      text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE garment_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_select_garment_photos ON garment_photos
  FOR SELECT USING (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');
CREATE POLICY admin_insert_garment_photos ON garment_photos
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');
CREATE POLICY admin_update_garment_photos ON garment_photos
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');
CREATE POLICY admin_delete_garment_photos ON garment_photos
  FOR DELETE USING (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');

-- ── Admin read policies on existing tables ───────────────────────────────────
-- These let the admin dashboard query ALL rows (not just the admin's own).

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_read_purchases') THEN
    CREATE POLICY admin_read_purchases ON purchases
      FOR SELECT USING (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_read_fit_feedback') THEN
    CREATE POLICY admin_read_fit_feedback ON fit_feedback
      FOR SELECT USING (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_read_profiles') THEN
    CREATE POLICY admin_read_profiles ON profiles
      FOR SELECT USING (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_read_wishlist') THEN
    CREATE POLICY admin_read_wishlist ON wishlist
      FOR SELECT USING (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_read_newsletter') THEN
    CREATE POLICY admin_read_newsletter ON newsletter
      FOR SELECT USING (auth.jwt() ->> 'email' = 'kolbyboyd970@gmail.com');
  END IF;
END $$;

-- ── Seed data: existing garments (tier 0, code-complete) ─────────────────────

INSERT INTO garment_catalog (id, name, category, difficulty, tier, dev_status) VALUES
  ('cargo-shorts',       'Cargo Shorts',          'lower',  'beginner',     0, 'code-complete'),
  ('gym-shorts',         'Gym Shorts',            'lower',  'beginner',     0, 'code-complete'),
  ('swim-trunks',        'Swim Trunks',           'lower',  'beginner',     0, 'code-complete'),
  ('pleated-shorts',     'Pleated Shorts',        'lower',  'intermediate', 0, 'code-complete'),
  ('straight-jeans',     'Straight Jeans',        'lower',  'intermediate', 0, 'code-complete'),
  ('chinos',             'Chinos',                'lower',  'intermediate', 0, 'code-complete'),
  ('pleated-trousers',   'Pleated Trousers',      'lower',  'intermediate', 0, 'code-complete'),
  ('sweatpants',         'Sweatpants',            'lower',  'beginner',     0, 'code-complete'),
  ('tee',                'T-Shirt',               'upper',  'beginner',     0, 'code-complete'),
  ('camp-shirt',         'Camp Shirt',            'upper',  'intermediate', 0, 'code-complete'),
  ('crewneck',           'Crewneck',              'upper',  'beginner',     0, 'code-complete'),
  ('hoodie',             'Hoodie',                'upper',  'intermediate', 0, 'code-complete'),
  ('crop-jacket',        'Crop Jacket',           'upper',  'intermediate', 0, 'code-complete'),
  ('denim-jacket',       'Denim Jacket',          'upper',  'expert',       0, 'code-complete'),
  ('wide-leg-trouser-w', 'Wide-Leg Trouser (W)',  'lower',  'intermediate', 0, 'code-complete'),
  ('straight-trouser-w', 'Straight Trouser (W)',  'lower',  'intermediate', 0, 'code-complete'),
  ('easy-pant-w',        'Easy Pant (W)',         'lower',  'beginner',     0, 'code-complete'),
  ('button-up-w',        'Button-Up (W)',         'upper',  'intermediate', 0, 'code-complete'),
  ('shell-blouse-w',     'Shell Blouse (W)',      'upper',  'beginner',     0, 'code-complete'),
  ('fitted-tee-w',       'Fitted Tee (W)',        'upper',  'beginner',     0, 'code-complete'),
  ('slip-skirt-w',       'Slip Skirt (W)',        'skirt',  'beginner',     0, 'code-complete'),
  ('a-line-skirt-w',     'A-Line Skirt (W)',      'skirt',  'beginner',     0, 'code-complete'),
  ('shirt-dress-w',      'Shirt Dress (W)',       'dress',  'intermediate', 0, 'code-complete'),
  ('wrap-dress-w',       'Wrap Dress (W)',        'dress',  'intermediate', 0, 'code-complete')
ON CONFLICT (id) DO NOTHING;

-- ── Seed data: planned garments from roadmap ─────────────────────────────────

-- Tier 1
INSERT INTO garment_catalog (id, name, category, difficulty, tier, engine_needs, freesewing_ref) VALUES
  ('circle-skirt',   'Circle Skirt',        'skirt',     'beginner', 1, 'ring-sector math (reuse curved waistband v2)', 'sandy'),
  ('pencil-skirt',   'Pencil Skirt',        'skirt',     'beginner', 1, 'straight panels + back vent/kick pleat', 'penelope'),
  ('tank-top',       'Tank Top / A-Shirt',  'upper',     'beginner', 1, 'sleeveless bodice, wide straps', 'aaron'),
  ('boxer-briefs',   'Boxer Briefs',        'underwear', 'beginner', 1, 'small panels, elastic waist, knit', 'bruce'),
  ('leggings',       'Leggings',            'lower',     'beginner', 1, 'knit stretch panels, elastic waist', 'lily, lumina'),
  ('apron',          'Apron',               'accessory', 'beginner', 1, 'flat rectangle + ties, no fitting', 'albert'),
  ('bow-tie',        'Bow Tie',             'accessory', 'beginner', 1, 'flat pattern, no fitting', 'benjamin'),
  ('flat-cap',       'Flat Cap',            'accessory', 'beginner', 1, 'crown + brim panels', 'florent')
ON CONFLICT (id) DO NOTHING;

-- Tier 2
INSERT INTO garment_catalog (id, name, category, difficulty, tier, engine_needs, freesewing_ref) VALUES
  ('sundress',          'Sundress',                  'dress',    'intermediate', 2, 'bodice + gathered/A-line skirt, straps', 'sophie'),
  ('knit-dress',        'Knit Dress',                'dress',    'intermediate', 2, 'stretch bodice + straight/A-line skirt', 'onyx'),
  ('draped-top',        'Draped Top',                'upper',    'intermediate', 2, 'drape cowl neckline geometry', 'diana'),
  ('overalls',          'Overalls',                  'full-body','intermediate', 2, 'bib front, suspender straps, trouser base', 'opal'),
  ('romper',            'Romper',                    'full-body','intermediate', 2, 'bodice + shorts, single garment', 'otis'),
  ('wrap-pants',        'Wrap Pants',                'lower',    'intermediate', 2, 'overlap panels, tie waist', 'waralee'),
  ('cycling-shorts',    'Cycling Shorts',            'lower',    'intermediate', 2, 'high-stretch panels, chamois pad', 'cornelius'),
  ('button-up-m',       'Classic Button-Up Shirt (M)','upper',   'intermediate', 2, 'collar stand, yoke, sleeve placket', 'simon'),
  ('waistcoat',         'Waistcoat / Vest',          'upper',    'intermediate', 2, 'front panels + back, welt pockets', 'wahid'),
  ('quarter-zip',       'Quarter-Zip Pullover',      'upper',    'intermediate', 2, 'half-placket, stand collar', NULL),
  ('swimshirt',         'Swimshirt / Rash Guard',    'upper',    'intermediate', 2, 'knit, raglan or set-in, UPF fabric', 'shelly'),
  ('bikini-top',        'Bikini Top',                'swimwear', 'intermediate', 2, 'cups, ties/bands, stretch', 'bee')
ON CONFLICT (id) DO NOTHING;

-- Tier 3
INSERT INTO garment_catalog (id, name, category, difficulty, tier, engine_needs, freesewing_ref) VALUES
  ('trucker-jacket',  'Denim Trucker Jacket',  'jacket',    'expert',   3, 'already built (v0.8.0)', NULL),
  ('blazer',          'Blazer / Sport Coat',   'jacket',    'expert',   3, 'lapel/gorge line, welt pockets, canvas', 'jaeger'),
  ('overcoat',        'Coat (Overcoat)',       'jacket',    'expert',   3, 'extended blazer block, lining, deep hem', 'carlita/carlton'),
  ('trench-coat',     'Trench Coat',           'jacket',    'expert',   3, 'storm flap, gun flap, belt, epaulettes', NULL),
  ('corset',          'Corset',                'structure', 'expert',   3, 'boning channels, busk, lacing', 'cathrin'),
  ('tailored-shirt-w','Tailored Shirt (W)',    'upper',     'advanced', 3, 'princess seams, collar variations', 'simone'),
  ('puffy-pants',     'Puffy Pants',           'lower',     'advanced', 3, 'volume, gathering, elastic', 'percy')
ON CONFLICT (id) DO NOTHING;

-- Tier 4
INSERT INTO garment_catalog (id, name, category, difficulty, tier, engine_needs) VALUES
  ('tote-bag',            'Tote Bag',               'bag',       'beginner',     4, 'MYOG gateway pattern, huge Etsy demand'),
  ('crossbody-bag',       'Crossbody Bag',          'bag',       'beginner',     4, 'adjustable strap, zipper'),
  ('messenger-bag',       'Messenger Bag',          'bag',       'intermediate', 4, 'flap, buckle, laptop sleeve'),
  ('duffle-bag',          'Duffle Bag',             'bag',       'intermediate', 4, 'cylinder geometry, handles, zipper'),
  ('daypack',             'Daypack / Backpack',     'bag',       'advanced',     4, 'structured panels, straps, padding'),
  ('face-mask',           'Face Mask',              'accessory', 'beginner',     4, 'flat or contoured, elastic/ties'),
  ('deerstalker-hat',     'Deerstalker Hat',        'accessory', 'intermediate', 4, '4 panels + ear flaps'),
  ('handbag',             'Handbag',                'bag',       'intermediate', 4, 'structured sides, handles, lining'),
  ('necktie',             'Tie (Necktie)',          'accessory', 'beginner',     4, 'bias-cut, slip stitch lining'),
  ('halloween-costume',   'Halloween Costume Base', 'costume',   'intermediate', 4, 'seasonal, October launch'),
  ('holiday-party-dress', 'Holiday Party Dress',    'dress',     'intermediate', 4, 'seasonal, November launch'),
  ('plush-octopus',       'Plush Toy (Octopus)',    'novelty',   'beginner',     4, 'social media magnet, kid-friendly')
ON CONFLICT (id) DO NOTHING;
