import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ShieldCheck, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Loader2, User } from 'lucide-react';
import { Comment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { fetchApprovedComments, submitComment } from '../../services/commentService';

interface CommentSectionProps {
  articleId: string;
  articleTitle?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId, articleTitle }) => {
  const { user, profile } = useAuth();

  // Comment list state
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingComments, setLoadingComments] = useState(true);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot
  const [formRenderedAt, setFormRenderedAt] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Initialize form render time and prefill user name
  useEffect(() => {
    setFormRenderedAt(Date.now());
    if (user && profile?.full_name) {
      setAuthorName(profile.full_name);
    } else if (user && user.email) {
      setAuthorName(user.email.split('@')[0]);
    }
  }, [user, profile]);

  // Load approved comments
  const loadComments = useCallback(async (page: number) => {
    setLoadingComments(true);
    try {
      const res = await fetchApprovedComments(articleId, page, 10);
      setComments(res.comments);
      setTotalCount(res.total);
      setCurrentPage(res.page);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load approved comments:', err);
    } finally {
      setLoadingComments(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadComments(1);
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!authorName.trim()) {
      setSubmitError('Please enter your name.');
      return;
    }

    if (content.trim().length < 3) {
      setSubmitError('Comment must be at least 3 characters long.');
      return;
    }

    if (content.length > 1000) {
      setSubmitError('Comment cannot exceed 1,000 characters.');
      return;
    }

    setSubmitting(true);

    const { data, error } = await submitComment(
      {
        articleId,
        articleTitle,
        authorName,
        content,
        honeypot,
        formRenderedAt,
      },
      user ? { id: user.id, name: profile?.full_name || user.email || 'Reader' } : null
    );

    setSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    if (data) {
      setSubmitSuccess(true);
      setContent('');
      // If guest, keep author name for convenience; reset honeypot
      setHoneypot('');
      setFormRenderedAt(Date.now());
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <section className="my-12 pt-8 border-t border-slate-200" aria-label="Comments">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-red-600" />
          <h3 className="text-xl font-bold text-slate-900">
            Comments ({totalCount})
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Showing approved reader feedback
        </span>
      </div>

      {/* Existing Approved Comments List */}
      <div className="space-y-4 mb-8">
        {loadingComments ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
            <p className="text-xs text-slate-400">Loading reader discussion...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <p className="text-sm font-medium text-slate-600">No public comments yet.</p>
            <p className="text-xs text-slate-400 mt-1">Be the first to share your thoughts on this story below.</p>
          </div>
        ) : (
          comments.map((cmt) => (
            <div key={cmt.id} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                    {cmt.author_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm text-slate-900">{cmt.author_name}</span>
                </div>
                <span className="text-xs text-slate-400">{formatDate(cmt.created_at)}</span>
              </div>
              {/* Safe text rendering: React automatically escapes HTML entities, never interprets as markup */}
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{cmt.content}</p>
            </div>
          ))
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => loadComments(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => loadComments(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Submission Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-base font-bold text-slate-900">Join the Conversation</h4>
          {user ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <User className="w-3 h-3" />
              <span>Signed in as {profile?.full_name || user.email}</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">Guest commenting enabled</span>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-4">
          All reader comments are vetted by our editorial team prior to public display. Respectful discourse is welcomed.
        </p>

        {submitSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Thank you! Your comment has been received and is pending moderation review.</span>
            </div>
            <button
              type="button"
              onClick={() => setSubmitSuccess(false)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{submitError}</span>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Honeypot field - invisible to human visitors, lures automated spam bots */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="hp_website">Do not fill this field</label>
            <input
              type="text"
              id="hp_website"
              name="hp_website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="comment_author" className="block text-xs font-semibold text-slate-700 mb-1">
              Your Name
            </label>
            <input
              id="comment_author"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g., Ananya Deshmukh"
              required
              maxLength={60}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="comment_content" className="block text-xs font-semibold text-slate-700">
                Comment Body
              </label>
              <span className="text-[11px] text-slate-400">
                {content.length}/1000 characters
              </span>
            </div>
            <textarea
              id="comment_content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your constructive perspective or feedback..."
              required
              rows={3}
              maxLength={1000}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Spam filters & moderation queue enabled</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer self-end sm:self-auto"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? 'Submitting...' : 'Submit for Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CommentSection;
