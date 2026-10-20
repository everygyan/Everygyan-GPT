import React from 'react';
import { BookOpen, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { SeoHead } from '../components/common/SeoHead';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 sm:py-16">
      <SeoHead
        title="About Us — Our Mission & Editorial Standards"
        description="EveryGyan was founded on the belief that authoritative, practical, and inspiring knowledge should be accessible to everyone, everywhere without paywalls."
        canonicalUrl="/about"
      />
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-2">
          Our Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Knowledge for Everyone, Everywhere
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          EveryGyan was founded on the belief that authoritative, practical, and inspiring information should be universally accessible without paywalls or sensationalism.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Enterprise Learning</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hands-on tutorials for modern enterprise technologies, cloud architectures, and practical SAP workflows.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Family Travel Guides</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Real, tried-and-tested itineraries crafted specifically for families seeking safe, culturally rich experiences.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Editorial Integrity</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Fact-checked insights, clear citations, and transparent disclosures across all published topics.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl my-10">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Our Editorial Standards</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Independent, Research-Led Journalism
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          We do not invent travel facts, prices, visa rules, or technical benchmarks. When artificial intelligence or automated workflows assist in drafting content, every piece undergoes thorough human review by experienced editors before publication.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
