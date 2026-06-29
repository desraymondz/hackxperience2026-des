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

-- The base table is server-only. All create/read/update of full submission rows
-- goes through the API routes (app/api/submissions/*), which use the
-- service-role key and bypass RLS. With NO policies for the anon/authenticated
-- roles, RLS denies them by default — so the public anon key (shipped in the
-- browser) can never read member emails, edit tokens, notes, or pending/rejected
-- rows directly. Storage uploads use separate Storage bucket policies.
--
-- Drop the previous permissive policies in case an older version of this schema
-- was already applied (they granted anon full SELECT/UPDATE over every row).
DROP POLICY IF EXISTS "Public can insert"          ON submissions;
DROP POLICY IF EXISTS "Public can read by token"   ON submissions;
DROP POLICY IF EXISTS "Public can update by token" ON submissions;

-- Public gallery feed: a safe projection of APPROVED submissions only, with no
-- PII (no members, edit_token, notes, or pitch decks). The gallery page reads
-- this view with the anon key instead of the base table.
--
-- The view runs with its owner's privileges (it is NOT security_invoker), so it
-- can read the base table even though anon has no direct access to it.
CREATE OR REPLACE VIEW public_projects AS
  SELECT
    id,
    project_name,
    description,
    pitch,
    tech_stack,
    thumbnail_url,
    github_repo_url,
    live_demo_url,
    demo_video_url,
    team_id,
    submitted_at
  FROM submissions
  WHERE status = 'APPROVED';

GRANT SELECT ON public_projects TO anon, authenticated;
