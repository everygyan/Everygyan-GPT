-- ==============================================================================
-- EveryGyan Rollback Migration for 20261020000003_content_templates.sql
-- Description: Reverts template_type and template_data extensions on articles.
-- ==============================================================================

DROP INDEX IF EXISTS public.idx_articles_template_type;

ALTER TABLE public.articles
  DROP COLUMN IF EXISTS template_type,
  DROP COLUMN IF EXISTS template_data;
