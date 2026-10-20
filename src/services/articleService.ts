import { Article } from '../types';
import { SEED_ARTICLES } from '../data/seedData';
import { supabase, isSupabaseConfigured } from './supabase';

export async function fetchAllArticles(): Promise<Article[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Article[];
      }
    } catch (err) {
      console.warn('[ArticleService] Supabase fetch failed, falling back to seed data:', err);
    }
  }

  // Fallback to high-quality seed articles
  return SEED_ARTICLES;
}

export async function fetchLeadStory(): Promise<Article | null> {
  const articles = await fetchAllArticles();
  return articles.find((a) => a.is_lead_story) || articles[0] || null;
}

export async function fetchLatestNews(limit: number = 4): Promise<Article[]> {
  const articles = await fetchAllArticles();
  return articles
    .filter((a) => !a.is_lead_story)
    .slice(0, limit);
}

export async function fetchFeaturedArticles(): Promise<Article[]> {
  const articles = await fetchAllArticles();
  const featured = articles.filter((a) => a.is_featured);
  return featured.length > 0 ? featured : articles.slice(0, 3);
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (!error && data) {
        return data as Article;
      }
    } catch {
      // Fallback
    }
  }

  return SEED_ARTICLES.find((a) => a.slug === slug) || null;
}

export async function fetchArticlesByCategory(categorySlug: string): Promise<Article[]> {
  const articles = await fetchAllArticles();
  return articles.filter(
    (a) => a.category_slug.toLowerCase() === categorySlug.toLowerCase()
  );
}

export async function searchArticles(query: string): Promise<Article[]> {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const articles = await fetchAllArticles();
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
  );
}
