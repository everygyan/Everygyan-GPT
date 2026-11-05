import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { SeoHead } from '../components/common/SeoHead';
// @ts-expect-error - .mjs build utility script declaration
import { buildSitemapXml } from '../../scripts/generate-sitemap.mjs';
import fs from 'fs';
import path from 'path';

describe('Technical SEO & Metadata Subsystem', () => {
  beforeEach(() => {
    // Clean up document head before each test
    document.title = '';
    const managed = document.querySelectorAll('[data-rh="true"], [data-seo="true"]');
    managed.forEach((el) => el.remove());
  });

  afterEach(() => {
    const managed = document.querySelectorAll('[data-rh="true"], [data-seo="true"]');
    managed.forEach((el) => el.remove());
  });

  it('updates document.title and meta description accurately', () => {
    render(
      <SeoHead
        title="Test Article Title"
        description="A comprehensive testing description for EveryGyan article."
      />
    );

    expect(document.title).toBe('Test Article Title | EveryGyan — Knowledge for Everyone, Everywhere');

    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta).not.toBeNull();
    expect(descMeta?.getAttribute('content')).toBe('A comprehensive testing description for EveryGyan article.');
  });

  it('sets canonical URL and Open Graph metadata correctly', () => {
    render(
      <SeoHead
        title="Kyoto Travel Guide"
        description="A family travel guide to ancient temples in Japan."
        canonicalUrl="/article/kyoto-travel-guide"
        ogType="article"
        ogImage="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
        authorName="Sandeep"
        publishedAt="2026-10-20T00:00:00Z"
      />
    );

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical).not.toBeNull();
    expect(canonical?.getAttribute('href')).toBe('https://everygyan.com/article/kyoto-travel-guide');

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute('content')).toBe('Kyoto Travel Guide | EveryGyan — Knowledge for Everyone, Everywhere');

    const ogType = document.querySelector('meta[property="og:type"]');
    expect(ogType?.getAttribute('content')).toBe('article');

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toBe('https://images.unsplash.com/photo-1506744038136-46273834b3fb');

    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
  });

  it('enforces robots="noindex, follow" on search and utility pages', () => {
    render(
      <SeoHead
        title="Search Results"
        description="Search results for enterprise SAP."
        robots="noindex, follow"
      />
    );

    const robotsMeta = document.querySelector('meta[name="robots"]');
    expect(robotsMeta).not.toBeNull();
    expect(robotsMeta?.getAttribute('content')).toBe('noindex, follow');
  });

  it('enforces robots="noindex, nofollow" on 404 and sensitive transactional pages', () => {
    render(
      <SeoHead
        title="Page Not Found"
        description="The page you requested could not be found."
        robots="noindex, nofollow"
      />
    );

    const robotsMeta = document.querySelector('meta[name="robots"]');
    expect(robotsMeta).not.toBeNull();
    expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('injects schema.org structured data JSON-LD accurately without inventing facts', () => {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: 'The Future of AI: How Gemini is Changing the Way We Work',
      datePublished: '2026-10-20',
      author: {
        '@type': 'Person',
        name: 'Sandeep',
      },
      publisher: {
        '@type': 'Organization',
        name: 'EveryGyan',
      },
    };

    render(
      <SeoHead
        title="The Future of AI"
        description="Exploring AI workflows."
        structuredData={articleSchema}
      />
    );

    const script = document.getElementById('schema-structured-data');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent || '{}');
    expect(parsed['@type']).toBe('NewsArticle');
    expect(parsed.headline).toBe('The Future of AI: How Gemini is Changing the Way We Work');
    expect(parsed.author.name).toBe('Sandeep');
    expect(parsed.publisher.name).toBe('EveryGyan');
  });
});

