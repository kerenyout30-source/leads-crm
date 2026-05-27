-- supabase/migrations/002_lead_activities.sql
CREATE TABLE lead_activities (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  lead_id    uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id),
  type       text NOT NULL
             CHECK (type IN ('status_change','note_added','field_updated','lead_created')),
  payload    jsonb NOT NULL DEFAULT '{}'
);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own activities" ON lead_activities
  FOR ALL USING (
    auth.uid() = user_id
  );
