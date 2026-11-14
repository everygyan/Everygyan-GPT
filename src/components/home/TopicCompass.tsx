import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Cpu,
  BookOpen,
  Gamepad2,
  Heart,
  Sparkles,
  Newspaper,
  ArrowUpRight,
} from 'lucide-react';

interface TopicItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
  badgeText: string;
}

const TOPICS: TopicItem[] = [
  {
    id: 'travel-world',
    name: 'World Travel',
    slug: 'travel-world',
    tagline: 'Global routes & journeys',
    icon: Compass,
    color: 'text-rose-600',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
  },
  {
    id: 'travel-europe',
    name: 'Europe Travel',
    slug: 'travel-europe',
    tagline: 'Alps, castles & coastlines',
    icon: Compass,
    color: 'text-sky-600',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
  },
  {
    id: 'learn-ai',
    name: 'AI & Tech',
    slug: 'learn-ai',
    tagline: 'Gemini, LLMs & Agents',
    icon: Cpu,
    color: 'text-indigo-600',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
  },
  {
    id: 'learn-german',
    name: 'Learn German',
    slug: 'learn-german',
    tagline: 'A1-B1 curriculum',
    icon: BookOpen,
    color: 'text-amber-600',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
  },
  {
    id: 'games',
    name: 'Games & 2048',
    slug: 'entertainment-games',
    tagline: '2048, Chess & puzzles',
    icon: Gamepad2,
    color: 'text-purple-600',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
  },
  {
    id: 'health',
    name: 'Health',
    slug: 'health',
    tagline: 'Longevity & wellness',
    icon: Heart,
    color: 'text-emerald-600',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
  },
  {
    id: 'learn-sap',
    name: 'SAP Tutorials',
    slug: 'learn-sap',
    tagline: 'S/4HANA & ABAP RAP',
    icon: Sparkles,
    color: 'text-blue-600',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
  },
  {
    id: 'news',
    name: 'Global News',
    slug: 'latest-news',
    tagline: 'Breaking global dispatches',
    icon: Newspaper,
    color: 'text-slate-700',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
  },
];

export const TopicCompass: React.FC = () => {
  return (
    <section aria-label="Explore Knowledge Domains" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Explore Knowledge Domains</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Hand-curated knowledge channels, interactive masterclasses, and tactical guides.
          </p>
        </div>
      </div>

      {/* Grid of Topic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <Link
              key={topic.id}
              to={`/category/${topic.slug}`}
              className="group relative bg-white hover:bg-slate-50/80 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between overflow-hidden"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${topic.badgeBg} flex items-center justify-center shrink-0 border border-slate-200/60 group-hover:scale-105 transition-transform`}
                >
                  <Icon className={`w-5 h-5 ${topic.color}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                    {topic.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">{topic.tagline}</p>
                </div>
              </div>

              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default TopicCompass;
