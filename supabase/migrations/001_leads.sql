-- supabase/migrations/001_leads.sql
CREATE TABLE leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text NOT NULL,
  phone       text,
  email       text,
  role_title  text,
  organization text,
  status      text NOT NULL DEFAULT 'new'
              CHECK (status IN ('new','in_progress','details_sent','closed','not_relevant')),
  source      text
              CHECK (source IN ('facebook','referral','outbound','whatsapp','other')),
  notes       text,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own leads" ON leads
  FOR ALL USING (auth.uid() = user_id);
