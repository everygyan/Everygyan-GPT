-- ==============================================================================
-- Rollback Migration: 20261030000000_about_page_and_editorial_team_rollback.sql
-- Description: Reverts dynamic About Us page content & Editorial Team tables
-- ==============================================================================

DROP TABLE IF EXISTS public.editorial_team CASCADE;
DROP TABLE IF EXISTS public.about_page_content CASCADE;
