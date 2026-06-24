-- Audit log for manual admin actions (add, update, delete)
CREATE TABLE IF NOT EXISTS audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action       text NOT NULL,       -- 'add' | 'update' | 'delete'
  profile_id   uuid,               -- null if profile was deleted
  profile_name text,
  performed_by text,
  metadata     jsonb,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON audit_log USING (true);
