-- supabase/migrations/006_add_institution_type.sql
-- Adds institution_type column (יסודי / חטיבה / תיכון)

ALTER TABLE leads
  ADD COLUMN institution_type TEXT
    CHECK (institution_type IN ('elementary', 'middle', 'high'));
