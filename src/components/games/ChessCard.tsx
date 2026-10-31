import React, { useState, useEffect, useCallback } from 'react';
import { Play, Trophy, Users, Bot, RotateCcw, Sparkles } from 'lucide-react';
import { ChessGameModal } from './ChessGameModal';
import { getChessStats, GameStats } from '../../services/gameStatsService';
import { useAuth } from '../../contexts/AuthContext';

export const ChessCard: React.FC = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrawn: 0,
    resetsCount: 0,
  });

  useEffect(() => {
    getChessStats(user?.id).then(setStats);
  }, [user?.id]);

  const handleStatsUpdated = useCallback((updated: GameStats) => {
    setStats(updated);
  }, []);

  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl text-white mb-10">
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: Large Game Visual Icon & Badges */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 max-w-2xl">
            {/* Large Icon Container (Clickable to play) */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="relative group flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-3xl"
              aria-label="Play Classical Chess Master"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-red-600 to-amber-600 p-0.5 shadow-2xl shadow-red-900/30 group-hover:shadow-red-600/40 transition-all duration-300">
                <div className="w-full h-full bg-[#0b1120] rounded-[22px] flex items-center justify-center text-5xl sm:text-6xl select-none group-hover:scale-110 transition-transform duration-300">
                  ♟️
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-red-600 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                Play
              </span>
            </button>

            {/* Title & Description */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                  Featured Game
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                  <Bot className="w-3 h-3" /> Single Player
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Multiplayer
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Classical Chess Master
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Play classical chess directly in your browser. Challenge our built-in tactical AI with Easy, Medium, or Hard difficulty, or play pass-and-play with a friend. Your wins, losses, and resets are automatically recorded.
              </p>

              {/* Stats Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <strong className="text-white">{stats.gamesWon}</strong> Wins
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  <strong className="text-white">{stats.gamesLost}</strong> Losses
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  <strong className="text-white">{winRate}%</strong> Win Rate
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <strong className="text-white">{stats.resetsCount}</strong> Resets
                </span>
              </div>
            </div>
          </div>

          {/* Right: Big Play Now CTA Button */}
          <div className="flex flex-col items-center sm:items-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-white" />
              </div>
              <span>Play Now</span>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </button>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              ⚡ Instant load in browser popup · No download
            </span>
          </div>
        </div>
      </div>

      {/* Chess Game Interactive Popup (Only mounted when opened) */}
      {modalOpen && (
        <ChessGameModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onStatsUpdated={handleStatsUpdated}
        />
      )}
    </>
  );
};
