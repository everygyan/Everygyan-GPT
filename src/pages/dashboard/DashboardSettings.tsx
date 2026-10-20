import React from 'react';
import { User } from 'lucide-react';

export const DashboardSettings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Platform Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your editorial profile and communication preferences.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <User className="w-5 h-5 text-red-600" />
          <h2 className="text-base font-bold text-slate-900">Author Profile</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              defaultValue="Sandeep"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Author Bio</label>
            <textarea
              defaultValue="Lead Travel & Tech Editor at EveryGyan."
              rows={3}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold">
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettings;
