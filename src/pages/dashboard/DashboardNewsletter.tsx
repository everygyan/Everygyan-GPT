import React from 'react';
import { PlusCircle } from 'lucide-react';

export const DashboardNewsletter: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Newsletter Campaigns</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compose weekly letters, preview recipient layouts, and track send queues.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-2">Campaign Queue Status</h2>
        <p className="text-xs text-slate-500 mb-4">
          All broadcast schedules strictly respect Hostinger email plan rate limits.
        </p>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">Issue #14 — October Highlights</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Sent on Oct 18, 2026 to 156 confirmed subscribers</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Delivered
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardNewsletter;
