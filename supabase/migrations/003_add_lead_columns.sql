-- supabase/migrations/003_add_lead_columns.sql
-- Adds: city, assigned_rep, interest_level, follow_up_date, institution_size

ALTER TABLE leads
  ADD COLUMN city TEXT,
  ADD COLUMN assigned_rep TEXT,
  ADD COLUMN interest_level TEXT
    CHECK (interest_level IN ('high','medium','low')),
  ADD COLUMN follow_up_date DATE,
  ADD COLUMN institution_size INTEGER;

CREATE INDEX leads_follow_up_date_idx ON leads (follow_up_date)
  WHERE follow_up_date IS NOT NULL;
