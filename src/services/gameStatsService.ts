import { supabase, isSupabaseConfigured } from './supabase';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  resetsCount: number;
  lastPlayedAt?: string;
}

const LOCAL_STORAGE_KEY = 'everygyan_chess_stats';

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  gamesDrawn: 0,
  resetsCount: 0,
};

function getLocalStats(): GameStats {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function saveLocalStats(stats: GameStats): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Retrieves the current user's chess statistics (from Supabase if authenticated, else localStorage)
 */
export async function getChessStats(userId?: string): Promise<GameStats> {
  const local = getLocalStats();

  if (!isSupabaseConfigured || !userId) {
    return local;
  }

  try {
    const { data, error } = await supabase
      .from('user_game_stats')
      .select('games_played, games_won, games_lost, games_drawn, resets_count, updated_at')
      .eq('user_id', userId)
      .eq('game_id', 'chess')
      .maybeSingle();

    if (error || !data) {
      return local;
    }

    const remoteStats: GameStats = {
      gamesPlayed: Number(data.games_played ?? 0),
      gamesWon: Number(data.games_won ?? 0),
      gamesLost: Number(data.games_lost ?? 0),
      gamesDrawn: Number(data.games_drawn ?? 0),
      resetsCount: Number(data.resets_count ?? 0),
      lastPlayedAt: data.updated_at ? String(data.updated_at) : undefined,
    };

    // Keep local in sync with remote
    saveLocalStats(remoteStats);
    return remoteStats;
  } catch (err) {
    console.warn('[gameStatsService] Failed to fetch remote stats, using local:', err);
    return local;
  }
}

/**
 * Records a completed game result (win, loss, or draw)
 */
export async function recordGameResult(
  result: 'win' | 'loss' | 'draw',
  userId?: string
): Promise<GameStats> {
  const current = getLocalStats();
  const updated: GameStats = {
    ...current,
    gamesPlayed: current.gamesPlayed + 1,
    gamesWon: result === 'win' ? current.gamesWon + 1 : current.gamesWon,
    gamesLost: result === 'loss' ? current.gamesLost + 1 : current.gamesLost,
    gamesDrawn: result === 'draw' ? current.gamesDrawn + 1 : current.gamesDrawn,
    lastPlayedAt: new Date().toISOString(),
  };

  saveLocalStats(updated);

  if (isSupabaseConfigured && userId) {
    try {
      await supabase.from('user_game_stats').upsert(
        {
          user_id: userId,
          game_id: 'chess',
          games_played: updated.gamesPlayed,
          games_won: updated.gamesWon,
          games_lost: updated.gamesLost,
          games_drawn: updated.gamesDrawn,
          resets_count: updated.resetsCount,
          updated_at: updated.lastPlayedAt,
        },
        { onConflict: 'user_id,game_id' }
      );
    } catch (err) {
      console.warn('[gameStatsService] Failed to upsert stats to Supabase:', err);
    }
  }

  return updated;
}

/**
 * Records a game reset (tracks how many times the user restarted/reset)
 */
export async function recordGameReset(userId?: string): Promise<GameStats> {
  const current = getLocalStats();
  const updated: GameStats = {
    ...current,
    resetsCount: current.resetsCount + 1,
    lastPlayedAt: new Date().toISOString(),
  };

  saveLocalStats(updated);

  if (isSupabaseConfigured && userId) {
    try {
      await supabase.from('user_game_stats').upsert(
        {
          user_id: userId,
          game_id: 'chess',
          games_played: updated.gamesPlayed,
          games_won: updated.gamesWon,
          games_lost: updated.gamesLost,
          games_drawn: updated.gamesDrawn,
          resets_count: updated.resetsCount,
          updated_at: updated.lastPlayedAt,
        },
        { onConflict: 'user_id,game_id' }
      );
    } catch (err) {
      console.warn('[gameStatsService] Failed to upsert reset count to Supabase:', err);
    }
  }

  return updated;
}

/**
 * Resets all user stats back to zero
 */
export async function resetAllStats(userId?: string): Promise<GameStats> {
  saveLocalStats(DEFAULT_STATS);

  if (isSupabaseConfigured && userId) {
    try {
      await supabase
        .from('user_game_stats')
        .delete()
        .eq('user_id', userId)
        .eq('game_id', 'chess');
    } catch (err) {
      console.warn('[gameStatsService] Failed to delete remote stats:', err);
    }
  }

  return { ...DEFAULT_STATS };
}
