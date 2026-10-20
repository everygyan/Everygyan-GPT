import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '../../types';

interface HeroLeadStoryProps {
  articles: Article[];
}

export const HeroLeadStory: React.FC<HeroLeadStoryProps> = ({ articles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  return (
    <div className="relative group rounded-2xl overflow-hidden shadow-lg aspect-[16/11] sm:aspect-[16/10] lg:aspect-[16/11] bg-slate-900 text-white flex flex-col justify-end">
      {/* Background Image with smooth fade transition & fast high-priority loading */}
      <img
        src={currentArticle.cover_image}
        alt={currentArticle.title}
        {...({ fetchpriority: 'high' } as React.ImgHTMLAttributes<HTMLImageElement>)}
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105 motion-reduce:transform-none"
      />

      {/* Dark Gradient Overlay for Maximum Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

      {/* Slider Left/Right Buttons */}
      {articles.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/50 hover:bg-slate-950/80 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Previous lead story"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/50 hover:bg-slate-950/80 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Next lead story"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {articles.length > 1 && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
          {articles.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-red-600' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Hero Content Text */}
      <div className="relative z-10 p-5 sm:p-8 lg:p-10 max-w-3xl">
        {/* Category Pill Tag */}
        <Link
          to={`/category/${currentArticle.category_slug}`}
          className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red-600 text-white rounded-md mb-3 hover:bg-red-700 transition-colors shadow-sm"
        >
          {currentArticle.category}
        </Link>

        {/* Lead Headline */}
        <Link
          to={`/article/${currentArticle.slug}`}
          className="block group/title focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight group-hover/title:text-red-300 transition-colors mb-3">
            {currentArticle.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-slate-200 text-xs sm:text-sm sm:leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4 max-w-2xl font-normal">
          {currentArticle.excerpt}
        </p>

        {/* Byline */}
        <div className="flex items-center text-xs text-slate-300 font-medium space-x-2">
          <span className="text-white font-semibold">By {currentArticle.author.name}</span>
          <span>•</span>
          <span>{currentArticle.published_at}</span>
          <span>•</span>
          <span>{currentArticle.read_time}</span>
        </div>
      </div>
    </div>
  );
};

export default HeroLeadStory;
