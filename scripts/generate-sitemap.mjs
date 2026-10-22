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
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/deals', priority: '0.8', changefreq: 'weekly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { path: '/terms', priority: '0.5', changefreq: 'yearly' },
];

// Published categories
const CATEGORIES = [
  'travel',
  'travel-world',
  'travel-asia',
  'travel-europe',
  'travel-americas',
  'health',
  'news',
  'latest-news',
  'news-world',
  'news-asia',
  'news-europe',
  'news-americas',
  'learn',
  'learn-ai',
  'learn-sap',
  'learn-german',
  'learn-updates',
  'entertainment',
  'entertainment-movies',
  'entertainment-series',
  'entertainment-celeb-news',
  'entertainment-photos',
  'deals',
  'tech',
  'learning',
  'sports',
  'geopolitics',
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
  'japan',
  'tokyo',
  'kyoto',
  'norway',
  'fjords',
  'california',
  'patagonia',
  'german',
  'language-learning',
  'movies',
  'cinema',
  'series',
  'wildlife',
  'photography',
  'deals',
  'travel-gear',
];

// Articles strictly published and indexable
const PUBLISHED_ARTICLES = [
  { slug: 'essential-tips-for-planning-your-first-around-the-world-trip', lastmod: '2026-10-21' },
  { slug: 'sustainable-ecotourism-destinations-redefining-global-travel', lastmod: '2026-10-20' },
  { slug: 'top-5-beaches-in-india-for-a-perfect-getaway', lastmod: '2026-10-18' },
  { slug: 'first-timers-guide-to-exploring-kyoto-and-tokyo-by-shinkansen', lastmod: '2026-10-21' },
  { slug: '10-amazing-places-to-visit-in-europe-with-family', lastmod: '2026-10-20' },
  { slug: 'scenic-norwegian-fjords-by-rail-and-ferry-complete-itinerary', lastmod: '2026-10-21' },
  { slug: 'ultimate-pacific-coast-highway-road-trip-guide', lastmod: '2026-10-21' },
  { slug: 'exploring-patagonia-a-complete-guide-to-torres-del-paine', lastmod: '2026-10-20' },
  { slug: 'simple-habits-for-a-healthier-and-happier-life', lastmod: '2026-10-19' },
  { slug: 'the-science-of-circadian-rhythms-optimizing-sleep-and-energy', lastmod: '2026-10-21' },
  { slug: 'global-clean-energy-investment-surpasses-fossil-fuels', lastmod: '2026-10-21' },
  { slug: 'breakthroughs-in-solid-state-batteries-signal-ev-revolution', lastmod: '2026-10-20' },
  { slug: 'whats-next-for-global-trade-in-2026', lastmod: '2026-10-18' },
  { slug: 'un-climate-summit-agrees-on-new-loss-and-damage-fund-framework', lastmod: '2026-10-21' },
  { slug: 'indias-journey-in-the-t20-world-cup', lastmod: '2026-10-17' },
  { slug: 'high-speed-rail-networks-expand-rapidly-across-southeast-asia', lastmod: '2026-10-21' },
  { slug: 'european-union-implements-comprehensive-ai-act-enforcement', lastmod: '2026-10-21' },
  { slug: 'cross-border-night-trains-experience-massive-renaissance-in-central-europe', lastmod: '2026-10-20' },
  { slug: 'nasa-artemis-lunar-mission-prepares-for-crewed-orbit', lastmod: '2026-10-21' },
  { slug: 'renewable-microgrids-gain-traction-across-latin-america', lastmod: '2026-10-20' },
  { slug: 'the-future-of-ai-how-gemini-is-changing-the-way-we-work', lastmod: '2026-10-20' },
  { slug: 'building-autonomous-ai-agents-with-tool-use-and-structured-outputs', lastmod: '2026-10-21' },
  { slug: 'why-learning-sap-can-boost-your-career', lastmod: '2026-10-17' },
  { slug: 'mastering-sap-btp-and-event-mesh-for-real-time-integrations', lastmod: '2026-10-21' },
  { slug: 'mastering-german-articles-der-die-das-with-practical-memory-rules', lastmod: '2026-10-21' },
  { slug: 'essential-german-for-the-workplace-professional-emails-and-meetings', lastmod: '2026-10-20' },
  { slug: 'top-cloud-certifications-in-demand-for-2026-aws-gcp-azure', lastmod: '2026-10-21' },
  { slug: 'modern-full-stack-roadmap-from-react-19-to-serverless-backends', lastmod: '2026-10-20' },
  { slug: 'the-resurgence-of-imax-and-70mm-cinema-storytelling', lastmod: '2026-10-21' },
  { slug: 'top-sci-fi-masterpieces-of-the-2020s-you-must-watch', lastmod: '2026-10-20' },
  { slug: 'why-prestige-limited-series-are-outpacing-traditional-television', lastmod: '2026-10-21' },
  { slug: 'must-watch-international-series-streaming-in-2026', lastmod: '2026-10-20' },
  { slug: 'behind-the-scenes-at-the-cannes-film-festival-red-carpet', lastmod: '2026-10-21' },
  { slug: 'actors-who-underwent-dramatic-physical-transformations-for-roles', lastmod: '2026-10-20' },
  { slug: 'stunning-wildlife-photographs-from-the-national-geographic-awards', lastmod: '2026-10-21' },
  { slug: 'architectural-marvels-of-the-ancient-world-in-high-definition', lastmod: '2026-10-20' },
  { slug: 'best-laptops-for-students-in-2026-under-70000', lastmod: '2026-10-19' },
  { slug: 'essential-travel-gear-and-gadgets-worth-every-penny', lastmod: '2026-10-21' },
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
