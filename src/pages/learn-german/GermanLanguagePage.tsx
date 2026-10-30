import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { fetchArticlesByCategoryPaginated, PaginatedResult } from '../../services/articleService';
import { Article } from '../../types';
import { ArticleCard } from '../../components/common/ArticleCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { SeoHead, SITE_URL } from '../../components/common/SeoHead';

export const GermanLanguagePage: React.FC = () => {
  const [paginatedData, setPaginatedData] = useState<PaginatedResult<Article>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 6,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      setLoading(true);
      try {
        const result = await fetchArticlesByCategoryPaginated('learn-german', 1, 6);
        setPaginatedData(result);
      } catch (err) {
        console.error('[GermanLanguagePage] Failed to fetch articles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  return (
    <div className="py-6 sm:py-10 space-y-8">
      <SeoHead
        title="German Language Mastery & CEFR Interactive Hub"
        description="Practical German language curriculum for expats and professionals. Master grammar, der/die/das rules, workplace phrases, and CEFR A1-B1 vocabulary."
        canonicalUrl="/category/learn-german"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: SITE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Learn',
              item: `${SITE_URL}/category/learn`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'German Language',
              item: `${SITE_URL}/category/learn-german`,
            },
          ],
        }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-red-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/category/learn" className="hover:text-red-600 transition-colors">
          Learn
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold">German Language</span>
      </nav>

      {/* Hero & Header Layout */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Language Track
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            German Language
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Practical German for expats, grammar rules, workplace communication, and CEFR-aligned vocabulary drills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
          <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>{paginatedData.total} Articles Published</span>
          </div>
        </div>
      </div>

      {/* Sub-routing Viewframe: Duolingo-style Learning Hub or Level Dashboard */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
        <Outlet />
      </div>

      {/* Dedicated Bottom Gallery: Explore Supplemental German Articles */}
      <section className="space-y-6 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Supplemental German Articles
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Curated grammar breakdowns, workplace etiquette guides, and expat transition tips.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {paginatedData.total} Guides Available
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : paginatedData.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData.items.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
            Supplemental articles are currently being published.
          </div>
        )}
      </section>
    </div>
  );
};

export default GermanLanguagePage;
