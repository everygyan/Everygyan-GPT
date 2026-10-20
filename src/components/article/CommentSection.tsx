import React, { useState } from 'react';
import { MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Comment } from '../../types';

interface CommentSectionProps {
  articleId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId: _articleId }) => {
  const [comments] = useState<Comment[]>([
    {
      id: 'cmt-1',
      article_id: 'art-lead-1',
      author_name: 'Priya Sharma',
      content: 'Vienna and Hallstatt are absolutely wonderful for young kids. The salt mine slides were an unforgettable highlight!',
      status: 'approved',
      created_at: 'Oct 20, 2026',
    },
  ]);

  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) return;

    setSubmitted(true);
    setContent('');
    setAuthorName('');
  };

  return (
    <section className="my-12 pt-8 border-t border-slate-200" aria-label="Comments">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-red-600" />
        <h3 className="text-xl font-bold text-slate-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Existing Comments */}
      <div className="space-y-4 mb-8">
        {comments.map((cmt) => (
          <div key={cmt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-slate-900">{cmt.author_name}</span>
              <span className="text-xs text-slate-400">{cmt.created_at}</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{cmt.content}</p>
          </div>
        ))}
      </div>

      {/* Submission Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <h4 className="text-base font-bold text-slate-900 mb-1">Join the Conversation</h4>
        <p className="text-xs text-slate-500 mb-4">
          All submissions are reviewed by our editorial team prior to publication.
        </p>

        {submitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Thank you! Your comment has been submitted and is pending moderation.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your Name"
                required
                maxLength={50}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your respectful thoughts or travel tips..."
                required
                rows={3}
                maxLength={1000}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Anti-spam & moderation enabled</span>
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-sm"
              >
                Submit Comment
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default CommentSection;
