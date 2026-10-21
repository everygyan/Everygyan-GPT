import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

import { generateSlug, resolveUniqueSlug } from '../utils/slug';
import {
  saveArticle,
  extractTableOfContents,
  uploadArticleCoverImage,
} from '../services/cmsService';
import { fetchAllPublicArticles, fetchCarouselArticles } from '../services/articleService';

describe('CMS Editorial Workflow Tests', () => {
  describe('Slug Generation & Collision Handling', () => {
    it('generates a URL-safe lowercase slug with hyphen separators', () => {
      const slug = generateSlug('SAP S/4HANA Migration: The Complete Guide & Architecture!');
      expect(slug).toBe('sap-s4hana-migration-the-complete-guide-architecture');
    });

    it('resolves collision by appending incremental numeric suffix', () => {
      const existing = ['future-of-ai', 'future-of-ai-2'];
      const unique = resolveUniqueSlug('future-of-ai', existing);
      expect(unique).toBe('future-of-ai-3');
    });

    it('retains same slug when editing the same article', () => {
      const existing = ['my-first-post', 'another-post'];
      const resolved = resolveUniqueSlug('my-first-post', existing, 'art-123', 'my-first-post');
      expect(resolved).toBe('my-first-post');
    });
  });

  describe('Validation & Role Boundaries for Saving Articles', () => {
    it('rejects article saving if title is too short (< 5 chars)', async () => {
      const result = await saveArticle(
        {
          title: 'Hey',
          content: 'This is a sufficiently long body content that exceeds twenty characters.',
          category: 'Technology',
          category_slug: 'technology',
          status: 'draft',
        },
        { id: 'user-1', name: 'Author One', role: 'author' }
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain('title must be at least 5 characters');
    });

    it('rejects article saving if content is too short (< 20 chars)', async () => {
      const result = await saveArticle(
        {
          title: 'Valid Long Title Here',
          content: 'Short body',
          category: 'Technology',
          category_slug: 'technology',
          status: 'draft',
        },
        { id: 'user-1', name: 'Author One', role: 'author' }
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain('body content must be at least 20 characters');
    });

    it('blocks author role from directly setting published status', async () => {
      const result = await saveArticle(
        {
          title: 'Exciting Tech Revelation for Everyone',
          content: 'Here is a comprehensive breakdown of new quantum compute architecture advancements.',
          category: 'Technology',
          category_slug: 'technology',
          status: 'published',
        },
        { id: 'user-author-1', name: 'Author Contributor', role: 'author' }
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain('cannot directly publish');
    });

    it('allows author role to submit with in_review status', async () => {
      const result = await saveArticle(
        {
          title: 'Exciting Tech Revelation for Review',
          content: 'Here is a comprehensive breakdown of new quantum compute architecture advancements.',
          category: 'Technology',
          category_slug: 'technology',
          status: 'in_review',
        },
        { id: 'user-author-1', name: 'Author Contributor', role: 'author' }
      );

      expect(result.error).toBeNull();
      expect(result.data?.status).toBe('in_review');
    });

    it('allows editor role to publish directly', async () => {
      const result = await saveArticle(
        {
          title: 'Editor Approved Breaking News Story',
          content: 'Here is a comprehensive breakdown of new quantum compute architecture advancements.',
          category: 'Technology',
          category_slug: 'technology',
          status: 'published',
        },
        { id: 'user-editor-1', name: 'Chief Editor', role: 'editor' }
      );

      expect(result.error).toBeNull();
      expect(result.data?.status).toBe('published');
    });

    it('blocks reader role from authoring or saving articles', async () => {
      const result = await saveArticle(
        {
          title: 'Unauthorized Reader Attempt',
          content: 'Here is a comprehensive breakdown of new quantum compute architecture advancements.',
          category: 'Technology',
          category_slug: 'technology',
          status: 'draft',
        },
        { id: 'user-reader-1', name: 'Standard Reader', role: 'reader' }
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain('cannot author articles');
    });
  });

  describe('Table of Contents Extraction', () => {
    it('extracts H2 and H3 headings with normalized slug anchors', () => {
      const markdown = `
# Main Title
Intro text here.

## Overview & Architecture
Some content.

### Core Modules
Deeper details.

## Deployment Steps
Final checklist.
      `;

      const toc = extractTableOfContents(markdown);
      expect(toc).toHaveLength(3);
      expect(toc[0]).toEqual({
        id: 'overview-architecture',
        title: 'Overview & Architecture',
        level: 2,
      });
      expect(toc[1]).toEqual({
        id: 'core-modules',
        title: 'Core Modules',
        level: 3,
      });
      expect(toc[2]).toEqual({
        id: 'deployment-steps',
        title: 'Deployment Steps',
        level: 2,
      });
    });
  });

  describe('Media Upload Validation', () => {
    it('rejects unsupported file formats like executable or pdf', async () => {
      const fakeFile = new File(['fake content'], 'document.pdf', { type: 'application/pdf' });
      const result = await uploadArticleCoverImage(fakeFile);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Allowed image formats: JPEG, PNG, WEBP');
    });

    it('rejects images exceeding 5MB size limit', async () => {
      // 6 MB buffer
      const largeBlob = new Blob([new Uint8Array(6 * 1024 * 1024)], { type: 'image/png' });
      const largeFile = new File([largeBlob], 'large-photo.png', { type: 'image/png' });

      const result = await uploadArticleCoverImage(largeFile);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Maximum allowed upload is 5 MB');
    });
  });

  describe('Draft Invisibility to Public Readers', () => {
    it('public fetchAllPublicArticles returns only published articles and excludes drafts', async () => {
      const publicArticles = await fetchAllPublicArticles();
      const hasNonPublished = publicArticles.some((a) => a.status !== 'published');
      expect(hasNonPublished).toBe(false);
    });
  });

  describe('Homepage Carousel Workflow', () => {
    it('saves and preserves is_carousel flag when editor saves article', async () => {
      const res = await saveArticle(
        {
          title: 'Spectacular Alpine Journey for Families',
          content: 'Detailed breakdown of alpine rail itineraries and child-friendly mountain lodges.',
          category: 'Travel',
          category_slug: 'travel',
          status: 'published',
          is_carousel: true,
        },
        { id: 'user-editor-1', name: 'Lead Editor', role: 'editor' }
      );

      expect(res.data).not.toBeNull();
      expect(res.data?.is_carousel).toBe(true);
    });

    it('fetchCarouselArticles returns articles eligible for the hero carousel', async () => {
      const carouselItems = await fetchCarouselArticles();
      expect(carouselItems.length).toBeGreaterThan(0);
      expect(carouselItems.every((a) => a.status === 'published')).toBe(true);
    });
  });
});
