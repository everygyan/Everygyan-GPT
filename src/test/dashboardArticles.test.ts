import { describe, it, expect } from 'vitest';
import { groupArticlesByCategory } from '../pages/dashboard/DashboardArticles';
import { Article } from '../types';

describe('DashboardArticles Category Grouping Suite', () => {
  const mockAuthor = {
    id: 'author-1',
    name: 'Sandeep Reddy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  };

  const createMockArticle = (overrides: Partial<Article>): Article => {
    const base: Article = {
      id: 'mock-id',
      title: 'Mock Title',
      slug: 'mock-title',
      excerpt: 'Mock excerpt...',
      content: 'Mock content...',
      category: 'General',
      category_slug: 'general',
      author: mockAuthor,
      status: 'published',
      published_at: '2026-11-08T12:00:00Z',
      tags: [],
      read_time: '5 min read',
      cover_image: '',
    };
    return { ...base, ...overrides } as Article;
  };

  const sampleArticles: Article[] = [
    createMockArticle({
      id: 'art-1',
      title: 'Japan : From Ancient Civilization to Modern Superpower',
      slug: 'japan-from-ancient-civilization-to-modern-superpower',
      category: 'Japan',
      category_slug: 'travel-asia-japan',
      published_at: '2026-11-08T12:00:12.317+00:00',
    }),
    createMockArticle({
      id: 'art-2',
      title: 'SAP TechEd 2026: Key Highlights & Virtual Guide',
      slug: 'sap-teched-2026-key-highlights',
      category: 'SAP Tutorials',
      category_slug: 'learn-sap',
      published_at: '2026-10-27T19:09:12.022+00:00',
    }),
    createMockArticle({
      id: 'art-3',
      title: 'Discover Germany: The Ultimate Alpine & Castles Guide',
      slug: 'germany-travel-guide',
      category: 'Europe Travel',
      category_slug: 'travel-europe',
      published_at: '2026-10-31T08:27:22.866+00:00',
    }),
    createMockArticle({
      id: 'art-4',
      title: 'Global Cricket Spotlight: Current Matches Analysis',
      slug: 'global-cricket-spotlight',
      category: 'Latest News',
      category_slug: 'latest-news',
      published_at: '2026-11-05T16:33:41.614+00:00',
    }),
    createMockArticle({
      id: 'art-5',
      title: 'Latest LLM Models Launched This Week',
      slug: 'latest-llm-models-launched-this-week',
      category: 'Tech',
      category_slug: 'tech',
      status: 'draft',
      published_at: '2026-10-25T17:48:39.789+00:00',
    }),
    createMockArticle({
      id: 'art-6',
      title: 'Latest iPhone Models Available: Specs & Review',
      slug: 'latest-iphone-models-available',
      category: 'Latest News',
      category_slug: 'latest-news',
      status: 'in_review',
      published_at: '2026-10-25T17:48:18.674+00:00',
    }),
  ];

  const categoryOptions = [
    { slug: 'travel-asia-japan', name: 'Japan', displayName: 'Travel > Asia > Japan' },
    { slug: 'learn-sap', name: 'SAP Tutorials', displayName: 'Learn > SAP' },
    { slug: 'travel-europe', name: 'Europe Travel', displayName: 'Travel > Europe' },
    { slug: 'latest-news', name: 'Latest News', displayName: 'News > Latest News' },
    { slug: 'tech', name: 'Tech', displayName: 'Learn > Tech' },
  ];

  it('groups articles by category correctly into distinct groups', () => {
    const groups = groupArticlesByCategory(sampleArticles, categoryOptions);

    expect(groups.length).toBe(5);
    const groupNames = groups.map((g) => g.name);
    expect(groupNames).toContain('Japan');
    expect(groupNames).toContain('Latest News');
    expect(groupNames).toContain('Europe Travel');
    expect(groupNames).toContain('SAP Tutorials');
    expect(groupNames).toContain('Tech');
  });

  it('associates multiple articles under the same category group', () => {
    const groups = groupArticlesByCategory(sampleArticles, categoryOptions);
    const newsGroup = groups.find((g) => g.name === 'Latest News');

    expect(newsGroup).toBeDefined();
    expect(newsGroup?.articles.length).toBe(2);
    expect(newsGroup?.articles.map((a) => a.id)).toEqual(['art-4', 'art-6']);
    expect(newsGroup?.counts.total).toBe(2);
    expect(newsGroup?.counts.published).toBe(1);
    expect(newsGroup?.counts.in_review).toBe(1);
  });

  it('correctly inherits navigation lineage displayName for nested subcategories (e.g. Travel > Asia > Japan)', () => {
    const groups = groupArticlesByCategory(sampleArticles, categoryOptions);
    const japanGroup = groups.find((g) => g.name === 'Japan');

    expect(japanGroup).toBeDefined();
    expect(japanGroup?.displayName).toBe('Travel > Asia > Japan');
    expect(japanGroup?.articles.length).toBe(1);
    expect(japanGroup?.counts.published).toBe(1);
  });

  it('handles articles with custom or unlisted categories gracefully', () => {
    const customArticle = createMockArticle({
      id: 'art-custom',
      title: 'Uncategorized Thoughts',
      slug: 'uncategorized-thoughts',
      category: 'Unlisted Category',
      category_slug: 'unlisted-category',
      status: 'draft',
    });

    const groups = groupArticlesByCategory([...sampleArticles, customArticle], categoryOptions);
    const customGroup = groups.find((g) => g.name === 'Unlisted Category');

    expect(customGroup).toBeDefined();
    expect(customGroup?.articles.length).toBe(1);
    expect(customGroup?.counts.draft).toBe(1);
  });

  it('sorts category groups alphabetically by name', () => {
    const groups = groupArticlesByCategory(sampleArticles, categoryOptions);
    const names = groups.map((g) => g.name);

    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });
});
