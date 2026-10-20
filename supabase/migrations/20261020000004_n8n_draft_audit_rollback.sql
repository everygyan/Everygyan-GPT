-- ==============================================================================
-- EveryGyan Rollback Migration for 20261020000004_n8n_draft_audit.sql
-- Description: Reverts audit_logs table and associated indexes.
-- ==============================================================================

DROP TABLE IF EXISTS public.audit_logs CASCADE;
