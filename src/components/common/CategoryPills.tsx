import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Heart, Globe, Trophy, Compass, BookOpen } from 'lucide-react';
import { CATEGORIES } from '../../data/seedData';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Heart,
  Globe,
  Trophy,
  Compass,
  BookOpen,
};

interface CategoryPillsProps {
  activeCategory?: string;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({ activeCategory }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-start md:justify-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const IconComponent = iconMap[cat.icon] || Globe;
          const isActive = activeCategory === cat.slug;

          return (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className={`flex flex-col items-center group min-w-[72px] sm:min-w-[84px] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-xl p-2 transition-all duration-200 ${
                isActive ? 'scale-105' : 'hover:-translate-y-0.5'
              }`}
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-sm border transition-all ${
                  isActive
                    ? 'bg-red-600 text-white border-red-600 shadow-md ring-4 ring-red-100'
                    : 'bg-white text-slate-700 border-slate-200 group-hover:border-red-300 group-hover:text-red-600 group-hover:shadow'
                }`}
                style={{
                  color: isActive ? '#ffffff' : cat.color,
                }}
              >
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span
                className={`mt-2 text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
                  isActive ? 'text-red-600' : 'text-slate-700 group-hover:text-slate-900'
                }`}
              >
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPills;
