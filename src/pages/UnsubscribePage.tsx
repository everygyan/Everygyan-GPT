import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { unsubscribeFromNewsletter, subscribeToNewsletter } from '../services/newsletterService';
import { SeoHead } from '../components/common/SeoHead';

export const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [tokenInput, setTokenInput] = useState(tokenFromUrl);
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [unsubscribedEmail, setUnsubscribedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resubscribe state
  const [resubscribed, setResubscribed] = useState(false);

  const handleUnsubscribe = async (tokenToUse: string) => {
    if (!tokenToUse.trim()) {
      setErrorMessage('Please enter your unsubscribe token.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await unsubscribeFromNewsletter(tokenToUse.trim());
    setLoading(false);

    if (res.success) {
      setUnsubscribed(true);
      setUnsubscribedEmail(res.email || null);
    } else {
      setErrorMessage(res.error || 'Failed to process unsubscribe request. Token may be invalid or expired.');
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      handleUnsubscribe(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleResubscribe = async () => {
    if (!unsubscribedEmail) return;
    setLoading(true);
    const res = await subscribeToNewsletter(unsubscribedEmail, 'resubscribe_undo');
    setLoading(false);
    if (res.success) {
      setResubscribed(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 sm:py-24 px-4 text-center">
      <SeoHead
        title="Newsletter Preferences & Unsubscribe"
        description="Manage your EveryGyan newsletter subscription preferences or unsubscribe."
        robots="noindex, nofollow"
      />
      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <ShieldCheck className="w-8 h-8 text-slate-800" />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-left">
        {loading ? (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto" />
            <h1 className="text-xl font-bold text-slate-900">Processing Request...</h1>
            <p className="text-xs text-slate-500">Updating your audience preferences in real-time.</p>
          </div>
        ) : resubscribed ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h1 className="text-2xl font-black text-slate-900">Subscription Reactivated</h1>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              A verification email has been sent to confirm you wish to receive future issues of EveryGyan Weekly.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        ) : unsubscribed ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-slate-700 mx-auto" />
            <h1 className="text-2xl font-black text-slate-900">You Are Unsubscribed</h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {unsubscribedEmail ? (
                <>
                  <strong className="text-slate-900">{unsubscribedEmail}</strong> has been successfully removed from{' '}
                  <strong>EveryGyan Weekly</strong> broadcasts.
                </>
              ) : (
                'Your email address has been unsubscribed from our weekly newsletter.'
              )}
            </p>
            <p className="text-xs text-slate-400">
              You will not receive further marketing emails from us. Account notifications and system receipts remain unchanged.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResubscribe}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-subscribe by mistake?</span>
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to EveryGyan</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Newsletter Preferences</h1>
              <p className="text-xs text-slate-500 mt-1">
                Opt-out from EveryGyan Weekly editorial newsletters at any time without logging in.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUnsubscribe(tokenInput);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="unsub_token" className="block text-xs font-semibold text-slate-700 mb-1">
                  Unsubscribe Token
                </label>
                <input
                  id="unsub_token"
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste the token from the footer of your email"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link to="/" className="text-xs text-slate-500 hover:text-slate-900 font-semibold">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Unsubscribe
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnsubscribePage;
