-- supabase/migrations/004_add_field_agent_source.sql
-- Adds 'field_agent' (סוכנת שטח) to the allowed source values

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_source_check;

ALTER TABLE leads ADD CONSTRAINT leads_source_check
  CHECK (source IS NULL OR source IN ('facebook','referral','outbound','whatsapp','field_agent','other'));
