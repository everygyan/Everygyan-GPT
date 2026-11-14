import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Gamepad2, ArrowRight } from 'lucide-react';
import { Article } from '../../types';

interface DailyPulseTickerProps {
  trendingArticles: Article[];
  onOpenGames?: () => void;
}

export const DailyPulseTicker: React.FC<DailyPulseTickerProps> = ({
  trendingArticles,
  onOpenGames,
}) => {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  // Rotate ticker headline every 4 seconds
  useEffect(() => {
    if (!trendingArticles || trendingArticles.length <= 1) return;
    const interval = setInterval(() => {
      setActiveStoryIdx((prev) => (prev + 1) % trendingArticles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [trendingArticles]);

  const activeArticle = trendingArticles[activeStoryIdx] || trendingArticles[0];

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-2.5 sm:p-3 shadow-md border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      {/* Left: Live Edition Badge & Animated Ticker Headline */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-2 shrink-0 bg-red-600/90 text-white px-2.5 py-1 rounded-xl font-bold tracking-wider uppercase text-[10px] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Live Pulse</span>
        </div>

        <span className="text-slate-400 font-mono text-[11px] hidden sm:inline shrink-0">
          {todayFormatted}
        </span>

        <span className="text-slate-700 hidden sm:inline">•</span>

        {/* Dynamic Story Ticker */}
        {activeArticle ? (
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden animate-fadeIn key={activeArticle.id}">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400 font-medium shrink-0 hidden lg:inline">Trending:</span>
            <Link
              to={`/article/${activeArticle.slug}`}
              className="text-slate-200 hover:text-white font-semibold truncate transition-colors hover:underline"
            >
              {activeArticle.title}
            </Link>
          </div>
        ) : (
          <span className="text-slate-400">Curating the latest knowledge dispatches...</span>
        )}
      </div>

      {/* Right: Quick Action Hub Pills */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <Link
          to="/category/entertainment-games"
          onClick={onOpenGames}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all font-medium"
        >
          <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Brain Lounge (2048 & Chess)</span>
        </Link>

        <Link
          to="/category/learn-german"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all font-medium"
        >
          <span>🇩🇪 German A1</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </Link>
      </div>
    </div>
  );
};

export default DailyPulseTicker;
