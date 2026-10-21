import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Search,
  Users,
  CheckCircle2,
  Clock,
  UserX,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { NewsletterSubscription, SubscriptionStatus } from '../../types';
import {
  fetchSubscribersForAdmin,
  exportSubscribersCsv,
  adminConfirmSubscriber,
  adminUnsubscribeSubscriber,
} from '../../services/newsletterService';

export const DashboardSubscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchSubscribersForAdmin({
        status: selectedStatus,
        search: searchTerm,
      });
      setSubscribers(data);
    } catch (err: unknown) {
      console.error('Failed to load subscribers:', err);
      setErrorMessage('Failed to fetch subscribers from database.');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchTerm]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const handleExportCsv = () => {
    const csvContent = exportSubscribersCsv(subscribers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `everygyan-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmSubscriber = async (sub: NewsletterSubscription) => {
    setActionLoadingId(sub.id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await adminConfirmSubscriber(sub.id);
      if (!res.success) {
        setErrorMessage(res.error || `Failed to confirm ${sub.email}.`);
      } else {
        const confirmedAt = new Date().toISOString();
        setSuccessMessage(`Successfully confirmed subscriber: ${sub.email}`);
        setSubscribers((prev) =>
          prev.map((s) =>
            s.id === sub.id
              ? { ...s, status: 'confirmed', confirmed_at: confirmedAt }
              : s
          )
        );
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Unexpected error during confirmation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnsubscribeSubscriber = async (sub: NewsletterSubscription) => {
    if (!window.confirm(`Are you sure you want to unsubscribe ${sub.email}?`)) {
      return;
    }
    setActionLoadingId(sub.id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await adminUnsubscribeSubscriber(sub.id);
      if (!res.success) {
        setErrorMessage(res.error || `Failed to unsubscribe ${sub.email}.`);
      } else {
        setSuccessMessage(`Successfully unsubscribed: ${sub.email}`);
        setSubscribers((prev) =>
          prev.map((s) =>
            s.id === sub.id
              ? { ...s, status: 'unsubscribed' }
              : s
          )
        );
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Unexpected error during unsubscribe.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const statusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        );
      case 'pending_confirmation':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Pending Opt-in
          </span>
        );
      case 'unsubscribed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Unsubscribed
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Metrics
  const totalSubscribers = subscribers.length;
  const confirmedCount = subscribers.filter((s) => s.status === 'confirmed').length;
  const pendingCount = subscribers.filter((s) => s.status === 'pending_confirmation').length;
  const unsubscribedCount = subscribers.filter((s) => s.status === 'unsubscribed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Newsletter Subscribers</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audience records, double opt-in confirmation states, and unsubscribe tracking.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={subscribers.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total In Database</p>
            <p className="text-xl font-black text-slate-900">{totalSubscribers}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active Confirmed</p>
            <p className="text-xl font-black text-slate-900">{confirmedCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Opt-in</p>
            <p className="text-xl font-black text-slate-900">{pendingCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unsubscribed</p>
            <p className="text-xl font-black text-slate-900">{unsubscribedCount}</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-800 font-bold ml-2 text-xs cursor-pointer"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-2 text-xs cursor-pointer"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 w-full md:w-auto">
          {['all', 'confirmed', 'pending_confirmation', 'unsubscribed'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                selectedStatus === st
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
            <p className="text-xs text-slate-400">Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No subscribers found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no subscribers matching status "{selectedStatus}".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Email Address</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Source</th>
                  <th className="px-6 py-3.5">Consent Date</th>
                  <th className="px-6 py-3.5">Confirmed Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{sub.email}</td>
                    <td className="px-6 py-4">{statusBadge(sub.status)}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{sub.consent_source}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(sub.consent_at)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(sub.confirmed_at)}</td>
                    <td className="px-6 py-4 text-right">
                      {actionLoadingId === sub.id ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                          <span>Updating...</span>
                        </div>
                      ) : sub.status === 'pending_confirmation' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleConfirmSubscriber(sub)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                            title="Manually confirm subscriber"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => handleUnsubscribeSubscriber(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            title="Mark as unsubscribed"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Unsubscribe</span>
                          </button>
                        </div>
                      ) : sub.status === 'confirmed' ? (
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleUnsubscribeSubscriber(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            title="Unsubscribe member"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Unsubscribe</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleConfirmSubscriber(sub)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            title="Re-activate and confirm subscriber"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Re-confirm</span>
                          </button>
                        </div>
                      )}
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

export default DashboardSubscribers;
