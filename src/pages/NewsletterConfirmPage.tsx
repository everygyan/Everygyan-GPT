import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { confirmSubscription } from '../services/newsletterService';

export const NewsletterConfirmPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setLoading(false);
        setErrorMessage('No confirmation token provided. Please check the link in your email.');
        return;
      }

      setLoading(true);
      const res = await confirmSubscription(token);
      setLoading(false);

      if (res.success) {
        setConfirmed(true);
        setEmail(res.email || null);
      } else {
        setErrorMessage(res.error || 'Failed to verify subscription confirmation token.');
      }
    }

    verify();
  }, [token]);

  return (
    <div className="max-w-xl mx-auto py-16 sm:py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <Mail className="w-8 h-8" />
      </div>

      {loading ? (
        <div className="space-y-3">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">Verifying Your Subscription...</h1>
          <p className="text-xs text-slate-500">Please wait a moment while we validate your confirmation token.</p>
        </div>
      ) : confirmed ? (
        <div className="space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h1 className="text-2xl font-black text-slate-900">Subscription Confirmed!</h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {email ? (
              <>
                <strong className="text-slate-900">{email}</strong> has been successfully subscribed to{' '}
                <strong>EveryGyan Weekly</strong>.
              </>
            ) : (
              'You have been successfully subscribed to EveryGyan Weekly.'
            )}
          </p>
          <p className="text-xs text-slate-400">
            Expect our curated weekend briefing covering travel, technology, health, geopolitics, and enterprise learning.
          </p>
          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-colors"
            >
              <span>Explore Latest Stories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-2xl font-black text-slate-900">Confirmation Failed</h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {errorMessage || 'This confirmation link is invalid, already used, or has expired.'}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterConfirmPage;
