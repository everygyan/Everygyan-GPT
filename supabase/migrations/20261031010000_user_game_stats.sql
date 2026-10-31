-- =============================================================
-- Migration: User Game Statistics
-- Date: 2026-10-31
-- Description: Tracks online game statistics per user (played,
--   won, lost, drawn, resets) with Row Level Security.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.user_game_stats (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id       text        NOT NULL DEFAULT 'chess',
  games_played  integer     NOT NULL DEFAULT 0,
  games_won     integer     NOT NULL DEFAULT 0,
  games_lost    integer     NOT NULL DEFAULT 0,
  games_drawn   integer     NOT NULL DEFAULT 0,
  resets_count  integer     NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  CONSTRAINT user_game_unique UNIQUE(user_id, game_id)
);

-- Enable RLS
ALTER TABLE public.user_game_stats ENABLE ROW LEVEL SECURITY;

-- Policies: users can view and update only their own stats
CREATE POLICY "Users can read own game stats"
  ON public.user_game_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game stats"
  ON public.user_game_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game stats"
  ON public.user_game_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own game stats"
  ON public.user_game_stats FOR DELETE
  USING (auth.uid() = user_id);
