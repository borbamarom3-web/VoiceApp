
/*
  # Fix RLS Security Policies

  ## Summary
  Replaces all overly-permissive `USING (true)` / `WITH CHECK (true)` policies
  with proper auth-based policies using Supabase anonymous authentication.

  ## Changes

  ### New Table: admin_users
  - Tracks which auth users have admin privileges
  - Only accessible by authenticated users

  ### Updated Policies

  #### reports
  - INSERT: any authenticated user (includes anonymous auth sessions)
  - SELECT: own reports (reporter_user_id = auth.uid()) OR admin
  - UPDATE: admin only

  #### report_messages
  - INSERT: any authenticated user
  - SELECT: messages for reports owned by the user OR admin

  #### initiatives
  - INSERT: any authenticated user
  - SELECT: any authenticated user (initiatives are public within the app)
  - UPDATE: admin only

  #### initiative_votes
  - INSERT: authenticated user, one vote per initiative per user
  - SELECT: any authenticated user (vote counts are public)

  ## Notes
  - Anonymous auth must be enabled in Supabase Authentication settings
  - All users (including anonymous) have auth.uid() available
  - Admin status is stored in admin_users table
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid()
    )
  );

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
$$;

-- ============================================================
-- REPORTS policies — drop old, create new
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit a report" ON reports;
DROP POLICY IF EXISTS "Token owners can read their reports" ON reports;
DROP POLICY IF EXISTS "Authenticated users can update reports" ON reports;

CREATE POLICY "Authenticated users can submit a report"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can read own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_user_id
    OR is_admin()
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- REPORT_MESSAGES policies — drop old, create new
-- ============================================================
DROP POLICY IF EXISTS "Anyone can send messages" ON report_messages;
DROP POLICY IF EXISTS "Anyone can read messages" ON report_messages;

CREATE POLICY "Authenticated users can send messages"
  ON report_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_id
        AND (r.reporter_user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can read messages for their reports"
  ON report_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_id
        AND (r.reporter_user_id = auth.uid() OR is_admin())
    )
  );

-- ============================================================
-- INITIATIVES policies — drop old, create new
-- ============================================================
DROP POLICY IF EXISTS "Anyone can submit an initiative" ON initiatives;
DROP POLICY IF EXISTS "Anyone can read initiatives" ON initiatives;
DROP POLICY IF EXISTS "Authenticated users can update initiatives" ON initiatives;

CREATE POLICY "Authenticated users can submit an initiative"
  ON initiatives FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitter_user_id);

CREATE POLICY "Authenticated users can read initiatives"
  ON initiatives FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update initiatives"
  ON initiatives FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- INITIATIVE_VOTES policies — drop old, create new
-- ============================================================
DROP POLICY IF EXISTS "Anyone can vote" ON initiative_votes;
DROP POLICY IF EXISTS "Anyone can read votes" ON initiative_votes;

CREATE POLICY "Authenticated users can vote"
  ON initiative_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = voter_token);

CREATE POLICY "Authenticated users can read votes"
  ON initiative_votes FOR SELECT
  TO authenticated
  USING (true);
