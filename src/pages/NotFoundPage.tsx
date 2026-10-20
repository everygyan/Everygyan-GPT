import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { SeoHead } from '../components/common/SeoHead';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-28 text-center max-w-md mx-auto">
      <SeoHead
        title="Page Not Found (404)"
        description="The page you requested could not be found on EveryGyan."
        robots="noindex, nofollow"
      />
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-600 mb-8 leading-relaxed">
        The destination or article you are looking for doesn't exist, has been archived, or moved to a new address.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 shadow-md transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
