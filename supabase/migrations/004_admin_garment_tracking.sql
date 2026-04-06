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

-- fit_feedback table does not exist yet; add admin policy when it's created

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
  ('wrap-dress-w',       'Wrap Dress (W)',        'dress',  'intermediate', 0, 'code-complete'),
  ('baggy-jeans',        'Baggy Jeans',           'lower',  'intermediate', 0, 'code-complete'),
  ('baggy-shorts',       'Baggy Shorts',          'lower',  'beginner',     0, 'code-complete'),
  ('874-work-pants',     '874 Work Pants',        'lower',  'intermediate', 0, 'code-complete'),
  ('button-up',          'Button-Up (M)',         'upper',  'intermediate', 0, 'code-complete'),
  ('athletic-formal-jacket','Athletic Formal Jacket','upper','expert',      0, 'code-complete'),
  ('cargo-work-pants',   'Cargo Work Pants',      'lower',  'intermediate', 0, 'code-complete'),
  ('athletic-formal-trousers','Athletic Formal Trousers','lower','intermediate',0,'code-complete'),
  ('tshirt-dress-w',     'T-Shirt Dress (W)',     'dress',  'beginner',     0, 'code-complete'),
  ('slip-dress-w',       'Slip Dress (W)',        'dress',  'beginner',     0, 'code-complete'),
  ('a-line-dress-w',     'A-Line Dress (W)',      'dress',  'intermediate', 0, 'code-complete'),
  ('sundress-w',         'Sundress (W)',          'dress',  'intermediate', 0, 'code-complete'),
  ('apron',              'Apron',                 'accessory','beginner',    0, 'code-complete'),
  ('bow-tie',            'Bow Tie',               'accessory','beginner',    0, 'code-complete'),
  ('tank-top',           'Tank Top',              'upper',  'beginner',     0, 'code-complete'),
  ('circle-skirt-w',     'Circle Skirt (W)',      'skirt',  'beginner',     0, 'code-complete'),
  ('pencil-skirt-w',     'Pencil Skirt (W)',      'skirt',  'beginner',     0, 'code-complete'),
  ('leggings',           'Leggings',              'lower',  'beginner',     0, 'code-complete'),
  ('tote-bag',           'Tote Bag',              'bag',    'beginner',     0, 'code-complete')
ON CONFLICT (id) DO NOTHING;

-- ── Seed data: planned garments from roadmap ─────────────────────────────────

-- Tier 1 (items already built moved to tier 0 above)
INSERT INTO garment_catalog (id, name, category, difficulty, tier, engine_needs, freesewing_ref) VALUES
  ('boxer-briefs',   'Boxer Briefs',        'underwear', 'beginner', 1, 'small panels, elastic waist, knit', 'bruce'),
  ('flat-cap',       'Flat Cap',            'accessory', 'beginner', 1, 'crown + brim panels', 'florent')
ON CONFLICT (id) DO NOTHING;

