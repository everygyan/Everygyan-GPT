/**
 * EveryGyan Sitemap Generator
 * Generates public/sitemap.xml strictly for published, indexable routes.
 *
 * Excludes:
 * - /dashboard/* (editorial / admin routes)
 * - /search (search queries and dynamic filtered parameter URLs)
 * - /reset-password (authenticated utility)
 * - /unsubscribe, /newsletter/confirm (transactional token URLs)
 * - 404 / not found
 * - Draft, scheduled, or archived articles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const BASE_URL = 'https://everygyan.com';
const TODAY = '2026-10-20';

// Indexable static pages
const STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { path: '/terms', priority: '0.5', changefreq: 'yearly' },
];

// Published categories
const CATEGORIES = [
  'tech',
  'health',
  'geopolitics',
  'sports',
  'travel',
  'learning',
];

// Curated published tags
const TAGS = [
  'ai',
  'productivity',
  'technology',
  'wellness',
  'habits',
  'mental-health',
  'trade',
  'economy',
  'policy',
  'cricket',
  't20',
  'world-cup',
  'laptops',
  'students',
  'hardware',
  'reviews',
  'beaches',
  'india',
  'europe',
  'family-travel',
  'austria',
  'switzerland',
  'budget-travel',
  'sap',
  'erp',
  'enterprise',
  'career',
];

// Articles strictly published and indexable
const PUBLISHED_ARTICLES = [
  { slug: '10-amazing-places-to-visit-in-europe-with-family', lastmod: '2026-10-20' },
  { slug: 'the-future-of-ai-how-gemini-is-changing-the-way-we-work', lastmod: '2026-10-20' },
  { slug: 'simple-habits-for-a-healthier-and-happier-life', lastmod: '2026-10-19' },
  { slug: 'whats-next-for-global-trade-in-2026', lastmod: '2026-10-18' },
  { slug: 'indias-journey-in-the-t20-world-cup', lastmod: '2026-10-17' },
  { slug: 'best-laptops-for-students-in-2026-under-70000', lastmod: '2026-10-19' },
  { slug: 'top-5-beaches-in-india-for-a-perfect-getaway', lastmod: '2026-10-18' },
  { slug: 'why-learning-sap-can-boost-your-career', lastmod: '2026-10-17' },
];

export function buildSitemapXml() {
  const urls = [];

  // 1. Static pages
  for (const page of STATIC_PAGES) {
    const loc = page.path ? `${BASE_URL}${page.path}` : `${BASE_URL}/`;
    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // 2. Categories
  for (const cat of CATEGORIES) {
    urls.push(`  <url>
    <loc>${BASE_URL}/category/${cat}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  // 3. Articles (published only)
  for (const art of PUBLISHED_ARTICLES) {
    urls.push(`  <url>
    <loc>${BASE_URL}/article/${art.slug}</loc>
    <lastmod>${art.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`);
  }

  // 4. Tags
  for (const tag of TAGS) {
    urls.push(`  <url>
    <loc>${BASE_URL}/tag/${encodeURIComponent(tag)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

export function writeSitemap() {
  const xml = buildSitemapXml();
  const outputPath = path.resolve(projectRoot, 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`[SEO] sitemap.xml generated successfully at ${outputPath}`);
}

// Execute when invoked directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeSitemap();
}
