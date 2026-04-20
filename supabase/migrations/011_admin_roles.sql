-- Replaces hardcoded admin email in RLS policies with a table-driven check.
-- MANUAL STEP: After running this migration, insert the admin email via
-- the Supabase dashboard SQL editor (NOT in code):
--   INSERT INTO admin_roles (email) VALUES ('your-admin@example.com');

-- ── admin_roles table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_roles (
  email text PRIMARY KEY
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admin_roles table (bootstrapped via service role)
CREATE POLICY admin_roles_select ON admin_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_roles ar WHERE ar.email = auth.jwt() ->> 'email')
  );

-- ── Helper: is current JWT an admin? ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_roles WHERE email = auth.jwt() ->> 'email'
  );
$$;

-- ── garment_catalog: replace hardcoded-email policies ────────────────────────

DROP POLICY IF EXISTS admin_select_garment_catalog ON garment_catalog;
DROP POLICY IF EXISTS admin_insert_garment_catalog ON garment_catalog;
DROP POLICY IF EXISTS admin_update_garment_catalog ON garment_catalog;
DROP POLICY IF EXISTS admin_delete_garment_catalog ON garment_catalog;

CREATE POLICY admin_select_garment_catalog ON garment_catalog
  FOR SELECT USING (is_admin());
CREATE POLICY admin_insert_garment_catalog ON garment_catalog
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY admin_update_garment_catalog ON garment_catalog
  FOR UPDATE USING (is_admin());
CREATE POLICY admin_delete_garment_catalog ON garment_catalog
  FOR DELETE USING (is_admin());

-- ── garment_photos: replace hardcoded-email policies ─────────────────────────

DROP POLICY IF EXISTS admin_select_garment_photos ON garment_photos;
DROP POLICY IF EXISTS admin_insert_garment_photos ON garment_photos;
DROP POLICY IF EXISTS admin_update_garment_photos ON garment_photos;
DROP POLICY IF EXISTS admin_delete_garment_photos ON garment_photos;

CREATE POLICY admin_select_garment_photos ON garment_photos
  FOR SELECT USING (is_admin());
CREATE POLICY admin_insert_garment_photos ON garment_photos
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY admin_update_garment_photos ON garment_photos
  FOR UPDATE USING (is_admin());
CREATE POLICY admin_delete_garment_photos ON garment_photos
  FOR DELETE USING (is_admin());

-- ── Cross-table admin read policies: replace hardcoded-email versions ─────────

DROP POLICY IF EXISTS admin_read_purchases ON purchases;
CREATE POLICY admin_read_purchases ON purchases
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS admin_read_profiles ON profiles;
CREATE POLICY admin_read_profiles ON profiles
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS admin_read_wishlist ON wishlist;
CREATE POLICY admin_read_wishlist ON wishlist
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS admin_read_newsletter ON newsletter;
CREATE POLICY admin_read_newsletter ON newsletter
  FOR SELECT USING (is_admin());
