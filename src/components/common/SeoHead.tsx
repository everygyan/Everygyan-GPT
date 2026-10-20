import React, { useEffect } from 'react';

export interface SeoHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  robots?: 'index, follow' | 'noindex, nofollow' | 'noindex, follow';
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
}

export const SITE_URL = 'https://everygyan.com';
export const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=75';

/**
 * Sets or updates a <meta> element in document.head
 */
function setMetaTag(selector: string, attributeName: string, attributeValue: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Sets or updates a <link> element in document.head
 */
function setLinkTag(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Dependency-free, lightweight Head and Meta manager for technical SEO, Open Graph,
 * canonical links, and Schema.org structured data.
 */
export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  robots = 'index, follow',
  structuredData,
  publishedAt,
  updatedAt,
  authorName,
  category,
  tags,
}) => {
  useEffect(() => {
    // 1. Document Title
    const fullTitle = title.includes('EveryGyan')
      ? title
      : `${title} | EveryGyan — Knowledge for Everyone, Everywhere`;
    document.title = fullTitle;

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="robots"]', 'name', 'robots', robots);

    // 3. Canonical Link
    const fullCanonical = canonicalUrl
      ? canonicalUrl.startsWith('http')
        ? canonicalUrl
        : `${SITE_URL}${canonicalUrl.startsWith('/') ? canonicalUrl : `/${canonicalUrl}`}`
      : `${SITE_URL}${window.location.pathname}`;
    setLinkTag('canonical', fullCanonical);

    // 4. Open Graph (Facebook / LinkedIn / Slack)
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', fullCanonical);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'EveryGyan');

    // 5. Twitter Card
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    // 6. Article-Specific Meta Tags
    if (ogType === 'article') {
      if (publishedAt) {
        setMetaTag('meta[property="article:published_time"]', 'property', 'article:published_time', publishedAt);
      }
      if (updatedAt) {
        setMetaTag('meta[property="article:modified_time"]', 'property', 'article:modified_time', updatedAt);
      }
      if (authorName) {
        setMetaTag('meta[property="article:author"]', 'property', 'article:author', authorName);
      }
      if (category) {
        setMetaTag('meta[property="article:section"]', 'property', 'article:section', category);
      }
      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          setMetaTag(`meta[property="article:tag"][content="${tag}"]`, 'property', 'article:tag', tag);
        });
      }
    }

    // 7. Structured Data (JSON-LD)
    const scriptId = 'schema-structured-data';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (structuredData) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(structuredData);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    // Cleanup: Remove dynamic article tags when unmounting
    return () => {
      if (ogType === 'article') {
        const articleMetas = document.head.querySelectorAll('meta[property^="article:"]');
        articleMetas.forEach((el) => el.remove());
      }
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [
    title,
    description,
    canonicalUrl,
    ogImage,
    ogType,
    robots,
    structuredData,
    publishedAt,
    updatedAt,
    authorName,
    category,
    tags,
  ]);

  return null;
};

export default SeoHead;
