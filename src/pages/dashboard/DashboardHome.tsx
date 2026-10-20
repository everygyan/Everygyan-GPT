import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Users, Send, ArrowRight, PlusCircle } from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const stats = [
    { name: 'My Articles', value: '12', change: '+2 this week', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Comments', value: '8', change: '+1 this week', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Subscribers', value: '156', change: '+15 this week', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Newsletters', value: '3', change: 'Last sent: Oct 18, 2026', icon: Send, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const recentArticles = [
    {
      id: '1',
      title: '10 Amazing Places to Visit in Europe with Family',
      date: 'Oct 20, 2026',
      status: 'Published',
      views: '2,480',
    },
    {
      id: '2',
      title: 'Best Laptops for Students in 2026',
      date: 'Oct 19, 2026',
      status: 'Draft',
      views: '-',
    },
    {
      id: '3',
      title: 'Why Learning SAP Can Boost Your Career',
      date: 'Oct 17, 2026',
      status: 'Published',
      views: '1,890',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, Sandeep
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your content, review subscriber activity, and stay connected with your audience.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">{stat.name}</span>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-[11px] font-semibold text-emerald-600 mt-1">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Articles</h2>
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
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentArticles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{art.title}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{art.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        art.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {art.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700">{art.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
