import React from 'react';
import { Check, X } from 'lucide-react';

export const DashboardComments: React.FC = () => {
  const pendingComments = [
    {
      id: 'c1',
      author: 'Rohit Verma',
      article: 'Why Learning SAP Can Boost Your Career',
      content: 'Could you please recommend introductory courses for ABAP on Cloud?',
      date: 'Oct 20, 2026',
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Comment Moderation</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review reader submissions before they appear publicly on article detail pages.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm divide-y divide-slate-100">
        {pendingComments.map((cmt) => (
          <div key={cmt.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{cmt.author}</span>
                <span className="text-xs text-slate-400">• {cmt.date}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">On: {cmt.article}</p>
              <p className="text-sm text-slate-700 pt-1">"{cmt.content}"</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold border border-rose-200">
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardComments;
