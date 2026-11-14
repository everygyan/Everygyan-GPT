import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Clock } from 'lucide-react';
import { Article } from '../../types';

interface LatestNewsSidebarProps {
  articles: Article[];
}

export const LatestNewsSidebar: React.FC<LatestNewsSidebarProps> = ({ articles }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
      {/* Header with Title and Live Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 fill-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
              Latest News
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Live Dispatch</span>
            </div>
          </div>
        </div>

        <Link
          to="/category/tech"
          className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List of 4 items with numbered index */}
      <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-between py-2">
        {articles.slice(0, 4).map((item, idx) => (
          <article
            key={item.id}
            className="py-3 first:pt-2 last:pb-1 group flex items-start gap-3.5 hover:bg-slate-50/70 p-2 rounded-2xl transition-all"
          >
            {/* Number Index */}
            <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-red-500 transition-colors pt-1">
              0{idx + 1}
            </span>

            {/* Thumbnail */}
            <Link
              to={`/article/${item.slug}`}
              className="relative w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 focus:outline-none border border-slate-100 shadow-xs"
            >
              <img
                src={item.cover_image}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-110 motion-reduce:transform-none"
              />
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {item.read_time}
                </span>
              </div>

              <Link
                to={`/article/${item.slug}`}
                className="block focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500 rounded"
              >
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
              </Link>

              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {item.published_at}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Footer Explore Pill */}
      <div className="pt-3 border-t border-slate-100 text-center">
        <Link
          to="/category/latest-news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors"
        >
          <span>Browse all breaking headlines</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default LatestNewsSidebar;