describe('Sitemap & Robots Directives Compliance', () => {
  it('generates valid sitemap XML containing published articles and categories', () => {
    const xml = buildSitemapXml();

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://everygyan.com/</loc>');
    expect(xml).toContain('<loc>https://everygyan.com/about</loc>');
    expect(xml).toContain('<loc>https://everygyan.com/category/tech</loc>');
    expect(xml).toContain('<loc>https://everygyan.com/article/10-amazing-places-to-visit-in-europe-with-family</loc>');
    expect(xml).toContain('<loc>https://everygyan.com/article/the-future-of-ai-how-gemini-is-changing-the-way-we-work</loc>');
    expect(xml).toContain('</urlset>');
  });

  it('strictly excludes private, search, utility, and non-indexable routes from sitemap', () => {
    const xml = buildSitemapXml();

    // Must NOT contain internal dashboard or private administrative routes
    expect(xml).not.toContain('/dashboard');
    // Must NOT contain internal search queries
    expect(xml).not.toContain('/search');
    // Must NOT contain password reset or authentication utilities
    expect(xml).not.toContain('/reset-password');
    // Must NOT contain transactional email tokens or unsubscribe links
    expect(xml).not.toContain('/unsubscribe');
    expect(xml).not.toContain('/newsletter/confirm');
  });

  it('verifies public/robots.txt allows public routes and disallows private/search routes', () => {
    const robotsPath = path.resolve(process.cwd(), 'public', 'robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);

    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    expect(robotsContent).toContain('Allow: /');
    expect(robotsContent).toContain('Allow: /article/');
    expect(robotsContent).toContain('Disallow: /dashboard/');
    expect(robotsContent).toContain('Disallow: /search');
    expect(robotsContent).toContain('Disallow: /reset-password');
    expect(robotsContent).toContain('Disallow: /unsubscribe');
    expect(robotsContent).toContain('Content-Signal: search=yes, ai-train=no');
    expect(robotsContent).toContain('Sitemap: https://everygyan.com/sitemap.xml');
  });

  it('verifies public/404.html exists with proper HTTP 404 meta tags and branding', () => {
    const notFoundPath = path.resolve(process.cwd(), 'public', '404.html');
    expect(fs.existsSync(notFoundPath)).toBe(true);

    const content = fs.readFileSync(notFoundPath, 'utf8');
    expect(content).toContain('404');
    expect(content).toContain('Page Not Found');
    expect(content).toContain('robots');
    expect(content).toContain('noindex, nofollow');
  });

  it('verifies initial index.html contains rich, non-empty semantic content readable without JavaScript', () => {
    const indexPath = path.resolve(process.cwd(), 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);

    const htmlContent = fs.readFileSync(indexPath, 'utf8');
    expect(htmlContent).toContain('EveryGyan');
    expect(htmlContent).toContain('Knowledge for Everyone, Everywhere');
    expect(htmlContent).toContain('Featured Stories & Editorial Deep Dives');
    expect(htmlContent).toContain('10 Amazing Places to Visit in Europe with Family');
    expect(htmlContent).toContain('<link rel="canonical" href="https://everygyan.com/" />');
    expect(htmlContent).toContain('<h1');
    expect(htmlContent).toContain('+1-800-555-0199');
    expect(htmlContent).toContain('contact@everygyan.com');
    expect(htmlContent).toContain('sameAs');
    expect(htmlContent).toContain('"@type": "Organization"');
    expect(htmlContent).toContain('NewsMediaOrganization');
    expect(htmlContent).toContain('PostalAddress');
    expect(htmlContent).toContain('FAQPage');
    expect(htmlContent).toContain('ItemList');
    expect(htmlContent).toContain('<noscript>');
    // Ensure raw HTML has substantial text for AI agents and search crawlers
    expect(htmlContent.length).toBeGreaterThan(1500);
  });

  it('verifies public/llms.txt is well-formed with # title, > summary, and markdown links', () => {
    const llmsPath = path.resolve(process.cwd(), 'public', 'llms.txt');
    expect(fs.existsSync(llmsPath)).toBe(true);

    const content = fs.readFileSync(llmsPath, 'utf8');
    expect(content.startsWith('# EveryGyan')).toBe(true);
    expect(content).toContain('> Knowledge for Everyone, Everywhere');
    expect(content).toContain('## Core Sections');
    expect(content).toContain('https://everygyan.com/about');
    expect(content).toContain('https://everygyan.com/category/travel');
    expect(content).toContain('https://everygyan.com/category/tech');
  });

  it('verifies public/index.md provides a clean Markdown representation for AI agents', () => {
    const mdPath = path.resolve(process.cwd(), 'public', 'index.md');
    expect(fs.existsSync(mdPath)).toBe(true);

    const content = fs.readFileSync(mdPath, 'utf8');
    expect(content).toContain('# EveryGyan');
    expect(content).toContain('contact@everygyan.com');
    expect(content).toContain('+1 (800) 555-0199');
    expect(content).toContain('https://everygyan.com/category/travel');
  });

  it('verifies public/.well-known/mcp/server-card.json is published with valid MCP schema', () => {
    const cardPath = path.resolve(process.cwd(), 'public', '.well-known', 'mcp', 'server-card.json');
    expect(fs.existsSync(cardPath)).toBe(true);

    const parsed = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
    expect(parsed.name).toContain('EveryGyan');
    expect(parsed.version).toBe('1.0.0');
    expect(parsed.capabilities).toBeDefined();
    expect(parsed.tools.length).toBeGreaterThan(0);
  });

  it('verifies public/.htaccess advertises Link headers and supports Markdown content negotiation', () => {
    const htaccessPath = path.resolve(process.cwd(), 'public', '.htaccess');
    const content = fs.readFileSync(htaccessPath, 'utf8');

    expect(content).toContain('Link');
    expect(content).toContain('/llms.txt');
    expect(content).toContain('/index.md');
    expect(content).toContain('Accept');
    expect(content).toContain('text/markdown');
    expect(content).toContain('.well-known');
  });
});
