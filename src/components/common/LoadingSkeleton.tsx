import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm animate-pulse p-4">
    <div className="aspect-[16/10] bg-slate-200 rounded-xl mb-4" />
    <div className="h-4 bg-slate-200 rounded w-1/4 mb-3" />
    <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-slate-200 rounded w-full mb-4" />
    <div className="h-3 bg-slate-200 rounded w-1/2" />
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="rounded-2xl aspect-[16/10] bg-slate-200 animate-pulse p-8 flex flex-col justify-end">
    <div className="h-6 bg-slate-300 rounded w-24 mb-4" />
    <div className="h-10 bg-slate-300 rounded w-3/4 mb-4" />
    <div className="h-4 bg-slate-300 rounded w-1/2 mb-4" />
    <div className="h-4 bg-slate-300 rounded w-1/3" />
  </div>
);

export const SidebarSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200/90 p-6 animate-pulse space-y-4">
    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex gap-3 items-center">
        <div className="w-16 h-16 bg-slate-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
