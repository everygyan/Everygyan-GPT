import React from 'react';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { SEED_ARTICLES } from '../../data/seedData';

export const DashboardArticles: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Article Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, edit, preview, and review publications before scheduling or publishing.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3.5">Title</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {SEED_ARTICLES.map((art) => (
              <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">{art.title}</td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">{art.category}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {art.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">{art.published_at}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs font-semibold text-red-600 hover:text-red-700">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardArticles;
