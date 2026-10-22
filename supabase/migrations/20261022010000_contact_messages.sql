-- ==============================================================================
-- EveryGyan — Contact Messages Table and RLS Policies
-- Migration: 20261022010000_contact_messages.sql
-- Description: Stores inquiries sent via the public /contact form and protects
--              them with strict RLS so only authenticated editors and administrators
--              can view and reply. Public visitors can insert messages only.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  admin_notes text,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 1. Public visitors (anonymous or authenticated) can submit a contact message
DROP POLICY IF EXISTS "Public visitors can insert contact messages" ON public.contact_messages;
CREATE POLICY "Public visitors can insert contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    char_length(trim(name)) >= 2 AND char_length(name) <= 100 AND
    char_length(trim(email)) >= 5 AND char_length(email) <= 255 AND
    char_length(trim(subject)) >= 2 AND char_length(subject) <= 200 AND
    char_length(trim(message)) >= 5 AND char_length(message) <= 5000
  );

-- 2. Only editors and admins can read contact messages (strictly keeps messages private)
DROP POLICY IF EXISTS "Only editors and admins can read contact messages" ON public.contact_messages;
CREATE POLICY "Only editors and admins can read contact messages"
  ON public.contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')
    )
  );

-- 3. Only editors and admins can update message status (read, replied, archived)
DROP POLICY IF EXISTS "Only editors and admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Only editors and admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('editor', 'admin')
    )
  );

-- 4. Only admins can delete contact messages
DROP POLICY IF EXISTS "Only admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Only admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Performance Index for status filtering and newest messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created 
  ON public.contact_messages(status, created_at DESC);

-- ==============================================================================
-- End of Migration: 20261022010000_contact_messages.sql
-- ==============================================================================
