import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-lg text-center max-w-md w-full">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-600 mb-6">
            You must be signed in to access the EveryGyan editorial workspace.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  // Role verification check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="py-16 px-4 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          Your current account role is <span className="font-bold text-slate-900 uppercase">[{role}]</span>.
          This section requires one of the following roles:
        </p>
        <div className="flex justify-center gap-2 mb-6">
          {allowedRoles.map((r) => (
            <span
              key={r}
              className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs uppercase"
            >
              {r}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400 mb-6">
          To request contributor or editor access, please contact an EveryGyan administrator.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
