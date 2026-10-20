import React, { useState, useEffect, useCallback } from 'react';
import {
  Check,
  X,
  AlertTriangle,
  Trash2,
  Search,
  MessageSquare,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Comment, CommentStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchCommentsForModeration,
  updateCommentStatus,
  deleteComment,
} from '../../services/commentService';

export const DashboardComments: React.FC = () => {
  const { role } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Notifications
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadComments = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await fetchCommentsForModeration(
          {
            status: selectedStatus,
            search: searchTerm,
          },
          page,
          15
        );
        setComments(res.comments);
        setTotalCount(res.total);
        setCurrentPage(res.page);
        setTotalPages(res.totalPages);
      } catch (err: unknown) {
        console.error('Failed to load moderation comments:', err);
        setActionError('Failed to load comments from the moderation queue.');
      } finally {
        setLoading(false);
      }
    },
    [selectedStatus, searchTerm]
  );

  useEffect(() => {
    loadComments(1);
  }, [loadComments]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadComments(1);
  };

  const handleStatusUpdate = async (commentId: string, newStatus: CommentStatus) => {
    setProcessingId(commentId);
    setActionError(null);
    setActionSuccess(null);

    const { success, error } = await updateCommentStatus(commentId, newStatus, role);
    setProcessingId(null);

    if (error) {
      setActionError(error);
    } else if (success) {
      setActionSuccess(`Comment updated to "${newStatus}".`);
      // Update local state or reload
      setComments((prev) =>
        prev
          .map((c) => (c.id === commentId ? { ...c, status: newStatus } : c))
          .filter((c) => selectedStatus === 'all' || c.status === selectedStatus)
      );
      setTotalCount((prev) => (selectedStatus === 'all' ? prev : Math.max(0, prev - 1)));
    }
  };

  const handleDelete = async (commentId: string, authorName: string) => {
    if (!window.confirm(`Permanently delete comment from "${authorName}"? This cannot be undone.`)) {
      return;
    }

    setProcessingId(commentId);
    setActionError(null);
    setActionSuccess(null);

    const { success, error } = await deleteComment(commentId, role);
    setProcessingId(null);

    if (error) {
      setActionError(error);
    } else if (success) {
      setActionSuccess('Comment permanently deleted.');
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    }
  };

  const statusBadge = (status: CommentStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Rejected
          </span>
        );
      case 'spam':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Spam
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Comment Moderation</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review, approve, reject, or flag reader comments before they appear on live articles.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-xl text-slate-600 self-start sm:self-auto">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>Moderator Guard Active</span>
        </div>
      </div>

      {/* Notification Banners */}
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-500 hover:text-emerald-700 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search comments or author..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </form>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 w-full md:w-auto">
          {['pending', 'approved', 'rejected', 'spam', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                selectedStatus === st
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
            <p className="text-xs text-slate-400">Loading moderation queue...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Queue is clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no submissions currently matching status "{selectedStatus}".
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {comments.map((cmt) => (
              <div
                key={cmt.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
                      {cmt.author_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm text-slate-900">{cmt.author_name}</span>
                    <span className="text-xs text-slate-400">• {formatDate(cmt.created_at)}</span>
                    {statusBadge(cmt.status)}
                  </div>

                  {cmt.article_title && (
                    <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>On: {cmt.article_title}</span>
                    </p>
                  )}

                  {/* Comment Content - safely rendered as pure text */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {cmt.content}
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-start pt-2 md:pt-0">
                  {cmt.status !== 'approved' && (
                    <button
                      type="button"
                      disabled={processingId === cmt.id}
                      onClick={() => handleStatusUpdate(cmt.id, 'approved')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                      title="Approve for public view"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {cmt.status !== 'rejected' && (
                    <button
                      type="button"
                      disabled={processingId === cmt.id}
                      onClick={() => handleStatusUpdate(cmt.id, 'rejected')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      title="Reject submission"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  {cmt.status !== 'spam' && (
                    <button
                      type="button"
                      disabled={processingId === cmt.id}
                      onClick={() => handleStatusUpdate(cmt.id, 'spam')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      title="Flag as spam"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Spam</span>
                    </button>
                  )}

                  {(role === 'moderator' || role === 'admin') && (
                    <button
                      type="button"
                      disabled={processingId === cmt.id}
                      onClick={() => handleDelete(cmt.id, cmt.author_name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Permanently Delete Comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {comments.length} of {totalCount} submissions
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => loadComments(currentPage - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => loadComments(currentPage + 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardComments;
