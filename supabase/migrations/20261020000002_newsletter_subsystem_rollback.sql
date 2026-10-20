-- ==============================================================================
-- EveryGyan Rollback Migration for 20261020000002_newsletter_subsystem.sql
-- Description: Reverts newsletter campaigns, send logs, and subscriber token columns.
-- ==============================================================================

-- 1. Drop Newsletter Send Logs & Campaigns Tables
DROP TABLE IF EXISTS public.newsletter_send_logs CASCADE;
DROP TABLE IF EXISTS public.newsletter_campaigns CASCADE;

-- 2. Drop Helper Functions
DROP FUNCTION IF EXISTS public.record_newsletter_send(uuid, uuid, text, text, text);

-- 3. Revert Subscriber Tokens & Consent Columns
DROP INDEX IF EXISTS public.idx_subscribers_confirmation_token;
DROP INDEX IF EXISTS public.idx_subscribers_unsubscribe_token;
DROP INDEX IF EXISTS public.idx_subscribers_status;

ALTER TABLE public.newsletter_subscribers
  DROP COLUMN IF EXISTS confirmation_token,
  DROP COLUMN IF EXISTS consent_source,
  DROP COLUMN IF EXISTS consent_at;

-- 4. Revert Subscriber RLS Policy
DROP POLICY IF EXISTS "Subscribers can confirm or unsubscribe via token" ON public.newsletter_subscribers;
CREATE POLICY "Subscribers can unsubscribe via token"
  ON public.newsletter_subscribers FOR UPDATE
  USING (
    public.current_user_is_editor_or_admin()
    OR unsubscribe_token IS NOT NULL
  )
  WITH CHECK (status = 'unsubscribed');
