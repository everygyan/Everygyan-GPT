import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { subscribeToNewsletter } from '../../services/newsletterService';

export const NewsletterBanner: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    setLoading(true);
    const res = await subscribeToNewsletter(email, 'homepage_banner');
    setLoading(false);

    if (res.success) {
      setSuccessMessage(res.message);
      setEmail('');
    } else {
      setErrorMessage(res.error || res.message || 'Subscription failed. Please verify your email.');
    }
  };

  return (
    <section className="relative rounded-3xl overflow-hidden shadow-xl my-10 sm:my-14 text-white">
      {/* Background Scenic Mountain Landscape with Gradient Tint */}
      <img
        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80"
        alt="Mountain landscape"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]" />

      {/* Content Grid */}
      <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Headline & Form */}
        <div className="w-full md:max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 text-red-300 text-xs font-semibold mb-3 border border-red-500/30">
            <Mail className="w-3.5 h-3.5" />
            <span>Weekly Editorial Digest</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Join Our Newsletter
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mb-6 font-normal">
            Get the latest articles, updates and travel tips directly in your inbox.
          </p>

          {successMessage ? (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-start gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto md:mx-0">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md border-0"
                  aria-label="Email address for newsletter"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? 'Joining...' : 'Subscribe'}</span>
              </button>
            </form>
          )}

          {errorMessage && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-300">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          <p className="mt-3 text-[11px] text-slate-400">
            Double opt-in verified. Unsubscribe anytime with one click.
          </p>
        </div>

        {/* Right Script Accent Badge */}
        <div className="hidden md:flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <p className="font-serif italic text-xl lg:text-2xl text-slate-200 tracking-wide">
            Stay informed
          </p>
          <p className="font-serif italic text-xl lg:text-2xl text-red-400 font-bold mt-1">
            Stay inspired!
          </p>
          <span className="text-2xl mt-2 animate-bounce">✈</span>
        </div>
      </div>
    </section>
  );
};

export default NewsletterBanner;
