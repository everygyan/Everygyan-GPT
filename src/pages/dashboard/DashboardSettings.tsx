import React, { useState } from 'react';
import { User, Lock, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardSettings: React.FC = () => {
  const { profile, role, updateProfile, updatePassword } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [profileMsg, setProfileMsg] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus('loading');
    const { error } = await updateProfile({ full_name: fullName, bio });
    if (error) {
      setProfileStatus('error');
      setProfileMsg(error);
    } else {
      setProfileStatus('success');
      setProfileMsg('Profile updated successfully.');
      setTimeout(() => setProfileStatus('idle'), 3000);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setPasswordStatus('error');
      setPasswordMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordMsg('Passwords do not match.');
      return;
    }

    setPasswordStatus('loading');
    const { error } = await updatePassword(password);
    if (error) {
      setPasswordStatus('error');
      setPasswordMsg(error);
    } else {
      setPasswordStatus('success');
      setPasswordMsg('Password updated successfully.');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Security Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your editorial identity, security credentials, and communication preferences.
        </p>
      </div>

      {/* Role & Permissions Badge Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Assigned Account Role</h2>
            <p className="text-xs text-slate-500">Enforced by Supabase Row Level Security</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
          {role}
        </span>
      </div>

      {/* Profile Details Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold text-slate-900">Profile Information</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Author Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief professional or editorial bio..."
              rows={3}
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {profileStatus === 'success' && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{profileMsg}</span>
            </div>
          )}

          {profileStatus === 'error' && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{profileMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={profileStatus === 'loading'}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            {profileStatus === 'loading' ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Lock className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold text-slate-900">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {passwordStatus === 'success' && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{passwordMsg}</span>
            </div>
          )}

          {passwordStatus === 'error' && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{passwordMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={passwordStatus === 'loading'}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            {passwordStatus === 'loading' ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardSettings;
