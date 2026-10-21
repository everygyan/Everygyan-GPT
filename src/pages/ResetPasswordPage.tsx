import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SeoHead } from '../components/common/SeoHead';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setStatus('error');
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');
    const { error } = await updatePassword(password);
    if (error) {
      setStatus('error');
      setErrorMessage(error);
    } else {
      setStatus('success');
      setTimeout(() => navigate('/'), 2500);
    }
  };

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto px-4">
      <SeoHead
        title="Reset Password"
        description="Choose a secure new password for your EveryGyan account."
        robots="noindex, nofollow"
      />
      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-block mb-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Every<span className="text-red-600">Gyan</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose a secure password for your EveryGyan account.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Password Updated!</h2>
            <p className="text-xs text-slate-600">
              Your password has been changed successfully. Redirecting you to the home page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {status === 'error' && (
              <div className="p-3 bg-red-50 rounded-xl text-xs text-red-600 border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors"
            >
              {status === 'loading' ? 'Saving...' : 'Update Password'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel and return home</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