-- Tier 1: additional from expanded roadmap
INSERT INTO garment_catalog (id, name, category, difficulty, tier, engine_needs) VALUES
  ('wrap-skirt',      'Wrap Skirt',             'skirt',     'beginner',     1, 'front overlap panels, tie waist'),
  ('maxi-skirt',      'Maxi Skirt',             'skirt',     'beginner',     1, 'A-line panels, hang 24-48hrs before hemming'),
  ('shift-dress-w',   'Shift Dress (W)',        'dress',     'beginner',     1, 'minimal darts, boxy bodice + CB zip'),
  ('pinafore-dress-w','Pinafore / Jumper Dress','dress',     'beginner',     1, 'straps, A-line skirt, layering piece'),
  ('babydoll-dress-w','Babydoll Dress (W)',     'dress',     'beginner',     1, 'empire line, gathering ratio 1.5-2.5:1'),
  ('trapeze-dress-w', 'Trapeze Dress (W)',      'dress',     'beginner',     1, 'flare ratio 1:2 to 1:3 from bust to hem'),
  ('crop-top-w',      'Crop Top (W)',           'upper',     'beginner',     1, 'shortened bodice to underbust'),
  ('halter-top-w',    'Halter Top (W)',         'upper',     'beginner',     1, 'halter straps, back elastic'),
  ('tunic-w',         'Tunic (W)',              'upper',     'beginner',     1, 'extended tee block, A-line shaping'),
  ('dolman-top-w',    'Dolman / Batwing Top',   'upper',     'beginner',     1, 'T-shape, no armhole, gusset optional'),
  ('turtleneck',      'Turtleneck',             'upper',     'beginner',     1, 'knit only, collar = neck x 0.85-0.90'),
  ('henley',          'Henley',                 'upper',     'beginner',     1, 'placket 6-8in, 3-4 buttons'),
  ('vneck-tee',       'V-Neck Tee',             'upper',     'beginner',     1, 'V depth 7-10in, mitered binding at apex'),
  ('raglan-tee',      'Raglan Tee',             'upper',     'beginner',     1, 'diagonal raglan seam, no armholeCurve()'),
  ('pajama-pants',    'Pajama Pants',            'lower',     'beginner',     1, 'simplified lower block, elastic + drawstring'),
  ('joggers',         'Joggers',                 'lower',     'beginner',     1, 'tapered sweatpants, rib cuffs'),
  ('lounge-shorts',   'Lounge Shorts',           'lower',     'beginner',     1, 'elastic waist, no fly, minimal shaping'),
  ('palazzo-pants-w', 'Palazzo Pants (W)',        'lower',     'intermediate', 1, 'ultra-wide legs, high waist, side zip'),
  ('pajama-top',      'Pajama Set Top',           'upper',     'beginner',     1, 'camp shirt block with more ease'),
  ('robe',            'Robe / Kimono Robe',       'outerwear', 'beginner',     1, 'shawl collar, belt, inner tie'),
  ('nightgown-w',     'Nightgown (W)',            'dress',     'beginner',     1, 'empire/natural waist, gathered skirt'),
  ('underwear-w',     'Underwear / Knickers (W)', 'underwear', 'beginner',     1, 'cotton gusset, FOE at legs, negative ease'),
  ('scrunchie',       'Scrunchie',                'accessory', 'beginner',     1, '1 rectangle + elastic, 10-min project'),
  ('cardigan',        'Cardigan',                 'outerwear', 'beginner',     1, 'open front, button bands, rib trim'),
  ('cape-poncho',     'Cape / Poncho',            'outerwear', 'beginner',     1, 'rectangle or circle with neck hole'),
  ('kimono-jacket',   'Kimono Jacket',            'outerwear', 'beginner',     1, 'integral sleeves, belt, overlap front'),
  ('vest-gilet',      'Vest / Gilet',             'outerwear', 'intermediate', 1, 'front panels + back, bagged lining'),
  ('bucket-hat',      'Bucket Hat',               'accessory', 'beginner',     1, 'crown circle + side band + brim ring'),
  ('beanie',          'Beanie',                   'accessory', 'beginner',     1, '2 or 4 panels, knit, negative ease'),
  ('neck-gaiter',     'Neck Gaiter / Buff',       'accessory', 'beginner',     1, '1 rectangle tube, stretch knit'),
  ('belly-band',      'Belly Band',               'maternity', 'beginner',     1, 'stretch tube, negative ease, very low effort')
ON CONFLICT (id) DO NOTHING;

