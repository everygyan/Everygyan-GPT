import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { searchArticles } from '../../services/articleService';
import { Article } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchArticles(query);
      setResults(res);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectArticle = (slug: string) => {
    onClose();
    navigate(`/article/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Search articles"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, topic, or keyword..."
            className="w-full text-slate-900 placeholder-slate-400 text-base focus:outline-none bg-transparent"
          />
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Close search dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-slate-100">
          {loading && (
            <div className="py-8 text-center text-sm text-slate-500">
              Searching publications...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-slate-700 font-medium">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for Tech, Travel, SAP, or Health.</p>
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 text-center text-xs text-slate-400">
              Type keywords above to discover matching tutorials, news, and travel guides.
            </div>
          )}

          {!loading &&
            results.map((art) => (
              <div
                key={art.id}
                onClick={() => handleSelectArticle(art.slug)}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors"
              >
                <div className="pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                    {art.category}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{art.excerpt}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 flex-shrink-0 transition-colors" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
