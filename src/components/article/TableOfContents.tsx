import React from 'react';
import { List } from 'lucide-react';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      className="my-8 p-5 bg-slate-50 border border-slate-200/90 rounded-2xl"
      aria-label="Table of contents"
    >
      <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-sm">
        <List className="w-4 h-4 text-red-600" />
        <span>Table of Contents</span>
      </div>
      <ol className="space-y-1.5 text-xs sm:text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? 'ml-4' : ''}>
            <a
              href={`#${item.id}`}
              className="text-slate-600 hover:text-red-600 transition-colors font-medium"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default TableOfContents;
