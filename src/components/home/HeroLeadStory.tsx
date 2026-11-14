import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Headphones, Clock, User } from 'lucide-react';
import { Article } from '../../types';

interface HeroLeadStoryProps {
  articles: Article[];
}

export const HeroLeadStory: React.FC<HeroLeadStoryProps> = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-advance carousel every 6s, pausing on user hover or focus
  useEffect(() => {
    if (!articles || articles.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [articles, isPaused]);

  if (!articles || articles.length === 0) {
    return null;
  }

  const currentArticle = articles[currentIndex] || articles[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 40) {
      setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
    } else if (deltaX < -40) {
      setCurrentIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
    }
    touchStartX.current = null;
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Homepage Featured Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative group rounded-3xl overflow-hidden shadow-xl aspect-[16/11] sm:aspect-[16/10] lg:aspect-[16/11] bg-slate-950 text-white flex flex-col justify-end select-none border border-slate-800/80"
    >
      {/* Background Image with smooth fade transition & fast high-priority loading */}
      <img
        key={currentArticle.id}
        src={currentArticle.cover_image}
        alt={currentArticle.title}
        {...({ fetchpriority: 'high' } as React.ImgHTMLAttributes<HTMLImageElement>)}
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105 motion-reduce:transform-none animate-fadeIn"
      />

      {/* Cinematic Multi-stop Dark Gradient Overlay for Maximum Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent pointer-events-none" />

      {/* Top Floating Badges Bar */}
      <div className="absolute top-4 sm:top-5 left-4 sm:left-6 right-4 sm:right-6 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-wider uppercase bg-red-600/90 hover:bg-red-600 text-white rounded-full shadow-lg backdrop-blur-md border border-red-500/30 transition-all">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Lead Story</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-900/70 text-slate-200 rounded-full backdrop-blur-md border border-white/10">
            <Headphones className="w-3 h-3 text-red-400" />
            <span>Listen Available</span>
          </span>
        </div>

        {/* Slide Counter & Indicators */}
        {articles.length > 1 && (
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/90 bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
              0{currentIndex + 1} / 0{articles.length}
            </span>
          </div>
        )}
      </div>

      {/* Slider Left/Right Buttons */}
      {articles.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-red-600 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 border border-white/10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer shadow-lg"
            aria-label="Previous story"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-red-600 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 border border-white/10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer shadow-lg"
            aria-label="Next story"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Hero Content Text */}
      <div
        className="relative z-10 p-5 sm:p-8 lg:p-10 max-w-3xl"
        role="group"
        aria-roledescription="slide"
        aria-label={`${currentIndex + 1} of ${articles.length}: ${currentArticle.title}`}
      >
        {/* Category Pill Tag */}
        <div className="flex items-center gap-2 mb-3">
          <Link
            to={`/category/${currentArticle.category_slug}`}
            className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/15 hover:bg-red-600 text-white rounded-lg backdrop-blur-md border border-white/20 transition-all shadow-sm"
          >
            {currentArticle.category}
          </Link>
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {currentArticle.read_time}
          </span>
        </div>

        {/* Lead Headline */}
        <Link
          to={`/article/${currentArticle.slug}`}
          className="block group/title focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-lg"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight group-hover/title:text-red-300 transition-colors mb-3 drop-shadow-sm">
            {currentArticle.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-slate-300 text-xs sm:text-sm sm:leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4 max-w-2xl font-normal">
          {currentArticle.excerpt}
        </p>

        {/* Byline with Author & Date */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-white/10 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            {currentArticle.author.avatar ? (
              <img
                src={currentArticle.author.avatar}
                alt=""
                className="w-6 h-6 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-white font-semibold">{currentArticle.author.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{currentArticle.published_at}</span>
          </div>

          <Link
            to={`/article/${currentArticle.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-white transition-colors"
          >
            <span>Read full story</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom Progress Bar Track */}
      {articles.length > 1 && (
        <div className="relative z-10 w-full h-1 bg-slate-800/80 flex">
          {articles.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className="flex-1 h-full cursor-pointer relative overflow-hidden border-r border-slate-900 last:border-0"
              title={`Switch to story ${idx + 1}`}
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-full bg-gradient-to-r from-red-600 to-rose-400'
                    : idx < currentIndex
                    ? 'w-full bg-slate-600/50'
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroLeadStory;
