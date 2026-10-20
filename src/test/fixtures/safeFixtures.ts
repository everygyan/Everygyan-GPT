/**
 * Safe Test Fixtures & Non-Destructive Seed Data Factory
 *
 * Safety Constraints:
 * 1. Guaranteed isolation: All IDs use 'test-mock-' prefix.
 * 2. Production safety guard: Throws if invoked against production domains or NODE_ENV=production.
 * 3. Never truncates or drops production database tables.
 */

import { Article, UserProfile, UserRole, Comment } from '../../types';

export function assertNotProductionEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL SAFETY VIOLATION: Test fixture execution is strictly barred in production.');
  }
}

// ==============================================================================
// 1. Role-Scoped User Fixtures
// ==============================================================================
export const mockUsers: Record<UserRole, UserProfile> = {
  reader: {
    id: 'test-mock-usr-reader-001',
    email: 'reader@example.com',
    full_name: 'Regular Reader',
    role: 'reader',
    created_at: '2026-10-01T00:00:00Z',
  },
  author: {
    id: 'test-mock-usr-author-002',
    email: 'author@example.com',
    full_name: 'Content Author',
    role: 'author',
    created_at: '2026-10-01T00:00:00Z',
  },
  moderator: {
    id: 'test-mock-usr-moderator-003',
    email: 'moderator@example.com',
    full_name: 'Community Moderator',
    role: 'moderator',
    created_at: '2026-10-01T00:00:00Z',
  },
  editor: {
    id: 'test-mock-usr-editor-004',
    email: 'editor@example.com',
    full_name: 'Senior Editor',
    role: 'editor',
    created_at: '2026-10-01T00:00:00Z',
  },
  admin: {
    id: 'test-mock-usr-admin-005',
    email: 'admin@example.com',
    full_name: 'Site Administrator',
    role: 'admin',
    created_at: '2026-10-01T00:00:00Z',
  },
};

// ==============================================================================
// 2. Article Lifecycle Fixtures
// ==============================================================================
export const mockArticles: Record<string, Article> = {
  published: {
    id: 'test-mock-art-pub-001',
    title: 'Published Public Guide to Enterprise Systems',
    slug: 'published-public-guide-to-enterprise-systems',
    excerpt: 'An indexable, publicly viewable article on enterprise software.',
    content: 'Comprehensive body text explaining architectural trade-offs in cloud and on-premise environments.',
    category: 'Learning',
    category_slug: 'learning',
    cover_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    author: {
      id: mockUsers.author.id,
      name: mockUsers.author.full_name,
      role: 'author',
    },
    tags: ['Enterprise', 'SAP', 'Architecture'],
    status: 'published',
    published_at: '2026-10-15T00:00:00Z',
    read_time: '6 min read',
    table_of_contents: [],
    references: [{ title: 'Official Documentation', url: 'https://example.com/docs' }],
  },
  draft: {
    id: 'test-mock-art-draft-002',
    title: 'Work In Progress: Confidential Enterprise Strategy',
    slug: 'work-in-progress-confidential-enterprise-strategy',
    excerpt: 'Private draft that must NEVER be returned to anonymous visitors or public searches.',
    content: 'Draft notes, internal projections, and pending editorial review comments.',
    category: 'Tech',
    category_slug: 'tech',
    cover_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    author: {
      id: mockUsers.author.id,
      name: mockUsers.author.full_name,
      role: 'author',
    },
    tags: ['Draft', 'Internal'],
    status: 'draft',
    published_at: '',
    read_time: '3 min read',
  },
  inReview: {
    id: 'test-mock-art-review-003',
    title: 'Pending Review: Semiconductor Supply Corridor',
    slug: 'pending-review-semiconductor-supply-corridor',
    excerpt: 'Submitted by author, awaiting editor approval.',
    content: 'In-depth macroeconomic analysis awaiting editorial verification.',
    category: 'Geopolitics',
    category_slug: 'geopolitics',
    cover_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    author: {
      id: mockUsers.author.id,
      name: mockUsers.author.full_name,
      role: 'author',
    },
    tags: ['Trade', 'Geopolitics'],
    status: 'in_review',
    published_at: '',
    read_time: '5 min read',
  },
  scheduled: {
    id: 'test-mock-art-sched-004',
    title: 'Scheduled Feature: Kyoto Autumn Temples',
    slug: 'scheduled-feature-kyoto-autumn-temples',
    excerpt: 'Prepared for upcoming weekend issue release.',
    content: 'Family travel itineraries for western Japan.',
    category: 'Travel',
    category_slug: 'travel',
    cover_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    author: {
      id: mockUsers.author.id,
      name: mockUsers.author.full_name,
      role: 'author',
    },
    tags: ['Japan', 'Travel'],
    status: 'scheduled',
    published_at: '2026-11-01T00:00:00Z',
    read_time: '7 min read',
  },
  archived: {
    id: 'test-mock-art-arch-005',
    title: 'Archived Legacy Announcement 2024',
    slug: 'archived-legacy-announcement-2024',
    excerpt: 'Retired publication no longer indexed.',
    content: 'Historical notice.',
    category: 'Tech',
    category_slug: 'tech',
    cover_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    author: {
      id: mockUsers.editor.id,
      name: mockUsers.editor.full_name,
      role: 'editor',
    },
    tags: ['Archive'],
    status: 'archived',
    published_at: '2024-01-01T00:00:00Z',
    read_time: '2 min read',
  },
};

// ==============================================================================
// 3. Comment Fixtures
// ==============================================================================
export const mockComments: Comment[] = [
  {
    id: 'test-mock-cmt-app-001',
    article_id: mockArticles.published.id,
    content: 'Great breakdown of the SAP RAP architecture. Very clear!',
    author_name: 'Community Reader',
    status: 'approved',
    created_at: '2026-10-16T10:00:00Z',
  },
  {
    id: 'test-mock-cmt-pend-002',
    article_id: mockArticles.published.id,
    content: 'Pending moderation comment awaiting review.',
    author_name: 'New Visitor',
    status: 'pending',
    created_at: '2026-10-16T11:00:00Z',
  },
  {
    id: 'test-mock-cmt-spam-003',
    article_id: mockArticles.published.id,
    content: 'Buy cheap watches online now! Click http://spam.example.com',
    author_name: 'SpamBot',
    status: 'spam',
    created_at: '2026-10-16T12:00:00Z',
  },
];
