import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { fetchArticlesByCategory } from '../services/articleService';
import { CATEGORIES } from '../data/seedData';
import { ArticleCard } from '../components/common/ArticleCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Article, Category } from '../types';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryArticles() {
      if (!slug) return;
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const cat = CATEGORIES.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
        setCategory(cat);
        const data = await fetchArticlesByCategory(slug);
        setArticles(data);
      } catch (err) {
        console.error('[CategoryPage] Failed to load category articles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryArticles();
  }, [slug]);

  return (
    <div className="py-6 sm:py-10 space-y-8">
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
          <span>{articles.length} Published Stories</span>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
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
