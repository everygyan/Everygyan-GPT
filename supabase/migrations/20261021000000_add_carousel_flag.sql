-- ==============================================================================
-- EveryGyan Migration: Add Carousel Flag for Homepage Hero Carousel
-- Migration: 20261021000000_add_carousel_flag.sql
-- ==============================================================================

-- 1. Add is_carousel column to public.articles
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS is_carousel boolean NOT NULL DEFAULT false;

-- 2. Create index for fast carousel querying
CREATE INDEX IF NOT EXISTS idx_articles_is_carousel ON public.articles(is_carousel);

-- 3. Seed initial published articles into carousel
UPDATE public.articles
SET is_carousel = true
WHERE is_lead_story = true OR is_featured = true;