-- Tier 2 (original)
INSERT INTO garment_catalog (id, name, category, difficulty, tier, engine_needs, freesewing_ref) VALUES
  ('knit-dress',        'Knit Dress',                'dress',    'intermediate', 2, 'stretch bodice + straight/A-line skirt', 'onyx'),
  ('draped-top',        'Draped Top',                'upper',    'intermediate', 2, 'drape cowl neckline geometry', 'diana'),
  ('overalls',          'Overalls',                  'full-body','intermediate', 2, 'bib front, suspender straps, trouser base', 'opal'),
  ('romper',            'Romper',                    'full-body','intermediate', 2, 'bodice + shorts, single garment', 'otis'),
  ('wrap-pants',        'Wrap Pants',                'lower',    'intermediate', 2, 'overlap panels, tie waist', 'waralee'),
  ('cycling-shorts',    'Cycling Shorts',            'lower',    'intermediate', 2, 'high-stretch panels, chamois pad', 'cornelius'),
  ('waistcoat',         'Waistcoat / Vest',          'upper',    'intermediate', 2, 'front panels + back, welt pockets', 'wahid'),
  ('quarter-zip',       'Quarter-Zip Pullover',      'upper',    'intermediate', 2, 'half-placket, stand collar', NULL),
  ('swimshirt',         'Swimshirt / Rash Guard',    'upper',    'intermediate', 2, 'knit, raglan or set-in, UPF fabric', 'shelly'),
  ('bikini-top',        'Bikini Top',                'swimwear', 'intermediate', 2, 'cups, ties/bands, stretch', 'bee')
ON CONFLICT (id) DO NOTHING;

