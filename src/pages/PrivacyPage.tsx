import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 sm:py-16 prose prose-slate">
      <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-2 not-prose">
        Legal & Privacy
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-6">
        Privacy Policy
      </h1>
      <p className="text-sm text-slate-500 mb-8 not-prose">
        Last updated: October 20, 2026
      </p>

      <h2>1. Overview and Commitment</h2>
      <p>
        EveryGyan ("we", "our", or "us") respects your privacy. This policy outlines how we collect, store, and process personal data when you browse our website, subscribe to our newsletter, submit comments, or register an account.
      </p>

      <h2>2. Information We Collect</h2>
      <ul>
        <li>
          <strong>Newsletter Subscriptions:</strong> When you subscribe to our newsletter, we collect your email address and recording timestamp to provide weekly editorial editions.
        </li>
        <li>
          <strong>Reader Accounts:</strong> For authenticated readers and contributors, we store your email address, username/display name, and hashed credentials securely via Supabase Auth.
        </li>
        <li>
          <strong>Comments:</strong> Names and comments submitted to public articles are stored and moderated before publication.
        </li>
      </ul>

      <h2>3. How We Use Information</h2>
      <p>
        We do not sell, rent, or trade your personal email address or identifiable records to any third parties for marketing purposes. Data is used exclusively to deliver subscribed publications and manage website interaction.
      </p>

      <h2>4. Unsubscribe and Data Deletion</h2>
      <p>
        You may unsubscribe from our newsletter at any time using the one-click unsubscribe link included in the footer of every email broadcast, or by contacting our team.
      </p>
    </div>
  );
};

export default PrivacyPage;
