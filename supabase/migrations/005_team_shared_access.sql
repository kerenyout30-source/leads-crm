-- supabase/migrations/005_team_shared_access.sql
-- Changes RLS from "user sees own leads" to "all authenticated users see all leads"
-- This makes the CRM a team-shared system instead of per-user isolation.
-- The 'user_id' column is preserved (records who created the lead/activity)
-- but is no longer used to restrict visibility.

-- Drop old per-user policies
DROP POLICY IF EXISTS "Users see own leads" ON leads;
DROP POLICY IF EXISTS "Users see own activities" ON lead_activities;

-- New: any authenticated user can read/write any lead
CREATE POLICY "Team members access all leads" ON leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- New: any authenticated user can read/write any activity
CREATE POLICY "Team members access all activities" ON lead_activities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
