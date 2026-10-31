-- =============================================================
-- Migration: Add Score & Tile Tracking to User Game Stats
-- Date: 2026-10-31
-- Description: Adds best_score and highest_tile columns for
--   high-score puzzle games like 2048.
-- =============================================================

ALTER TABLE public.user_game_stats
  ADD COLUMN IF NOT EXISTS best_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS highest_tile integer NOT NULL DEFAULT 0;
