import React from 'react';
import { SeoHead } from '../components/common/SeoHead';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 sm:py-16 prose prose-slate">
      <SeoHead
        title="Terms and Conditions"
        description="EveryGyan terms of service, community guidelines, editorial notices, and intellectual property conditions."
        canonicalUrl="/terms"
      />
      <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-2 not-prose">
        Legal Notice
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-6">
        Terms & Conditions
      </h1>
      <p className="text-sm text-slate-500 mb-8 not-prose">
        Last updated: October 20, 2026
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By visiting EveryGyan (the "Platform"), you agree to abide by these Terms and Conditions and our community guidelines.
      </p>

      <h2>2. Editorial and Informational Content</h2>
      <p>
        Articles, tutorials, travel guides, and technical analyses published on EveryGyan are provided for informational and educational purposes. While we strive for accuracy, users should verify critical travel requirements, visa regulations, or production software configurations independently.
      </p>

      <h2>3. Community Conduct</h2>
      <p>
        Commenters must maintain civil, respectful discourse. Hate speech, automated spam, commercial advertising, or malicious code injection will result in immediate rejection and potential account termination.
      </p>
    </div>
  );
};

export default TermsPage;
