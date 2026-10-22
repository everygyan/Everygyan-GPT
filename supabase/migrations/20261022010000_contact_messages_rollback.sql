-- ==============================================================================
-- EveryGyan — Rollback for Migration 20261022010000_contact_messages.sql
-- Description: Drops public.contact_messages table and associated policies.
-- ==============================================================================

DROP TABLE IF EXISTS public.contact_messages CASCADE;
