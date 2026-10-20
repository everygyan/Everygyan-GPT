import React from 'react';
import { Download } from 'lucide-react';

export const DashboardSubscribers: React.FC = () => {
  const subscribers = [
    { email: 'reader1@example.com', date: 'Oct 20, 2026', status: 'Confirmed' },
    { email: 'traveler@everygyan.com', date: 'Oct 19, 2026', status: 'Confirmed' },
    { email: 'techfan@sample.org', date: 'Oct 18, 2026', status: 'Confirmed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Newsletter Subscribers</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audience records, double opt-in confirmation states, and unsubscribe tracking.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-colors">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3.5">Email Address</th>
              <th className="px-6 py-3.5">Subscription Date</th>
              <th className="px-6 py-3.5">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscribers.map((sub, i) => (
              <tr key={i} className="hover:bg-slate-50/80">
                <td className="px-6 py-4 font-semibold text-slate-900">{sub.email}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{sub.date}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {sub.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardSubscribers;