-- Tier 2: expanded roadmap additions
INSERT INTO garment_catalog (id, name, category, difficulty, tier, engine_needs) VALUES
  ('fit-flare-dress-w',  'Fit-and-Flare Dress (W)',  'dress',     'intermediate', 2, 'circle skirt math + fitted bodice'),
  ('maxi-dress-w',       'Maxi Dress (W)',           'dress',     'intermediate', 2, 'floor length, hang 48hrs, slit option'),
  ('tiered-dress-w',     'Tiered Dress (W)',         'dress',     'intermediate', 2, 'gathering progression tiers'),
  ('smocked-dress-w',    'Smocked Dress (W)',        'dress',     'intermediate', 2, 'shirring rows reduce fabric to 40-50%'),
  ('empire-dress-w',     'Empire Waist Dress (W)',   'dress',     'intermediate', 2, 'empire line, stay tape critical'),
  ('sheath-dress-w',     'Sheath Dress (W)',         'dress',     'intermediate', 2, 'princess seams, CB vent, lining'),
  ('bodycon-dress-w',    'Bodycon Dress (W)',        'dress',     'intermediate', 2, 'negative ease, high-stretch knit only'),
  ('bias-slip-dress-w',  'Bias-Cut Slip Dress (W)',  'dress',     'intermediate', 2, 'true bias 45deg, fabric grows 1-2in'),
  ('pinafore-convert-w', 'Pinafore Convertible (W)', 'dress',     'intermediate', 2, 'detachable bodice via snap tape'),
  ('pleated-skirt-w',    'Pleated Skirt (W)',        'skirt',     'intermediate', 2, 'knife pleat 3:1 ratio'),
  ('tiered-skirt-w',     'Tiered / Gathered Skirt',  'skirt',     'intermediate', 2, 'yoke + progressive gathering tiers'),
  ('culottes-w',         'Culottes (W)',             'skirt',     'intermediate', 2, 'trouser block with very wide legs'),
  ('yoke-skirt-w',       'Yoke Skirt (W)',           'skirt',     'intermediate', 2, 'interfaced yoke + gathered skirt'),
  ('tulip-skirt-w',      'Tulip Skirt (W)',          'skirt',     'intermediate', 2, 'two overlapping front panels'),
  ('godet-skirt-w',      'Godet Skirt (W)',          'skirt',     'intermediate', 2, 'triangle godets inserted at seams'),
  ('bias-skirt-w',       'Bias-Cut Skirt (W)',       'skirt',     'intermediate', 2, '45deg bias, petersham waistband'),
  ('peplum-top-w',       'Peplum Top (W)',           'upper',     'intermediate', 2, 'fitted bodice + circle peplum'),
  ('wrap-top-w',         'Wrap Top (W)',             'upper',     'intermediate', 2, 'wrap-dress block shortened'),
  ('peasant-blouse-w',   'Peasant / Boho Blouse',   'upper',     'intermediate', 2, 'gathered neckline, puff sleeves'),
  ('off-shoulder-w',     'Off-Shoulder / Bardot',    'upper',     'intermediate', 2, 'elastic at upper arm, optional ruffle'),
  ('puff-sleeve-top-w',  'Puff-Sleeve Top (W)',      'upper',     'intermediate', 2, 'sleeve cap ease 3-6in'),
  ('bodysuit-w',         'Bodysuit (W)',             'upper',     'intermediate', 2, 'extended through crotch, snap closure'),
  ('corset-bustier-w',   'Corset / Bustier Top (W)', 'upper',     'advanced',     2, '6-panel min, boning, lacing'),
  ('polo-shirt',         'Polo Shirt (M)',           'upper',     'intermediate', 2, 'pique knit, collar + stand'),
  ('flannel-shirt',      'Flannel Shirt (M)',        'upper',     'intermediate', 2, 'plaid matching, yoke, flat-felled'),
  ('western-shirt',      'Western Shirt (M)',        'upper',     'intermediate', 2, 'pointed yoke, pearl snaps'),
  ('hawaiian-shirt',     'Hawaiian Shirt (M)',       'upper',     'intermediate', 2, 'camp collar, rayon, boxy'),
  ('rugby-shirt',        'Rugby Shirt (M)',          'upper',     'intermediate', 2, 'woven collar, twill placket'),
  ('paperbag-pants-w',   'Paperbag Waist Pants (W)', 'lower',     'intermediate', 2, 'waist cut 1.5-2x, gathered to fit'),
  ('cigarette-pants-w',  'Cigarette Pants (W)',      'lower',     'intermediate', 2, 'slim tapered, cropped ankle'),
  ('harem-pants',        'Harem / Drop-Crotch',     'lower',     'intermediate', 2, 'effective rise = natural + drop'),
  ('barrel-leg-pants-w', 'Barrel-Leg Pants (W)',     'lower',     'intermediate', 2, 'widest at knee, tapers to hem'),
  ('tailored-shorts-w',  'Tailored Shorts (W)',      'lower',     'intermediate', 2, 'chinos block shortened'),
  ('bike-shorts',        'Bike Shorts',              'lower',     'intermediate', 2, 'negative ease compression'),
  ('shacket',            'Shacket / Shirt Jacket',   'outerwear', 'intermediate', 2, 'heavy flannel shirt block'),
  ('bomber-jacket',      'Bomber Jacket',            'outerwear', 'intermediate', 2, 'rib collar/waistband/cuffs, lining'),
  ('puffer-jacket',      'Quilted / Puffer Jacket',  'outerwear', 'intermediate', 2, 'quilting channels, batting'),
  ('rain-jacket',        'Rain Jacket / Anorak',     'outerwear', 'intermediate', 2, 'waterproof, seam tape, hood'),
  ('peacoat',            'Peacoat',                  'outerwear', 'advanced',     2, 'double-breasted, two-piece sleeve'),
  ('varsity-jacket',     'Varsity Jacket',           'outerwear', 'intermediate', 2, 'two fabrics, striped rib'),
  ('puffer-vest',        'Puffer Vest',              'outerwear', 'intermediate', 2, 'puffer minus sleeves'),
  ('moto-jacket',        'Moto / Biker Jacket',      'outerwear', 'advanced',     2, 'asymmetric zip, two-piece sleeve'),
  ('bralette-w',         'Bralette (W)',             'underwear', 'intermediate', 2, 'cup sizing math, FOE edges'),
  ('sports-bra-w',       'Sports Bra (W)',           'underwear', 'intermediate', 2, 'negative ease, princess seam cups'),
  ('bikini-bottom-w',    'Bikini Bottom (W)',        'swimwear',  'intermediate', 2, 'negative + wet stretch compensation'),
  ('one-piece-swim-w',   'One-Piece Swimsuit (W)',   'swimwear',  'intermediate', 2, 'bodice + lower body, shelf bra'),
  ('tankini-w',          'Tankini (W)',              'swimwear',  'intermediate', 2, 'tank + bikini bottom combo'),
  ('swim-coverup-w',     'Swim Cover-Up / Kaftan',   'swimwear',  'beginner',     2, 'loose tunic, no fitting'),
  ('jumpsuit-w',         'Jumpsuit Wide-Leg (W)',    'full-body', 'intermediate', 2, 'upper + lower block at waist'),
  ('boilersuit',         'Boilersuit / Coverall',    'full-body', 'intermediate', 2, 'CF separating zip, utility pockets'),
  ('scrubs-top',         'Scrubs Top',               'upper',     'beginner',     2, 'V-neck, boxy, side vents'),
  ('scrubs-pants',       'Scrubs Pants',             'lower',     'beginner',     2, 'elastic + drawstring waist'),
  ('chef-coat',          'Chef Coat',                'upper',     'intermediate', 2, 'double-breasted, mandarin collar'),
  ('kids-leggings',      'Kids Leggings',            'lower',     'beginner',     2, 'adult scaled, ASTM D6192'),
  ('kids-tee',           'Kids T-Shirt',             'upper',     'beginner',     2, 'upper block scaled'),
  ('kids-dress',         'Kids Dress (A-Line)',       'dress',     'beginner',     2, 'bodice + A-line skirt'),
  ('kids-joggers',       'Kids Joggers',             'lower',     'beginner',     2, 'adult joggers scaled'),
  ('kids-pajamas',       'Kids Pajamas (Set)',        'full-body', 'beginner',     2, 'CPSC flammability compliance'),
  ('baby-romper',        'Baby Romper',              'full-body', 'beginner',     2, 'envelope neck, snap tape'),
  ('baby-onesie',        'Baby Onesie / Bodysuit',   'full-body', 'beginner',     2, 'envelope neck, 3 crotch snaps'),
  ('seated-fit-pants',   'Seated-Fit Pants',         'lower',     'intermediate', 2, 'back rise +3-4in, side-open'),
  ('magnetic-top',       'Magnetic Closure Top',     'upper',     'intermediate', 2, 'sew-in magnets replace buttons'),
  ('open-back-top',      'Open-Back Top/Gown',       'upper',     'intermediate', 2, 'full back opening, velcro/ties'),
  ('maternity-leggings', 'Maternity Leggings',       'lower',     'intermediate', 2, 'belly panel extension'),
  ('nursing-top',        'Nursing Top',              'upper',     'intermediate', 2, 'crossover/wrap for nursing access'),
  ('cocktail-dress-w',   'Cocktail Dress (W)',       'dress',     'advanced',     2, 'princess seams, boning, lining'),
  ('bridesmaid-dress-w', 'Bridesmaid Dress (W)',     'dress',     'advanced',     2, 'multi-style bodice, floor length'),
  ('evening-gown-w',     'Evening Gown (W)',         'dress',     'expert',       2, 'ball gown, train, 8-16 bones'),
  ('onesie-union-suit',  'Onesie / Union Suit',      'full-body', 'intermediate', 2, 'upper + lower + hood, CF zip'),
  ('infinity-dress-w',   'Infinity / Multi-Way Dress','dress',    'intermediate', 2, 'tube skirt + wrapping straps'),
  ('reversible-jacket',  'Reversible Jacket',        'outerwear', 'intermediate', 2, 'bagged construction, both sides'),
  ('dog-coat',           'Dog Coat / Jacket',        'accessory', 'beginner',     2, 'pet measurements, velcro'),
  ('christmas-stocking', 'Christmas Stocking',       'accessory', 'beginner',     2, 'stocking shape, cuff, loop'),
  ('advent-calendar',    'Advent Calendar',          'accessory', 'beginner',     2, '24-pocket wall hanging'),
  ('flower-girl-dress',  'Flower Girl Dress',        'dress',     'intermediate', 2, 'child bodice + gathered skirt'),
  ('egg-apron',          'Egg Gathering Apron',      'accessory', 'beginner',     2, '8-12 deep pockets, homesteading'),
  ('skort',              'Skort',                    'lower',     'intermediate', 2, 'skirt front + shorts back'),
  ('quilted-vest',       'Quilted Vest / Gilet',     'outerwear', 'intermediate', 2, 'gorpcore, puffer minus sleeves'),
  ('mom-me-bundle',      'Mom & Me Bundle',          'full-body', 'beginner',     2, 'adult + child matched garments')
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
