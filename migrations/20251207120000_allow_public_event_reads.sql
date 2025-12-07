-- Migration: Allow public read-only access to events and related tables
-- Runs:
-- 1) Creates RLS policies that permit SELECT for all roles on events, pools, participants
-- 2) Creates a permissive SELECT policy on users and grants the anon role access to safe columns
-- IMPORTANT: Run this in the Supabase SQL editor. Do NOT expose your service_role key.

-- 1) Public SELECT on events
DROP POLICY IF EXISTS "Public can view events" ON public.events;
CREATE POLICY "Public can view events" ON public.events
  FOR SELECT
  USING (true);

-- 2) Public SELECT on event_pools
DROP POLICY IF EXISTS "Public can view event_pools" ON public.event_pools;
CREATE POLICY "Public can view event_pools" ON public.event_pools
  FOR SELECT
  USING (true);

-- 3) Public SELECT on event_participants
DROP POLICY IF EXISTS "Public can view event_participants" ON public.event_participants;
CREATE POLICY "Public can view event_participants" ON public.event_participants
  FOR SELECT
  USING (true);

-- 4) Allow public (anon) to read minimal users columns used in joins
DROP POLICY IF EXISTS "Public can view users" ON public.users;
CREATE POLICY "Public can view users" ON public.users
  FOR SELECT
  USING (true);

-- Grant anon role SELECT only on safe user columns (adjust columns as needed)
-- Replace or extend the column list below with the exact columns your app needs (e.g. id, username, avatar_url)
GRANT SELECT (id, username, avatar_url) ON public.users TO anon;

-- Optionally ensure anon can SELECT the events tables as well (grants are useful when RLS is disabled)
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.event_pools TO anon;
GRANT SELECT ON public.event_participants TO anon;

-- End of migration
