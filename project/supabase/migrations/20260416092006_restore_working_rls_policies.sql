
/*
  # Restore working RLS policies (no anonymous auth required)

  ## Summary
  Reverts to a token-based approach that works without Supabase anonymous auth.
  Students use a random token stored in localStorage to identify their reports.
  Admin users authenticate with email/password.

  ## Changes
  - Drop all previous policies
  - Re-create policies that allow unauthenticated (anon role) access for students
  - Admin operations require authenticated role (email/password login)
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can submit a report" ON reports;
DROP POLICY IF EXISTS "Users can read own reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON report_messages;
DROP POLICY IF EXISTS "Users can read messages for their reports" ON report_messages;
DROP POLICY IF EXISTS "Authenticated users can submit an initiative" ON initiatives;
DROP POLICY IF EXISTS "Authenticated users can read initiatives" ON initiatives;
DROP POLICY IF EXISTS "Admins can update initiatives" ON initiatives;
DROP POLICY IF EXISTS "Authenticated users can vote" ON initiative_votes;
DROP POLICY IF EXISTS "Authenticated users can read votes" ON initiative_votes;

-- ============================================================
-- REPORTS
-- ============================================================

-- Anyone (students without login) can submit reports
CREATE POLICY "Anyone can submit a report"
  ON reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated admins can read all reports
-- Anonymous students can read only via token match (filtered client-side, RLS allows anon read)
CREATE POLICY "Authenticated users can read all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (true);

-- Allow anon users to read reports (token filtering happens client-side)
CREATE POLICY "Anon users can read reports by token"
  ON reports FOR SELECT
  TO anon
  USING (anonymous_token IS NOT NULL);

-- Only authenticated admins can update reports
CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- ============================================================
-- REPORT_MESSAGES
-- ============================================================

-- Anyone can send messages (reporters reply anonymously)
CREATE POLICY "Anyone can send messages"
  ON report_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read messages (token checked client-side)
CREATE POLICY "Anyone can read messages"
  ON report_messages FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- INITIATIVES
-- ============================================================

-- Anyone can submit an initiative
CREATE POLICY "Anyone can submit an initiative"
  ON initiatives FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read initiatives (they are public by design)
CREATE POLICY "Anyone can read initiatives"
  ON initiatives FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can update initiative status/response
CREATE POLICY "Admins can update initiatives"
  ON initiatives FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- ============================================================
-- INITIATIVE_VOTES
-- ============================================================

-- Anyone can vote
CREATE POLICY "Anyone can vote"
  ON initiative_votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read vote counts
CREATE POLICY "Anyone can read votes"
  ON initiative_votes FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- ADMIN_USERS - allow admins to check their own status
-- ============================================================
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;

CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);
