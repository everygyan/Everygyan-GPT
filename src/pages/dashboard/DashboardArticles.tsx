import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
  Folder,
  FolderTree,
  List,
  ChevronDown,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Article, ArticleStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { fetchEditorialArticles, deleteArticle } from '../../services/cmsService';
import { CATEGORIES } from '../../data/seedData';
import { fetchNavigationMenu, getAllNavigationCategories, fetchDynamicPages } from '../../services/navigationService';

export interface ArticleCategoryGroup {
  key: string;
  name: string;
  displayName: string;
  slug: string;
  articles: Article[];
  counts: {
    total: number;
    published: number;
    draft: number;
    in_review: number;
    scheduled: number;
    archived: number;
  };
}

export function groupArticlesByCategory(
  articles: Article[],
  categoryOptions: { slug: string; name: string; displayName?: string }[]
): ArticleCategoryGroup[] {
  const optBySlug = new Map<string, { slug: string; name: string; displayName?: string }>();
  const optByName = new Map<string, { slug: string; name: string; displayName?: string }>();

  categoryOptions.forEach((opt) => {
    if (opt.slug) optBySlug.set(opt.slug.toLowerCase().trim(), opt);
    if (opt.name) optByName.set(opt.name.toLowerCase().trim(), opt);
    if (opt.displayName) {
      optByName.set(opt.displayName.toLowerCase().trim(), opt);
    }
  });

  const groupMap = new Map<string, ArticleCategoryGroup>();

  articles.forEach((art) => {
    const rawCat = (art.category || '').trim();
    const rawSlug = (art.category_slug || '').trim();

    // 1. Try finding matching option by slug
    let match = rawSlug ? optBySlug.get(rawSlug.toLowerCase()) : undefined;

    // 2. Try by category name
    if (!match && rawCat) {
      match = optByName.get(rawCat.toLowerCase());
    }

    // 3. Try matching last slug segment (e.g. "japan" from "travel-asia/japan")
    if (!match && rawSlug) {
      const parts = rawSlug.split(/[/_-]/);
      const lastSeg = parts[parts.length - 1];
      if (lastSeg) {
        match = optBySlug.get(lastSeg.toLowerCase()) || optByName.get(lastSeg.toLowerCase());
      }
    }

    const key = match ? match.slug.toLowerCase() : (rawSlug || rawCat || 'general').toLowerCase();
    const name = match ? match.name : (rawCat || 'General');
    const displayName = match?.displayName || rawCat || 'General';
    const slug = match ? match.slug : (rawSlug || 'general');

    let group = groupMap.get(key);
    if (!group) {
      group = {
        key,
        name,
        displayName,
        slug,
        articles: [],
        counts: {
          total: 0,
          published: 0,
          draft: 0,
          in_review: 0,
          scheduled: 0,
          archived: 0,
        },
      };
      groupMap.set(key, group);
    }

    group.articles.push(art);
    group.counts.total += 1;
    if (art.status === 'published') group.counts.published += 1;
    else if (art.status === 'draft') group.counts.draft += 1;
    else if (art.status === 'in_review') group.counts.in_review += 1;
    else if (art.status === 'scheduled') group.counts.scheduled += 1;
    else if (art.status === 'archived') group.counts.archived += 1;
  });

  // Sort groups alphabetically by name with 'general' at the end
  return Array.from(groupMap.values()).sort((a, b) => {
    if (a.key === 'general') return 1;
    if (b.key === 'general') return -1;
    return a.name.localeCompare(b.name);
  });
}

