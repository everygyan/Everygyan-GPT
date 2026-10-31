-- =============================================================
-- Rollback Migration: Remove Score & Tile Tracking from User Game Stats
-- Date: 2026-10-31
-- =============================================================

ALTER TABLE public.user_game_stats
  DROP COLUMN IF EXISTS best_score,
  DROP COLUMN IF EXISTS highest_tile;
