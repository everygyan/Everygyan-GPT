import React, { useState } from 'react';
import {
  Sparkles,
  Gamepad2,
  Layers,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { ChessCard } from './ChessCard';
import { Game2048Card } from './Game2048Card';

export type GameCategory = 'all' | 'strategy' | 'arcade' | 'brain';

interface CategoryConfig {
  id: GameCategory;
  name: string;
  tagline: string;
  emoji: string;
  color: string;
  activeBorder: string;
  activeBg: string;
  activeGlow: string;
  badge: string;
  gamesList: string[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: 'strategy',
    name: 'Strategy & Board Games',
    tagline: 'Turn-based tactical challenges, pass-and-play, and bot AI engines.',
    emoji: '♟️',
    color: 'from-red-500/20 to-rose-600/20',
    activeBorder: 'border-red-500 ring-2 ring-red-500/30',
    activeBg: 'bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-950',
    activeGlow: 'bg-red-500/20',
    badge: '1 Playable · 3 Coming Soon',
    gamesList: ['Chess Master', 'Connect 4', 'Checkers', 'Battleship'],
  },
  {
    id: 'arcade',
    name: 'Arcade & Numbers',
    tagline: 'High-score chasing, sliding number tiles, and retro casual favorites.',
    emoji: '🔢',
    color: 'from-amber-500/20 to-orange-600/20',
    activeBorder: 'border-amber-500 ring-2 ring-amber-500/30',
    activeBg: 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950',
    activeGlow: 'bg-amber-500/20',
    badge: '1 Playable · 3 Coming Soon',
    gamesList: ['2048', 'Retro Snake', 'Minesweeper', 'Solitaire'],
  },
  {
    id: 'brain',
    name: 'Daily Brain & Word Puzzles',
    tagline: 'Habitual morning puzzles, 5-letter word guessing, and daily numerical logic.',
    emoji: '🧩',
    color: 'from-purple-500/20 to-indigo-600/20',
    activeBorder: 'border-purple-500 ring-2 ring-purple-500/30',
    activeBg: 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950',
    activeGlow: 'bg-purple-500/20',
    badge: 'Coming Soon',
    gamesList: ['Wordle (Word Guess)', 'Sudoku', 'Connections', 'Mini Crossword'],
  },
];

interface TeaserGame {
  title: string;
  category: 'strategy' | 'arcade' | 'brain';
  description: string;
  icon: string;
  difficulty: 'Low' | 'Medium' | 'High';
  status: 'Coming Soon' | 'Next in Queue' | 'In Lab';
}

const UPCOMING_GAMES: TeaserGame[] = [
  {
    title: 'Wordle (Word Guess)',
    category: 'brain',
    description: 'Guess the hidden 5-letter word in 6 attempts with real-time green, yellow, and gray tile feedback.',
    icon: '🟩',
    difficulty: 'Low',
    status: 'Next in Queue',
  },
  {
    title: 'Sudoku Master',
    category: 'brain',
    description: 'Classic 9x9 numerical logic puzzle with 4 difficulty tiers, pencil notes, and mistake tracking.',
    icon: '✏️',
    difficulty: 'Medium',
    status: 'In Lab',
  },
  {
    title: 'Connect 4 (Four-in-a-Row)',
    category: 'strategy',
    description: 'Drop colored discs into the 7x6 grid to connect four in a line before your opponent or AI bot.',
    icon: '🔴',
    difficulty: 'Low',
    status: 'Next in Queue',
  },
  {
    title: 'Minesweeper',
    category: 'arcade',
    description: 'Classic deductive grid puzzle with safe square clearing, bomb flagging, and timer.',
    icon: '💣',
    difficulty: 'Low',
    status: 'In Lab',
  },
  {
    title: 'Retro Snake',
    category: 'arcade',
    description: 'Classic arcade snake with smooth keyboard and swipe controls, speed ramp, and high-score saves.',
    icon: '🐍',
    difficulty: 'Low',
    status: 'In Lab',
  },
];

export const GamesHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');

  const filteredUpcoming =
    selectedCategory === 'all'
      ? UPCOMING_GAMES
      : UPCOMING_GAMES.filter((g) => g.category === selectedCategory);

  return (
    <div className="space-y-8 mb-12">
      {/* 3 Main Interactive Category Blocks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-red-600" />
              Online Arcade & Game Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a category block below to explore playable games and view your stats.
            </p>
          </div>

          {/* Quick "All Games" Toggle Pill */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Show All</span>
          </button>
        </div>

        {/* The 3 Interactive Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                className={`relative text-left p-5 rounded-3xl transition-all duration-300 flex flex-col justify-between overflow-hidden group focus:outline-none ${
                  isSelected
                    ? `${cat.activeBg} ${cat.activeBorder} shadow-2xl text-white scale-[1.02]`
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white hover:shadow-lg'
                }`}
              >
                {/* Decorative background ambient glow */}
                {isSelected && (
                  <div
                    className={`absolute -top-10 -right-10 w-40 h-40 ${cat.activeGlow} rounded-full blur-2xl pointer-events-none`}
                  />
                )}

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {cat.emoji}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg leading-snug">
                      {cat.name}
                    </h3>
                    <p
                      className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                        isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {cat.tagline}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-4 mt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold">
                  <span
                    className={
                      isSelected
                        ? 'text-white flex items-center gap-1 font-bold'
                        : 'text-slate-600 dark:text-slate-400 group-hover:text-red-500 transition-colors flex items-center gap-1'
                    }
                  >
                    {isSelected ? 'Viewing Games' : 'Click to View'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>

                  <span className="text-[11px] opacity-75">
                    {cat.gamesList.slice(0, 2).join(' · ')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="text-xs font-semibold text-slate-400 mr-1">Active Filter:</span>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All Games ({1 + 1})
        </button>
        <button
          onClick={() => setSelectedCategory('strategy')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'strategy'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>♟️ Strategy & Board (1)</span>
        </button>
        <button
          onClick={() => setSelectedCategory('arcade')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'arcade'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>🔢 Arcade & Numbers (1)</span>
        </button>
        <button
          onClick={() => setSelectedCategory('brain')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'brain'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>🧩 Daily Brain & Word (Coming Soon)</span>
        </button>
      </div>

      {/* Playable Games Render Section */}
      <div className="space-y-6">
        {/* Render Chess Card when 'all' or 'strategy' is selected */}
        {(selectedCategory === 'all' || selectedCategory === 'strategy') && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/10 text-red-500 dark:text-red-400">
                Strategy & Board
              </span>
              <span className="text-xs text-slate-400">Tactical vs AI Bot or 2-Player</span>
            </div>
            <ChessCard />
          </div>
        )}

        {/* Render 2048 Card when 'all' or 'arcade' is selected */}
        {(selectedCategory === 'all' || selectedCategory === 'arcade') && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400">
                Arcade & Numbers
              </span>
              <span className="text-xs text-slate-400">High-Score Tile Slider</span>
            </div>
            <Game2048Card />
          </div>
        )}

        {/* When Daily Brain & Word is selected alone */}
        {selectedCategory === 'brain' && (
          <div className="bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl p-8 text-center text-white space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-3xl mx-auto">
              🧩
            </div>
            <h3 className="text-xl font-extrabold text-white">Daily Brain & Word Puzzles</h3>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              Our engineering team is currently assembling <strong>Wordle (5-Letter Word Guess)</strong> and <strong>Sudoku Master</strong> with daily streak tracking and personal leaderboards!
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Next Release
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Games Teaser Carousel / Grid */}
      {filteredUpcoming.length > 0 && (
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                More Online Games in Development
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              {filteredUpcoming.length} {filteredUpcoming.length === 1 ? 'game' : 'games'} queued
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUpcoming.map((item) => (
              <div
                key={item.title}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{item.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Next in Queue'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Difficulty: <strong className="text-slate-700 dark:text-slate-300">{item.difficulty}</strong>
                  </span>
                  <span className="text-xs font-semibold text-red-500 dark:text-red-400 flex items-center gap-1">
                    Stay tuned
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
