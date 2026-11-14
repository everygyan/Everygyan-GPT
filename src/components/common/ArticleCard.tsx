import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Headphones, User } from 'lucide-react';
import { Article } from '../../types';

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <article className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-red-200/80 transition-all duration-300 flex flex-col h-full">
      {/* Cover Image Container */}
      <Link
        to={`/article/${article.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-slate-100 focus:outline-none"
      >
        <img
          src={article.cover_image}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105 motion-reduce:transform-none"
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Category Pill Tag Overlay */}
        <div className="absolute top-3.5 left-3.5">
          <span className="inline-block px-3 py-1 text-[11px] font-bold tracking-wider uppercase rounded-xl bg-white/95 text-slate-800 shadow-sm backdrop-blur-md border border-white/50">
            {article.category}
          </span>
        </div>

        {/* Quick Audio Badge if Available */}
        <div className="absolute top-3.5 right-3.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-full bg-slate-900/80 text-white backdrop-blur-md border border-white/10 shadow-xs">
            <Headphones className="w-3 h-3 text-red-400" />
            <span className="hidden sm:inline">Audio</span>
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/article/${article.slug}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg group/link"
          >
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2.5">
              {article.title}
            </h3>
          </Link>
          <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
            {article.excerpt}
          </p>
        </div>

        {/* Footer with Author Avatar & Reading Time */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2 min-w-0">
            {article.author?.avatar ? (
              <img
                src={article.author.avatar}
                alt=""
                className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                <User className="w-3 h-3" />
              </div>
            )}
            <span className="text-slate-700 font-semibold truncate">{article.author?.name}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-slate-400 text-[11px]">
            <span>{article.published_at}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {article.read_time}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
