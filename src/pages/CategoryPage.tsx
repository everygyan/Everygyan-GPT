import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { fetchArticlesByCategoryPaginated, PaginatedResult } from '../services/articleService';
import { fetchDynamicPages } from '../services/navigationService';
import { CATEGORIES } from '../data/seedData';
import { ArticleCard } from '../components/common/ArticleCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Article, Category } from '../types';
import { SeoHead, SITE_URL } from '../components/common/SeoHead';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [paginatedData, setPaginatedData] = useState<PaginatedResult<Article>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 6,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryArticles() {
      if (!slug) return;
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const normalizedSlug = slug.toLowerCase();
        let cat = CATEGORIES.find((c) => c.slug.toLowerCase() === normalizedSlug) || null;

        if (!cat) {
          if (normalizedSlug === 'travel') {
            cat = {
              id: 'cat-parent-travel',
              name: 'Travel & Expeditions',
              slug: 'travel',
              description: 'Family-friendly itineraries, worldwide wonders, regional guides, and rejuvenating wellness retreats.',
              icon: 'Compass',
              color: '#e11d48',
              badgeBg: 'bg-rose-50',
              badgeText: 'text-rose-700',
            };
          } else if (normalizedSlug === 'news') {
            cat = {
              id: 'cat-parent-news',
              name: 'World & Regional News',
              slug: 'news',
              description: 'Fact-checked international coverage, breaking developments, trade routes, and continent-wide affairs.',
              icon: 'Globe',
              color: '#dc2626',
              badgeBg: 'bg-red-50',
              badgeText: 'text-red-700',
            };
          } else if (normalizedSlug === 'learn') {
            cat = {
              id: 'cat-parent-learn',
              name: 'Learning & Enterprise Tech',
              slug: 'learn',
              description: 'Practical SAP S/4HANA workflows, multimodal AI engineering, German language mastery, and career certifications.',
              icon: 'BookOpen',
              color: '#7c3aed',
              badgeBg: 'bg-purple-50',
              badgeText: 'text-purple-700',
            };
          } else if (normalizedSlug === 'entertainment') {
            cat = {
              id: 'cat-parent-entertainment',
              name: 'Entertainment & Culture',
              slug: 'entertainment',
              description: 'Cinema masterclasses, limited streaming series reviews, red carpet celebrity news, and visual photography.',
              icon: 'Film',
              color: '#db2777',
              badgeBg: 'bg-pink-50',
              badgeText: 'text-pink-700',
            };
          } else if (normalizedSlug === 'tech') {
            cat = CATEGORIES.find((c) => c.slug === 'learn-ai') || null;
          } else if (normalizedSlug === 'learning') {
            cat = CATEGORIES.find((c) => c.slug === 'learn-sap') || null;
          } else if (normalizedSlug === 'sports') {
            cat = CATEGORIES.find((c) => c.slug === 'news-asia') || null;
          } else if (normalizedSlug === 'geopolitics') {
            cat = CATEGORIES.find((c) => c.slug === 'news-world') || null;
          } else {
            // Check dynamically created pages from Supabase/admin dashboard
            try {
              const dynPages = await fetchDynamicPages();
              const dyn = dynPages.find((p) => p.slug.toLowerCase() === normalizedSlug);
              if (dyn) {
                cat = {
                  id: dyn.id,
                  name: dyn.title,
                  slug: dyn.slug,
                  description: dyn.description || `Verified guides, articles and news in ${dyn.title} on EveryGyan.`,
                  icon: dyn.icon || 'Folder',
                  color: dyn.color || '#e11d48',
                  badgeBg: 'bg-red-50',
                  badgeText: 'text-red-700',
                };
              }
            } catch {
              // Ignore and use fallback
            }

            if (!cat) {
              const formattedName = normalizedSlug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
              cat = {
                id: `cat-${normalizedSlug}`,
                name: formattedName,
                slug: normalizedSlug,
                description: `Verified articles, news, and learning tutorials in ${formattedName} on EveryGyan.`,
                icon: 'Folder',
                color: '#475569',
                badgeBg: 'bg-slate-50',
                badgeText: 'text-slate-700',
              };
            }
          }
        }

        setCategory(cat);
        const result = await fetchArticlesByCategoryPaginated(slug, page, 6);
        setPaginatedData(result);
      } catch (err) {
        console.error('[CategoryPage] Failed to load category articles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryArticles();
  }, [slug, page]);

  return (
    <div className="py-6 sm:py-10 space-y-8">
      <SeoHead
        title={`${category?.name || slug} Stories & Guides`}
        description={
          category?.description ||
          `Explore verified editorial articles, news, and learning guides in ${category?.name || slug} on EveryGyan.`
        }
        canonicalUrl={`/category/${slug}`}
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
              name: category?.name || slug,
              item: `${SITE_URL}/category/${slug}`,
            },
          ],
        }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-red-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold capitalize">
          {category?.name || slug}
        </span>
      </nav>

      {/* Category Header */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-2">
            Topic Archive
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {category?.name || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category')}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            {category?.description || 'Curated reporting, in-depth tutorials, and latest editorial analysis.'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <span>{paginatedData.total} Stories Published</span>
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
          title={`No Articles in ${category?.name || slug}`}
          description="We are currently authoring new stories for this topic. Check back soon or explore other categories."
          actionLabel="Explore All Topics"
          onAction={() => window.location.assign('/')}
        />
      )}
    </div>
  );
};

export default CategoryPage;
