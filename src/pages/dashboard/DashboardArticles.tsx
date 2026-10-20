import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { Article, ArticleStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { fetchEditorialArticles, deleteArticle } from '../../services/cmsService';
import { CATEGORIES } from '../../data/seedData';

export const DashboardArticles: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Article Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author, review, schedule, and publish editorial stories across EveryGyan.
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
            <p className="text-xs text-slate-400">Fetching editorial articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No articles found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no publications matching your filter criteria. Create a new draft to get started.
            </p>
            <button
              onClick={() => navigate('/dashboard/articles/new')}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Write your first article</span>
            </button>
          </div>
        ) : (
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
                {articles.map((art) => (
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
                          <p className="text-[11px] text-slate-400 font-mono">/{art.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {art.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(art.status)}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                      {art.author.name}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {art.published_at || 'Unpublished'}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardArticles;
