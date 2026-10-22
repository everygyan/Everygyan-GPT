import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Inbox, Users, Send, ArrowRight, PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { fetchEditorialArticles } from '../../services/cmsService';
import { Article } from '../../types';

export const DashboardHome: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [articlesCount, setArticlesCount] = useState<number>(0);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [messagesCount, setMessagesCount] = useState<number>(0);
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [campaignsCount, setCampaignsCount] = useState<number>(0);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  useEffect(() => {
    async function loadDashboardMetrics() {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          // Fetch live counts and live articles concurrently
          const [artRes, comRes, subRes, campRes, msgRes, editorialArticles] = await Promise.all([
            supabase.from('articles').select('*', { count: 'exact', head: true }),
            supabase.from('comments').select('*', { count: 'exact', head: true }),
            supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
            supabase.from('newsletter_campaigns').select('*', { count: 'exact', head: true }),
            supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
            fetchEditorialArticles(),
          ]);

          setArticlesCount(artRes.count ?? editorialArticles.length);
          setCommentsCount(comRes.count ?? 0);
          setSubscribersCount(subRes.count ?? 0);
          setCampaignsCount(campRes.count ?? 0);
          setMessagesCount(msgRes?.count ?? 0);
          setRecentArticles(editorialArticles.slice(0, 5));
        } else {
          const editorialArticles = await fetchEditorialArticles();
          setArticlesCount(editorialArticles.length);
          setCommentsCount(0);
          setSubscribersCount(0);
          setCampaignsCount(0);
          setMessagesCount(0);
          setRecentArticles(editorialArticles.slice(0, 5));
        }
      } catch (err) {
        console.error('[DashboardHome] Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardMetrics();
  }, []);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Admin';

  const stats = [
    {
      name: 'Total Articles',
      value: articlesCount.toString(),
      change: `${articlesCount} live in database`,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/dashboard/articles',
    },
    {
      name: 'Comments',
      value: commentsCount.toString(),
      change: commentsCount > 0 ? `${commentsCount} active in moderation` : '0 comments submitted',
      icon: MessageSquare,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      link: '/dashboard/comments',
    },
    {
      name: 'Inquiries',
      value: messagesCount.toString(),
      change: messagesCount > 0 ? `${messagesCount} reader messages` : '0 inquiries received',
      icon: Inbox,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      link: '/dashboard/messages',
    },
    {
      name: 'Subscribers',
      value: subscribersCount.toString(),
      change: subscribersCount > 0 ? `${subscribersCount} confirmed readers` : 'Audience starting',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      link: '/dashboard/subscribers',
    },
    {
      name: 'Newsletters',
      value: campaignsCount.toString(),
      change: campaignsCount > 0 ? `${campaignsCount} campaigns created` : 'No campaigns yet',
      icon: Send,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/dashboard/newsletter',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {displayName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your content, review live reader activity, and publish new editorial tutorials.
          </p>
        </div>
        <Link
          to="/dashboard/articles"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                  {stat.name}
                </span>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                {loading ? (
                  <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                )}
                <p className="text-[11px] font-semibold text-slate-500 mt-1">{stat.change}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Articles</h2>
            <p className="text-xs text-slate-400 mt-0.5">Live content published on EveryGyan</p>
          </div>
          <Link
            to="/dashboard/articles"
            className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Article Title</th>
                <th className="px-6 py-3.5">Published Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading live articles from Supabase...</span>
                  </td>
                </tr>
              ) : recentArticles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                    <p className="font-semibold text-slate-700">No articles found in the database.</p>
                    <p className="text-xs text-slate-400 mt-1">Click "New Article" above to publish your first story.</p>
                  </td>
                </tr>
              ) : (
                recentArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to="/dashboard/articles"
                        className="font-semibold text-slate-900 hover:text-red-600 transition-colors line-clamp-1"
                      >
                        {art.title}
                      </Link>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        {art.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {art.published_at || 'Recently'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          art.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : art.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700 whitespace-nowrap">
                      {art.views_count ? art.views_count.toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