export const DashboardArticles: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categoryOptions, setCategoryOptions] = useState<{ slug: string; name: string; displayName?: string }[]>(CATEGORIES);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // View mode: 'grouped' (category blocks) or 'flat' (single table)
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');

  // Track collapsed state for category groups (by group key)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchDynamicPages(), fetchNavigationMenu()]).then(([dynPages, navTree]) => {
      if (!isMounted) return;
      const navCats = getAllNavigationCategories(navTree);
      const catMap = new Map<string, { slug: string; name: string; displayName?: string }>();

      CATEGORIES.forEach((c) => catMap.set(c.slug.toLowerCase(), { slug: c.slug, name: c.name, displayName: c.name }));
      (dynPages || []).forEach((p) => {
        if (!catMap.has(p.slug.toLowerCase())) {
          catMap.set(p.slug.toLowerCase(), { slug: p.slug, name: p.title, displayName: p.title });
        }
      });
      (navCats || []).forEach((nc) => {
        catMap.set(nc.slug.toLowerCase(), { slug: nc.slug, name: nc.name, displayName: nc.displayName });
      });

      setCategoryOptions(Array.from(catMap.values()));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEditorialArticles({
        status: selectedStatus,
        search,
        category: selectedCategory,
      });
      setArticles(data);
    } catch (err: unknown) {
      console.error('Failed to load articles:', err);
      setActionError('Failed to load articles from the database.');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, search, selectedCategory]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadArticles();
  };

  const handleDelete = async (articleId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    const { success, error } = await deleteArticle(articleId, {
      id: user?.id || 'unknown',
      role,
    });

    if (error) {
      setActionError(`Deletion failed: ${error}`);
    } else if (success) {
      setActionSuccess('Article removed successfully.');
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    }
  };

  const statusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Published
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            In Review
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Scheduled
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Archived
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
            Draft
          </span>
        );
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Unpublished';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  // Group filtered articles by category
  const categoryGroups = useMemo(() => {
    return groupArticlesByCategory(articles, categoryOptions);
  }, [articles, categoryOptions]);

  const toggleCategoryCollapse = (key: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedCategories({});
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    categoryGroups.forEach((g) => {
      allCollapsed[g.key] = true;
    });
    setCollapsedCategories(allCollapsed);
  };

  // Render a single article row
  const renderArticleRow = (art: Article, showCategoryCol: boolean = false) => (
    <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {art.cover_image && (
            <img
              src={art.cover_image}
              alt=""
              className="w-12 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
            />
          )}
          <div>
            <p className="font-bold text-slate-900 line-clamp-1 max-w-md">{art.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-400 font-mono">/{art.slug}</span>
              {art.is_carousel && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  Carousel
                </span>
              )}
              {art.is_lead_story && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                  Lead Story
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      {showCategoryCol && (
        <td className="px-6 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
          {art.category}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">{statusBadge(art.status)}</td>
      <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
        {art.author.name}
      </td>
      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap" title={art.published_at || ''}>
        {formatDate(art.published_at)}
      </td>
      <td className="px-6 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          {art.status === 'published' && (
            <Link
              to={`/article/${art.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Public Article"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
          <Link
            to={`/dashboard/articles/${art.id}/edit`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            title="Edit Article"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          {(role === 'admin' || (role === 'author' && art.status === 'draft')) && (
            <button
              onClick={() => handleDelete(art.id, art.title)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Article"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Article Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author, review, schedule, and publish editorial stories grouped by category across EveryGyan.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/articles/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">
            ×
          </button>
        </div>
      )}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-700 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* Search, Status & View Mode Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles by title..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </form>

          {/* Right Toolbar Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              {['all', 'draft', 'in_review', 'published', 'archived'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                    selectedStatus === st
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.displayName || c.name}
                </option>
              ))}
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grouped'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'hover:text-slate-900'
                }`}
                title="Group articles under category blocks"
              >
                <FolderTree className="w-3.5 h-3.5 text-red-500" />
                <span>Grouped</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('flat')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'flat'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'hover:text-slate-900'
                }`}
                title="View all articles in a flat list"
              >
                <List className="w-3.5 h-3.5 text-slate-500" />
                <span>Flat List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Quick Jump Pills Bar */}
        {categoryGroups.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Quick Filter:
              </span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                All ({articles.length})
              </button>
              {categoryGroups.map((grp) => (
                <button
                  key={grp.key}
                  onClick={() => setSelectedCategory(selectedCategory === grp.slug ? 'all' : grp.slug)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                    selectedCategory === grp.slug
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <span>{grp.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === grp.slug
                        ? 'bg-red-700 text-white'
                        : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    {grp.articles.length}
                  </span>
                </button>
              ))}
            </div>

            {viewMode === 'grouped' && categoryGroups.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2 py-1 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors font-medium cursor-pointer"
                >
                  Expand all
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2 py-1 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors font-medium cursor-pointer"
                >
                  Collapse all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm py-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
          <p className="text-xs text-slate-400">Fetching editorial articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm py-16 text-center px-4">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No articles found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            There are no publications matching your filter criteria. Create a new article to get started.
          </p>
          <button
            onClick={() => navigate('/dashboard/articles/new')}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Write your first article</span>
          </button>
        </div>
      ) : viewMode === 'grouped' ? (
        /* Grouped View: Categories with collapsible blocks */
        <div className="space-y-4">
          {categoryGroups.map((grp) => {
            const isCollapsed = Boolean(collapsedCategories[grp.key]);
            return (
              <div
                key={grp.key}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
              >
                {/* Category Header Banner */}
                <div
                  onClick={() => toggleCategoryCollapse(grp.key)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/50 hover:bg-slate-50/90 border-b border-slate-100 cursor-pointer select-none transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                      aria-label={isCollapsed ? 'Expand category' : 'Collapse category'}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-700" />
                      )}
                    </button>

                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                      <Folder className="w-4.5 h-4.5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                          {grp.name}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {grp.articles.length} {grp.articles.length === 1 ? 'article' : 'articles'}
                        </span>
                        {grp.counts.published > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {grp.counts.published} published
                          </span>
                        )}
                        {grp.counts.draft > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {grp.counts.draft} draft
                          </span>
                        )}
                        {grp.counts.in_review > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {grp.counts.in_review} in review
                          </span>
                        )}
                      </div>

                      {grp.displayName && grp.displayName !== grp.name && (
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Hierarchy:{' '}
                          <span className="text-slate-600 font-semibold">{grp.displayName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div
                    className="flex items-center gap-2 self-end sm:self-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/articles/new?category=${encodeURIComponent(grp.slug || grp.key)}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                      title={`Write a new article in ${grp.name}`}
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>+ New in {grp.name}</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Articles Table */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3.5">Article</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5">Author</th>
                          <th className="px-6 py-3.5">Date</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {grp.articles.map((art) => renderArticleRow(art, false))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat List View: Classic single table */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Article</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Author</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((art) => renderArticleRow(art, true))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardArticles;
