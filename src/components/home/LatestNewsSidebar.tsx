import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Article } from '../../types';

interface LatestNewsSidebarProps {
  articles: Article[];
}

export const LatestNewsSidebar: React.FC<LatestNewsSidebarProps> = ({ articles }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header with Title and 'View all' */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Latest News
        </h2>
        <Link
          to="/category/tech"
          className="text-xs font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List of 4 items */}
      <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-around py-1">
        {articles.map((item) => (
          <article key={item.id} className="py-3.5 first:pt-2 last:pb-1 group flex items-center gap-3.5">
            {/* Thumbnail */}
            <Link
              to={`/article/${item.slug}`}
              className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 focus:outline-none"
            >
              <img
                src={item.cover_image}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105 motion-reduce:transform-none"
              />
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-red-600 mb-1">
                {item.category}
              </span>
              <Link
                to={`/article/${item.slug}`}
                className="block focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500 rounded"
              >
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
              </Link>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-medium">
                <span>{item.published_at}</span>
                <span>•</span>
                <span>{item.read_time}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default LatestNewsSidebar;
