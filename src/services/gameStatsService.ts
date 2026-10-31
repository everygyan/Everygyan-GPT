import { supabase, isSupabaseConfigured } from './supabase';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  resetsCount: number;
  bestScore?: number;
  highestTile?: number;
  lastPlayedAt?: string;
}

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  gamesDrawn: 0,
  resetsCount: 0,
  bestScore: 0,
  highestTile: 0,
};

function getStorageKey(gameId: string): string {
  return `everygyan_${gameId}_stats`;
}

function getLocalStats(gameId = 'chess'): GameStats {
  try {
    const raw = localStorage.getItem(getStorageKey(gameId));
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function saveLocalStats(stats: GameStats, gameId = 'chess'): void {
  try {
    localStorage.setItem(getStorageKey(gameId), JSON.stringify(stats));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Retrieves the current user's statistics for any game (from Supabase if authenticated, else localStorage)
 */
export async function getGameStats(gameId: string, userId?: string): Promise<GameStats> {
  const local = getLocalStats(gameId);

  if (!isSupabaseConfigured || !userId) {
    return local;
  }

  try {
    const { data, error } = await supabase
      .from('user_game_stats')
      .select('games_played, games_won, games_lost, games_drawn, resets_count, best_score, highest_tile, updated_at')
      .eq('user_id', userId)
      .eq('game_id', gameId)
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
      bestScore: Math.max(Number(data.best_score ?? 0), local.bestScore ?? 0),
      highestTile: Math.max(Number(data.highest_tile ?? 0), local.highestTile ?? 0),
      lastPlayedAt: data.updated_at ? String(data.updated_at) : undefined,
    };

    saveLocalStats(remoteStats, gameId);
    return remoteStats;
  } catch (err) {
    console.warn(`[gameStatsService] Failed to fetch remote stats for ${gameId}, using local:`, err);
    return local;
  }
}

/**
 * Shortcut for Chess stats
 */
export async function getChessStats(userId?: string): Promise<GameStats> {
  return getGameStats('chess', userId);
}

/**
 * Shortcut for 2048 stats
 */
export async function get2048Stats(userId?: string): Promise<GameStats> {
  return getGameStats('2048', userId);
}

/**
 * Records a completed game result (win, loss, or draw)
 */
export async function recordGameResult(
  result: 'win' | 'loss' | 'draw',
  userId?: string,
  gameId = 'chess'
): Promise<GameStats> {
  const current = getLocalStats(gameId);
  const updated: GameStats = {
    ...current,
    gamesPlayed: current.gamesPlayed + 1,
    gamesWon: result === 'win' ? current.gamesWon + 1 : current.gamesWon,
    gamesLost: result === 'loss' ? current.gamesLost + 1 : current.gamesLost,
    gamesDrawn: result === 'draw' ? current.gamesDrawn + 1 : current.gamesDrawn,
    lastPlayedAt: new Date().toISOString(),
  };

  saveLocalStats(updated, gameId);

  if (isSupabaseConfigured && userId) {
    try {
      await supabase.from('user_game_stats').upsert(
        {
          user_id: userId,
          game_id: gameId,
          games_played: updated.gamesPlayed,
          games_won: updated.gamesWon,
          games_lost: updated.gamesLost,
          games_drawn: updated.gamesDrawn,
          resets_count: updated.resetsCount,
          best_score: updated.bestScore ?? 0,
          highest_tile: updated.highestTile ?? 0,
          updated_at: updated.lastPlayedAt,
        },
        { onConflict: 'user_id,game_id' }
      );
    } catch (err) {
      console.warn(`[gameStatsService] Failed to upsert stats for ${gameId} to Supabase:`, err);
    }
  }

  return updated;
}

/**
 * Records score, high score, and tile progression for 2048
 */
export async function record2048Score(
  payload: {
    score: number;
    highestTile: number;
    isWin?: boolean;
    isGameOver?: boolean;
  },
  userId?: string
): Promise<GameStats> {
  const current = getLocalStats('2048');
  const bestScore = Math.max(current.bestScore ?? 0, payload.score);
  const highestTile = Math.max(current.highestTile ?? 0, payload.highestTile);

  const updated: GameStats = {
    ...current,
    gamesPlayed: payload.isGameOver || payload.isWin ? current.gamesPlayed + 1 : current.gamesPlayed,
    gamesWon: payload.isWin ? current.gamesWon + 1 : current.gamesWon,
    gamesLost: payload.isGameOver && !payload.isWin ? current.gamesLost + 1 : current.gamesLost,
    bestScore,
    highestTile,
    lastPlayedAt: new Date().toISOString(),
  };

  saveLocalStats(updated, '2048');

  if (isSupabaseConfigured && userId) {
    try {
      await supabase.from('user_game_stats').upsert(
        {
          user_id: userId,
          game_id: '2048',
          games_played: updated.gamesPlayed,
          games_won: updated.gamesWon,
          games_lost: updated.gamesLost,
          games_drawn: updated.gamesDrawn,
          resets_count: updated.resetsCount,
          best_score: updated.bestScore,
          highest_tile: updated.highestTile,
          updated_at: updated.lastPlayedAt,
        },
        { onConflict: 'user_id,game_id' }
      );
    } catch (err) {
      console.warn('[gameStatsService] Failed to upsert 2048 stats to Supabase:', err);
    }
  }

  return updated;
}

/**
 * Records a game reset (tracks how many times the user restarted/reset)
 */
export async function recordGameReset(userId?: string, gameId = 'chess'): Promise<GameStats> {
  const current = getLocalStats(gameId);
  const updated: GameStats = {
    ...current,
    resetsCount: current.resetsCount + 1,
    lastPlayedAt: new Date().toISOString(),
  };

  saveLocalStats(updated, gameId);

  if (isSupabaseConfigured && userId) {
    try {
      await supabase.from('user_game_stats').upsert(
        {
          user_id: userId,
          game_id: gameId,
          games_played: updated.gamesPlayed,
          games_won: updated.gamesWon,
          games_lost: updated.gamesLost,
          games_drawn: updated.gamesDrawn,
          resets_count: updated.resetsCount,
          best_score: updated.bestScore ?? 0,
          highest_tile: updated.highestTile ?? 0,
          updated_at: updated.lastPlayedAt,
        },
        { onConflict: 'user_id,game_id' }
      );
    } catch (err) {
      console.warn(`[gameStatsService] Failed to upsert reset count for ${gameId} to Supabase:`, err);
    }
  }

  return updated;
}

/**
 * Resets all user stats back to zero for a specific game
 */
export async function resetAllStats(userId?: string, gameId = 'chess'): Promise<GameStats> {
  saveLocalStats(DEFAULT_STATS, gameId);

  if (isSupabaseConfigured && userId) {
    try {
      await supabase
        .from('user_game_stats')
        .delete()
        .eq('user_id', userId)
        .eq('game_id', gameId);
    } catch (err) {
      console.warn(`[gameStatsService] Failed to delete remote stats for ${gameId}:`, err);
    }
  }

  return { ...DEFAULT_STATS };
}
