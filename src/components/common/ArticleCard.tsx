import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
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
          className="w-full h-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105 motion-reduce:transform-none"
        />
        {/* Category Pill Tag Overlay */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase rounded-md bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
            {article.category}
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/article/${article.slug}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
          >
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2.5">
              {article.title}
            </h3>
          </Link>
          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">
            {article.excerpt}
          </p>
        </div>

        {/* Date and Read Time Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>{article.published_at}</span>
          <span>•</span>
          <span>{article.read_time}</span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
