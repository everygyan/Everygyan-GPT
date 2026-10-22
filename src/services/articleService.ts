import { Article } from '../types';
import { SEED_ARTICLES } from '../data/seedData';
import { supabase, isSupabaseConfigured } from './supabase';

interface AuthorRow {
  id?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

interface ArticleDbRow extends Omit<Article, 'author'> {
  author?: AuthorRow | AuthorRow[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Validates that an article is strictly published and eligible for public viewing.
 * Drafts, scheduled, and archived content are strictly barred from public responses.
 */
function isPubliclyAccessible(article: Article): boolean {
  return article.status === 'published';
}

export async function fetchAllPublicArticles(): Promise<Article[]> {
  if (isSupabaseConfigured) {
    try {
      let rawData: unknown[] = [];
      const primaryRes = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          cover_image,
          cover_caption,
          category,
          category_slug,
          tags,
          status,
          published_at,
          read_time,
          is_lead_story,
          is_featured,
          is_carousel,
          views_count,
          author:profiles(id, full_name, avatar_url, role),
          template_type,
          template_data
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (!primaryRes.error && primaryRes.data) {
        rawData = primaryRes.data;
      } else if (primaryRes.error && primaryRes.error.message && primaryRes.error.message.includes('is_carousel')) {
        // Graceful fallback if is_carousel column is not yet applied in production DB
        const fallbackRes = await supabase
          .from('articles')
          .select(`
            id,
            title,
            slug,
            excerpt,
            content,
            cover_image,
            cover_caption,
            category,
            category_slug,
            tags,
            status,
            published_at,
            read_time,
            is_lead_story,
            is_featured,
            views_count,
            author:profiles(id, full_name, avatar_url, role),
            template_type,
            template_data
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        if (!fallbackRes.error && fallbackRes.data) {
          rawData = fallbackRes.data;
        }
      }

      if (rawData.length > 0) {
        // Map and ensure strict isolation
        const safeArticles: Article[] = (rawData as unknown as ArticleDbRow[]).map((item) => {
          const authorObj = Array.isArray(item.author) ? item.author[0] : item.author;
          return {
            ...item,
            author: {
              id: authorObj?.id || 'unknown',
              name: authorObj?.full_name || 'EveryGyan Editorial',
              avatar: authorObj?.avatar_url,
              role: authorObj?.role || 'Contributor',
            },
          } as Article;
        });
        return safeArticles.filter(isPubliclyAccessible);
      }
    } catch (err) {
      console.warn('[ArticleService] Supabase fetch failed, falling back to verified seed data:', err);
    }
  }

  // Fallback to verified public seed articles
  return SEED_ARTICLES.filter(isPubliclyAccessible);
}

export async function fetchLeadStory(): Promise<Article | null> {
  const articles = await fetchAllPublicArticles();
  return articles.find((a) => a.is_lead_story) || articles[0] || null;
}

/**
 * Fetches articles for the Homepage Hero Carousel.
 * Returns articles explicitly marked with is_carousel = true.
 * If none are explicitly selected, falls back to the lead story + featured articles.
 */
export async function fetchCarouselArticles(): Promise<Article[]> {
  const articles = await fetchAllPublicArticles();

  // 1. Explicitly selected carousel articles (lead story always placed first)
  const carousel = articles.filter((a) => Boolean(a.is_carousel));
  if (carousel.length > 0) {
    return carousel.sort((a, b) => (b.is_lead_story ? 1 : 0) - (a.is_lead_story ? 1 : 0));
  }

  // 2. Intelligent fallback: lead story + featured articles
  const lead = articles.find((a) => a.is_lead_story);
  const featured = articles.filter((a) => a.is_featured && a.id !== lead?.id);
  const candidates: Article[] = [];
  if (lead) candidates.push(lead);
  candidates.push(...featured);

  if (candidates.length > 0) {
    return candidates.slice(0, 5);
  }

  // 3. Fallback to first 3 published articles
  return articles.slice(0, 3);
}

export async function fetchLatestNews(limit: number = 4): Promise<Article[]> {
  const articles = await fetchAllPublicArticles();
  return articles.filter((a) => !a.is_lead_story).slice(0, limit);
}

export async function fetchFeaturedArticles(): Promise<Article[]> {
  const articles = await fetchAllPublicArticles();
  const featured = articles.filter((a) => a.is_featured);
  return featured.length > 0 ? featured : articles.slice(0, 3);
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          cover_image,
          cover_caption,
          category,
          category_slug,
          tags,
          status,
          published_at,
          read_time,
          table_of_contents,
          references,
          template_type,
          template_data,
          author:profiles(id, full_name, avatar_url, role)
        `)
        .eq('slug', slug)
        .eq('status', 'published') // Critical: never return non-published to anonymous visitors
        .single();

      if (!error && data) {
        const row = data as unknown as ArticleDbRow;
        const authorObj = Array.isArray(row.author) ? row.author[0] : row.author;
        return {
          ...row,
          author: {
            id: authorObj?.id || 'unknown',
            name: authorObj?.full_name || 'EveryGyan Contributor',
            avatar: authorObj?.avatar_url,
            role: authorObj?.role || 'Author',
          },
        } as Article;
      }
    } catch {
      // Fallback
    }
  }

  const found = SEED_ARTICLES.find((a) => a.slug === slug);
  return found && isPubliclyAccessible(found) ? found : null;
}

export async function fetchArticlesByCategoryPaginated(
  categorySlug: string,
  page: number = 1,
  pageSize: number = 6
): Promise<PaginatedResult<Article>> {
  const all = await fetchAllPublicArticles();
  const normalized = categorySlug.toLowerCase().trim();

  const filtered = all.filter((a) => {
    const aSlug = a.category_slug.toLowerCase();
    // 1. Exact match
    if (aSlug === normalized) return true;

    // 2. Parent department match
    if (normalized === 'travel' && (aSlug.startsWith('travel-') || aSlug === 'health')) return true;
    if (normalized === 'news' && (aSlug.startsWith('news-') || aSlug === 'latest-news')) return true;
    if (normalized === 'learn' && aSlug.startsWith('learn-')) return true;
    if (normalized === 'entertainment' && aSlug.startsWith('entertainment-')) return true;

    // 3. Backward-compatible aliases
    if (normalized === 'tech' && (aSlug === 'learn-ai' || aSlug === 'deals')) return true;
    if (normalized === 'learning' && (aSlug === 'learn-sap' || aSlug.startsWith('learn-'))) return true;
    if (normalized === 'sports' && aSlug === 'news-asia') return true;
    if (normalized === 'geopolitics' && aSlug === 'news-world') return true;

    return false;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function fetchArticlesByTagPaginated(
  tag: string,
  page: number = 1,
  pageSize: number = 6
): Promise<PaginatedResult<Article>> {
  const all = await fetchAllPublicArticles();
  const normalizedTag = tag.toLowerCase().replace(/-/g, ' ');
  const filtered = all.filter((a) =>
    a.tags.some(
      (t) =>
        t.toLowerCase() === normalizedTag ||
        t.toLowerCase().replace(/\s+/g, '-') === tag.toLowerCase()
    )
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function searchArticles(query: string): Promise<Article[]> {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const articles = await fetchAllPublicArticles();
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
  );
}
