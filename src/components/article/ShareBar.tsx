import React, { useState } from 'react';
import { Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react';

interface ShareBarProps {
  title: string;
  url?: string;
}

export const ShareBar: React.FC<ShareBarProps> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleLinkedinShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="flex items-center gap-2 text-slate-500">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
        Share
      </span>
      <button
        onClick={handleTwitterShare}
        className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-sky-500 transition-colors"
        aria-label="Share on X (Twitter)"
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button
        onClick={handleFacebookShare}
        className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </button>
      <button
        onClick={handleLinkedinShare}
        className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-700 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </button>
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
        aria-label="Copy article link"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default ShareBar;
