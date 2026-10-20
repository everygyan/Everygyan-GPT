-- ==============================================================================
-- EveryGyan — Newsletter Subsystem, Double Opt-in, Campaigns, and Send Logs
-- Migration: 20261020000002_newsletter_subsystem.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Extend Newsletter Subscribers with Consent & Double Opt-in Fields
-- ------------------------------------------------------------------------------
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS consent_source text NOT NULL DEFAULT 'website_cta',
  ADD COLUMN IF NOT EXISTS consent_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS confirmation_token text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_subscribers_confirmation_token ON public.newsletter_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON public.newsletter_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.newsletter_subscribers(status);

-- Update RLS on newsletter_subscribers to allow public unauthenticated confirm & unsubscribe
DROP POLICY IF EXISTS "Subscribers can confirm or unsubscribe via token" ON public.newsletter_subscribers;
CREATE POLICY "Subscribers can confirm or unsubscribe via token"
  ON public.newsletter_subscribers FOR UPDATE
  USING (
    public.current_user_is_editor_or_admin()
    OR confirmation_token IS NOT NULL
    OR unsubscribe_token IS NOT NULL
  )
  WITH CHECK (
    status IN ('confirmed', 'unsubscribed', 'pending_confirmation')
  );

-- ------------------------------------------------------------------------------
-- 2. Newsletter Campaigns Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  preheader text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipients_count integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.newsletter_campaigns(status);

DROP POLICY IF EXISTS "Only editors and admins can manage newsletter campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Only editors and admins can manage newsletter campaigns"
  ON public.newsletter_campaigns FOR ALL
  USING (public.current_user_is_editor_or_admin());

-- ------------------------------------------------------------------------------
-- 3. Newsletter Send Logs Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_send_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'retry')),
  error_message text,
  attempt_number integer NOT NULL DEFAULT 1,
  sent_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_send_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_send_logs_campaign ON public.newsletter_send_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_send_logs_recipient ON public.newsletter_send_logs(recipient_email);

DROP POLICY IF EXISTS "Only editors and admins can view newsletter send logs" ON public.newsletter_send_logs;
CREATE POLICY "Only editors and admins can view newsletter send logs"
  ON public.newsletter_send_logs FOR ALL
  USING (public.current_user_is_editor_or_admin());
