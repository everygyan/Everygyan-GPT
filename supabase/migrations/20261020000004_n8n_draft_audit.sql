-- ==============================================================================
-- EveryGyan Migration: Ingest Audit Logs & Webhook Idempotency Subsystem
-- File: 20261020000004_n8n_draft_audit.sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  idempotency_key text UNIQUE,
  actor text NOT NULL DEFAULT 'n8n_integration',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security Policy: Strictly Admins and Editors can view audit entries
DROP POLICY IF EXISTS "Admins and editors can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins and editors can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.current_user_is_editor_or_admin());

-- Performance & Idempotency indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_idempotency ON public.audit_logs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
