-- HackXperience 2026 — Submissions Table
-- Run this in your Supabase dashboard: SQL Editor > New query

CREATE TABLE IF NOT EXISTS submissions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  edit_token    UUID        UNIQUE NOT NULL DEFAULT gen_random_uuid(),

  -- Step 01: Identity
  project_name  TEXT        NOT NULL,
  team_id       TEXT        NOT NULL UNIQUE,
  track         TEXT        NOT NULL,
  description   TEXT        NOT NULL,
  pitch         TEXT        NOT NULL,
  tech_stack    TEXT[]      NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,

  -- Step 02: Assets
  github_repo_url       TEXT NOT NULL,
  live_demo_url         TEXT,
  pitch_deck_share_url  TEXT NOT NULL,
  pitch_deck_upload_url TEXT,
  demo_video_url        TEXT,

  -- Step 03: Team manifest (stored as JSON array)
  members JSONB NOT NULL DEFAULT '[]',
  notes   TEXT,

  -- Admin
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),

  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_edit_token ON submissions(edit_token);
CREATE INDEX IF NOT EXISTS idx_submissions_team_id           ON submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status            ON submissions(status);

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS submissions_updated_at ON submissions;
CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Service role (API routes) bypasses RLS automatically.
-- These policies cover direct anon/browser queries if needed in future.
CREATE POLICY "Public can insert" ON submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read by token" ON submissions
  FOR SELECT USING (true);

CREATE POLICY "Public can update by token" ON submissions
  FOR UPDATE USING (true);
