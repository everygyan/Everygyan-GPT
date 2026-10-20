import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, ChevronRight } from 'lucide-react';
import { searchArticles } from '../services/articleService';
import { ArticleCard } from '../components/common/ArticleCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Article } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  const filterOptions = [
    { label: 'All Topics', value: 'all' },
    { label: 'Tech', value: 'tech' },
    { label: 'Travel', value: 'travel' },
    { label: 'Learning', value: 'learning' },
    { label: 'Health', value: 'health' },
    { label: 'Geopolitics', value: 'geopolitics' },
    { label: 'Sports', value: 'sports' },
  ];

  useEffect(() => {
    async function performSearch() {
      if (!queryParam.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const found = await searchArticles(queryParam);
        setResults(found);
      } catch (err) {
        console.error('[SearchPage] Search error:', err);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [queryParam]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    } else {
      setSearchParams({});
    }
  };

  const filteredResults = activeCategoryFilter === 'all'
    ? results
    : results.filter((a) => a.category_slug.toLowerCase() === activeCategoryFilter.toLowerCase());

  return (
    <div className="py-6 sm:py-10 space-y-8">
      {/* Breadcrumb Trail */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-red-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold">Search Publications</span>
      </nav>

      {/* Search Input Banner */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Search EveryGyan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover editorial articles, SAP tutorials, technology news, and family travel itineraries.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type keywords (e.g. Travel, SAP, AI, Austria)..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveCategoryFilter(opt.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategoryFilter === opt.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {queryParam && !loading && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredResults.length} result{filteredResults.length === 1 ? '' : 's'} for{' '}
            <strong className="text-slate-800">"{queryParam}"</strong>
          </span>
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      ) : queryParam ? (
        <EmptyState
          title={`No articles found for "${queryParam}"`}
          description="Try checking for spelling errors, using more general keywords, or exploring our categories."
          actionLabel="Clear Search"
          onAction={() => {
            setSearchTerm('');
            setSearchParams({});
          }}
        />
      ) : (
        <div className="py-12 text-center text-sm text-slate-400">
          Enter a search term above to begin exploring.
        </div>
      )}
    </div>
  );
};

export default SearchPage;
