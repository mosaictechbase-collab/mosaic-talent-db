-- ============================================================
-- Mosaic Talent Network — initial schema
-- Run this in the Supabase SQL editor or via: supabase db push
-- ============================================================

-- import_batches (referenced by profiles)
CREATE TABLE IF NOT EXISTS import_batches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename        text,
  imported_at     timestamptz DEFAULT now(),
  row_count       int DEFAULT 0,
  inserted_count  int DEFAULT 0,
  updated_count   int DEFAULT 0,
  dupes_skipped   int DEFAULT 0,
  imported_by     text
);

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            text,
  full_name        text NOT NULL,
  graduation_year  int,
  college          text,
  major            text,
  location         text,
  organizations    text[] DEFAULT '{}',
  roles            text[] DEFAULT '{}',
  skills           text[] DEFAULT '{}',
  interests        text[] DEFAULT '{}',
  linkedin_url     text,
  website_url      text,
  bio              text,
  is_active        boolean DEFAULT true,
  import_batch_id  uuid REFERENCES import_batches(id) ON DELETE SET NULL,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  search_vector    tsvector
);

-- search_log
CREATE TABLE IF NOT EXISTS search_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query        text,
  filters      jsonb,
  result_count int,
  searched_at  timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email
  ON profiles(email) WHERE email IS NOT NULL AND email != '';

CREATE INDEX IF NOT EXISTS idx_profiles_search_vector
  ON profiles USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_profiles_grad_year
  ON profiles(graduation_year);

CREATE INDEX IF NOT EXISTS idx_profiles_orgs
  ON profiles USING GIN(organizations);

CREATE INDEX IF NOT EXISTS idx_profiles_skills
  ON profiles USING GIN(skills);

CREATE INDEX IF NOT EXISTS idx_profiles_interests
  ON profiles USING GIN(interests);

CREATE INDEX IF NOT EXISTS idx_profiles_roles
  ON profiles USING GIN(roles);

-- ============================================================
-- FTS trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.bio, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.major, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.skills, ' '), '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.interests, ' '), '')), 'D') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.organizations, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_search_vector ON profiles;
CREATE TRIGGER trg_search_vector
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_updated_at ON profiles;
CREATE TRIGGER trg_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_log ENABLE ROW LEVEL SECURITY;

-- Public can read profiles
CREATE POLICY "public_read_profiles"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- All writes go through service role key (server actions only).
-- No authenticated-user write policy — service role bypasses RLS.
