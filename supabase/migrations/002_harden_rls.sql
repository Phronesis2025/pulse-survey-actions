-- 002: Harden Row Level Security
--
-- Replaces the allow-all policies from 001_initial_schema.sql with the
-- minimal grants the app actually needs for anonymous callers:
--
--   * every table:  SELECT for anon (all reads are public)
--   * action_items: INSERT for anon (the public submit form)
--   * everything else (UPDATE/DELETE anywhere, INSERT on lookup tables):
--     NO anon policy — RLS denies by default
--
-- Admin mutations go through API routes that use the service_role key,
-- which bypasses RLS entirely, so no policies are needed for them.
--
-- Run this in the Supabase SQL Editor.

-- Drop the allow-all policies created in 001
DROP POLICY IF EXISTS "Enable all operations for all users" ON sites;
DROP POLICY IF EXISTS "Enable all operations for all users" ON categories;
DROP POLICY IF EXISTS "Enable all operations for all users" ON sub_categories;
DROP POLICY IF EXISTS "Enable all operations for all users" ON statuses;
DROP POLICY IF EXISTS "Enable all operations for all users" ON action_items;

-- Public read access on all five tables
CREATE POLICY "Anon can read sites"          ON sites          FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read categories"     ON categories     FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read sub_categories" ON sub_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read statuses"       ON statuses       FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can read action_items"   ON action_items   FOR SELECT TO anon USING (true);

-- Public submissions: anon may INSERT action items only.
-- (The INSERT ... RETURNING used by the API also needs the SELECT policy
-- above, which is already in place.)
CREATE POLICY "Anon can insert action_items" ON action_items FOR INSERT TO anon WITH CHECK (true);

-- No UPDATE or DELETE policies for anon on any table, and no INSERT on the
-- lookup tables (sites, categories, sub_categories, statuses): with RLS
-- enabled and no matching policy, PostgreSQL denies those operations.
