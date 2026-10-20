import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Tag as TagIcon, ChevronLeft } from 'lucide-react';
import { fetchArticlesByTagPaginated, PaginatedResult } from '../services/articleService';
import { ArticleCard } from '../components/common/ArticleCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Article } from '../types';
import { SeoHead, SITE_URL } from '../components/common/SeoHead';

export const TagPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState<PaginatedResult<Article>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 6,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  const tagName = slug ? slug.replace(/-/g, ' ') : '';

  useEffect(() => {
    async function loadTagArticles() {
      if (!slug) return;
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const result = await fetchArticlesByTagPaginated(slug, page, 6);
        setPaginatedData(result);
      } catch (err) {
        console.error('[TagPage] Error loading tag articles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTagArticles();
  }, [slug, page]);

  return (
    <div className="py-6 sm:py-10 space-y-8">
      <SeoHead
        title={`#${tagName} Articles & Stories`}
        description={`Explore all EveryGyan articles, tutorials, and travel guides tagged with #${tagName}.`}
        canonicalUrl={`/tag/${slug}`}
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
              name: `#${tagName}`,
              item: `${SITE_URL}/tag/${slug}`,
            },
          ],
        }}
      />

      {/* Breadcrumb Trail */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-red-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">Tags</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold capitalize">{tagName}</span>
      </nav>

      {/* Tag Header Banner */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
            <TagIcon className="w-4 h-4" />
            <span>Topic Tag</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight capitalize">
            {tagName}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl">
            Articles and deep-dive publications indexed under the <strong>#{tagName}</strong> tag.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <span>{paginatedData.total} Stories Found</span>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : paginatedData.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData.items.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>

          {/* Pagination Controls */}
          {paginatedData.totalPages > 1 && (
            <div className="pt-8 flex items-center justify-center gap-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Page {paginatedData.page} of {paginatedData.totalPages}
              </span>
              <button
                disabled={page >= paginatedData.totalPages}
                onClick={() => setPage((p) => Math.min(paginatedData.totalPages, p + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={`No articles tagged with #${tagName}`}
          description="Explore our primary topics or search by alternative terms."
          actionLabel="View All Topics"
          onAction={() => window.location.assign('/')}
        />
      )}
    </div>
  );
};

export default TagPage;
