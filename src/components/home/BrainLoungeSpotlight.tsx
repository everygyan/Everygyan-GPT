import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Sparkles, Bot, ArrowRight, Play } from 'lucide-react';

interface BrainLoungeSpotlightProps {
  onPlay2048: () => void;
  onPlayChess: () => void;
}

export const BrainLoungeSpotlight: React.FC<BrainLoungeSpotlightProps> = ({
  onPlay2048,
  onPlayChess,
}) => {
  return (
    <section aria-label="EveryGyan Brain Lounge" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 mb-1.5">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Interactive Midday Brain Lounge</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Play Instant On-Device Mini-Games
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fast, zero-install logic games. Scores and statistics automatically sync to your EveryGyan profile.
          </p>
        </div>

        <Link
          to="/category/entertainment-games"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 self-start sm:self-auto transition-colors"
        >
          <span>All Games & Categories</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 2048 Showcase Tile */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white rounded-3xl p-6 border border-amber-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white">
                  Swipe Puzzle
                </span>
                <span className="text-xs text-amber-800 font-semibold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" /> High Score Chasing
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                2048 Number Merge
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed max-w-sm">
                Use your arrow keys or swipe on mobile to slide numbered tiles. When two tiles with the same number touch, they merge into one!
              </p>
            </div>

            {/* Visual Mini 2048 Preview Grid */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-200/60 rounded-2xl p-1.5 grid grid-cols-2 gap-1.5 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              <div className="bg-amber-100 rounded-lg flex items-center justify-center font-bold text-xs text-slate-800 shadow-xs">
                2
              </div>
              <div className="bg-amber-200 rounded-lg flex items-center justify-center font-bold text-xs text-slate-800 shadow-xs">
                4
              </div>
              <div className="bg-orange-300 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-xs">
                128
              </div>
              <div className="bg-amber-500 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-xs animate-pulse">
                2048
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 mt-4 border-t border-amber-200/70">
            <div className="text-xs text-slate-500 font-medium">
              <span>Touch & Arrow Controls • Sound Effects</span>
            </div>

            <button
              type="button"
              onClick={onPlay2048}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play 2048 Now</span>
            </button>
          </div>
        </div>

        {/* Chess Engine Showcase Tile */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-slate-50 to-white rounded-3xl p-6 border border-indigo-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
                  On-Device AI
                </span>
                <span className="text-xs text-indigo-800 font-semibold flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-indigo-600" /> Minimax Engine
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Chess Grandmaster Arena
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed max-w-sm">
                Play against our smart on-device bot across Easy, Medium, or Master tiers, or challenge a friend locally with turn-by-turn move notation.
              </p>
            </div>

            {/* Visual Mini Chess Preview Board */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-900 rounded-2xl p-1.5 grid grid-cols-2 gap-1 shrink-0 shadow-inner group-hover:scale-105 transition-transform text-white">
              <div className="bg-amber-100/90 rounded-md flex items-center justify-center font-bold text-base text-slate-900">
                ♞
              </div>
              <div className="bg-amber-800/80 rounded-md flex items-center justify-center font-bold text-base text-amber-100">
                ♚
              </div>
              <div className="bg-amber-800/80 rounded-md flex items-center justify-center font-bold text-base text-amber-100">
                ♜
              </div>
              <div className="bg-amber-100/90 rounded-md flex items-center justify-center font-bold text-base text-slate-900">
                ♛
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 mt-4 border-t border-indigo-200/70">
            <div className="text-xs text-slate-500 font-medium">
              <span>3 AI Difficulties • Pass & Play Mode</span>
            </div>

            <button
              type="button"
              onClick={onPlayChess}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Challenge AI</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrainLoungeSpotlight;
