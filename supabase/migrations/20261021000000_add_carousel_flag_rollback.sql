-- ==============================================================================
-- EveryGyan Rollback: Remove Carousel Flag
-- Rollback for: 20261021000000_add_carousel_flag.sql
-- ==============================================================================

DROP INDEX IF EXISTS public.idx_articles_is_carousel;

ALTER TABLE public.articles
  DROP COLUMN IF EXISTS is_carousel;
