import React, { useState, useEffect, useCallback } from 'react';
import { Play, Trophy, RotateCcw, Sparkles, Award, Zap } from 'lucide-react';
import { Game2048Modal } from './Game2048Modal';
import { get2048Stats, GameStats } from '../../services/gameStatsService';
import { useAuth } from '../../contexts/AuthContext';

export const Game2048Card: React.FC = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrawn: 0,
    resetsCount: 0,
    bestScore: 0,
    highestTile: 0,
  });

  useEffect(() => {
    get2048Stats(user?.id).then(setStats);
  }, [user?.id]);

  const handleStatsUpdated = useCallback((updated: GameStats) => {
    setStats(updated);
  }, []);

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#1e1728] to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl text-white mb-8">
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: Large Game Visual Icon & Badges */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 max-w-2xl">
            {/* Large Icon Container (Clickable to play) */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="relative group flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-3xl"
              aria-label="Play 2048 Puzzle Master"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-0.5 shadow-2xl shadow-amber-900/40 group-hover:shadow-amber-500/50 transition-all duration-300">
                <div className="w-full h-full bg-[#110f1d] rounded-[22px] flex items-center justify-center font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-500 select-none group-hover:scale-110 transition-transform duration-300">
                  2048
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                Play
              </span>
            </button>

            {/* Title & Description */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Top Recommendation
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Arcade & Numbers
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  High Replayability
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                2048 Puzzle Master
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Arrow and swipe puzzle where matching numbered tiles merge together (2 → 4 → 8 → ... → 2048). Features smooth animations, synthesized chimes, and high-score chasing.
              </p>

              {/* Stats Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Best Score: <strong className="text-white">{stats.bestScore ?? 0}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  Highest Tile: <strong className="text-white">{stats.highestTile ?? 0}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span>
                  <strong className="text-emerald-400">{stats.gamesWon}</strong> Victories
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
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-xl bg-black/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
              </div>
              <span>Play Now</span>
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </button>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              ⚡ Keyboard & Touch Swipe · Instant Load
            </span>
          </div>
        </div>
      </div>

      {/* 2048 Modal */}
      {modalOpen && (
        <Game2048Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onStatsUpdated={handleStatsUpdated}
        />
      )}
    </>
  );
};
