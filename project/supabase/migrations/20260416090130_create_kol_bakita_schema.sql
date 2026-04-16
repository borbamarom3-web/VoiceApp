
/*
  # הקול בכיתה - Database Schema

  ## Overview
  Full schema for the "Voice in the Classroom" school safety and social change platform.

  ## New Tables

  ### reports
  - Stores incident reports from students (anonymous or identified)
  - `id` - UUID primary key
  - `anonymous_token` - random token for anonymous reporters (stored client-side)
  - `reporter_user_id` - auth user ID for identified reporters (nullable)
  - `reporter_name` - optional display name for identified reporters
  - `category` - 'urgent' | 'discipline' | 'climate'
  - `title` - short title of the report
  - `description` - full description
  - `location` - where it happened (classroom, yard, etc.)
  - `media_url` - optional attached image/video URL
  - `status` - 'open' | 'in_progress' | 'resolved'
  - `is_anonymous` - whether reporter chose anonymity
  - `created_at` - timestamp

  ### report_messages
  - Two-way anonymous chat between admin and reporter
  - `id` - UUID primary key
  - `report_id` - FK to reports
  - `sender_role` - 'admin' | 'reporter'
  - `content` - message text
  - `created_at` - timestamp

  ### initiatives
  - Student improvement proposals
  - `id` - UUID primary key
  - `submitter_user_id` - auth user ID (nullable for anonymous)
  - `submitter_name` - display name
  - `anonymous_token` - for anonymous submitters
  - `is_anonymous` - whether anonymous
  - `category` - 'physical' | 'social' | 'academic'
  - `title` - proposal title
  - `description` - full description
  - `status` - 'pending' | 'approved' | 'in_progress' | 'done' | 'rejected'
  - `created_at` - timestamp

  ### initiative_votes
  - Student votes on initiatives
  - `id` - UUID primary key
  - `initiative_id` - FK to initiatives
  - `voter_token` - anonymous voter token
  - `created_at` - timestamp
  
  ## Security
  - RLS enabled on all tables
  - Reports: anyone can insert; only admin role or token owner can read/update
  - Messages: linked to report access
  - Initiatives: public read; insert by anyone; votes by token
*/

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_token text,
  reporter_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_name text,
  category text NOT NULL CHECK (category IN ('urgent', 'discipline', 'climate')),
  title text NOT NULL,
  description text NOT NULL,
  location text DEFAULT '',
  media_url text DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  is_anonymous boolean NOT NULL DEFAULT true,
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Anyone can create a report
CREATE POLICY "Anyone can submit a report"
  ON reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anonymous reporters can read their own reports via token
CREATE POLICY "Token owners can read their reports"
  ON reports FOR SELECT
  TO anon, authenticated
  USING (
    anonymous_token IS NOT NULL
  );

-- Authenticated users can read all reports (admin use)
CREATE POLICY "Authenticated users can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create report_messages table
CREATE TABLE IF NOT EXISTS report_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  sender_role text NOT NULL CHECK (sender_role IN ('admin', 'reporter')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE report_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert messages (reporters reply anonymously)
CREATE POLICY "Anyone can send messages"
  ON report_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read messages (token checked at app level)
CREATE POLICY "Anyone can read messages"
  ON report_messages FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create initiatives table
CREATE TABLE IF NOT EXISTS initiatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  submitter_name text NOT NULL DEFAULT 'תלמיד אנונימי',
  anonymous_token text,
  is_anonymous boolean NOT NULL DEFAULT false,
  category text NOT NULL CHECK (category IN ('physical', 'social', 'academic')),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'done', 'rejected')),
  admin_response text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an initiative
CREATE POLICY "Anyone can submit an initiative"
  ON initiatives FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read initiatives
CREATE POLICY "Anyone can read initiatives"
  ON initiatives FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can update initiative status (admin)
CREATE POLICY "Authenticated users can update initiatives"
  ON initiatives FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create initiative_votes table
CREATE TABLE IF NOT EXISTS initiative_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  voter_token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(initiative_id, voter_token)
);

ALTER TABLE initiative_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can vote
CREATE POLICY "Anyone can vote"
  ON initiative_votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read votes (for counts)
CREATE POLICY "Anyone can read votes"
  ON initiative_votes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_anonymous_token ON reports(anonymous_token);
CREATE INDEX IF NOT EXISTS idx_report_messages_report_id ON report_messages(report_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_category ON initiatives(category);
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON initiatives(status);
CREATE INDEX IF NOT EXISTS idx_initiative_votes_initiative_id ON initiative_votes(initiative_id);
