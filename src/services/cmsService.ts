import { Article, ArticleStatus, UserRole, TemplateType } from '../types';
import { SEED_ARTICLES } from '../data/seedData';
import { supabase, isSupabaseConfigured } from './supabase';
import { calculateReadingTime } from '../utils/readingTime';
import { generateSlug, resolveUniqueSlug } from '../utils/slug';

// Local editorial state cache for local development/offline testing
let localArticlesStore: Article[] = [...SEED_ARTICLES];

export interface SaveArticleInput {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category: string;
  category_slug: string;
  cover_image?: string;
  cover_caption?: string;
  tags?: string[];
  status: ArticleStatus;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  references?: { title: string; url: string }[];
  is_lead_story?: boolean;
  is_featured?: boolean;
  template_type?: TemplateType;
  template_data?: Record<string, unknown>;
}

export interface CmsResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Extracts Table of Contents from Markdown headings (## Heading)
 */
export function extractTableOfContents(content: string) {
  if (!content) return [];
  const lines = content.split('\n');
  const toc: { id: string; title: string; level: number }[] = [];

  lines.forEach((line) => {
    if (line.startsWith('## ')) {
      const heading = line.replace('## ', '').trim();
      const id = heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      toc.push({ id, title: heading, level: 2 });
    } else if (line.startsWith('### ')) {
      const heading = line.replace('### ', '').trim();
      const id = heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      toc.push({ id, title: heading, level: 3 });
    }
  });

  return toc;
}

/**
 * Fetches all articles for the editorial management view (including drafts and in_review)
 */
export async function fetchEditorialArticles(filters?: {
  status?: string;
  search?: string;
  category?: string;
}): Promise<Article[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
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
          author:profiles(id, full_name, avatar_url, role)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category_slug', filters.category);
      }

      const { data, error } = await query;
      if (!error && data) {
        return (data as Array<Omit<Article, 'author'> & { author?: { id?: string; full_name?: string; avatar_url?: string; role?: string } | { id?: string; full_name?: string; avatar_url?: string; role?: string }[] }>).map((item) => {
          const authorObj = Array.isArray(item.author) ? item.author[0] : item.author;
          return {
            ...item,
            author: {
              id: authorObj?.id || 'unknown',
              name: authorObj?.full_name || 'Author',
              avatar: authorObj?.avatar_url,
              role: authorObj?.role || 'author',
            },
          } as Article;
        });
      }
    } catch (err) {
      console.warn('[CmsService] Supabase query failed, falling back to local store:', err);
    }
  }

  let list = [...localArticlesStore];
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((a) => a.status === filters.status);
  }
  if (filters?.category && filters.category !== 'all') {
    list = list.filter((a) => a.category_slug === filters.category);
  }
  if (filters?.search?.trim()) {
    const q = filters.search.toLowerCase();
    list = list.filter((a) => a.title.toLowerCase().includes(q) || a.author.name.toLowerCase().includes(q));
  }
  return list;
}

export async function fetchArticleForEditing(id: string): Promise<Article | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as Article;
      }
    } catch {
      // Fallback
    }
  }
  return localArticlesStore.find((a) => a.id === id) || null;
}

/**
 * Validates and saves an article draft or publication.
 * Enforces strict role boundaries for publishing transitions.
 */
export async function saveArticle(
  input: SaveArticleInput,
  user: { id: string; name: string; role: UserRole }
): Promise<CmsResponse<Article>> {
  // 1. Validate basic required fields
  if (!input.title || input.title.trim().length < 5) {
    return { data: null, error: 'Article title must be at least 5 characters long.' };
  }
  if (!input.content || input.content.trim().length < 20) {
    return { data: null, error: 'Article body content must be at least 20 characters long.' };
  }
  if (!input.category) {
    return { data: null, error: 'Please select a valid publication category.' };
  }

  // 2. Validate Role Transition Boundaries
  // Authors can only save as draft or submit as in_review; only editors and admins can publish
  if (user.role === 'author' && (input.status === 'published' || input.status === 'scheduled')) {
    return {
      data: null,
      error: 'Permission Denied: Contributors with the [author] role cannot directly publish articles. Please submit for review with status "in_review".',
    };
  }

  // Readers cannot save articles at all
  if (user.role === 'reader') {
    return {
      data: null,
      error: 'Permission Denied: Accounts with the [reader] role cannot author articles.',
    };
  }

  // 3. Resolve Unique Slug and Collision Handling
  const rawSlug = input.slug?.trim() ? generateSlug(input.slug) : generateSlug(input.title);
  const existingArticles = await fetchEditorialArticles();
  const existingSlugs = existingArticles
    .filter((a) => a.id !== input.id)
    .map((a) => a.slug);

  const finalSlug = resolveUniqueSlug(rawSlug, existingSlugs);

  // 4. Calculate metadata
  const readTime = calculateReadingTime(input.content);
  const toc = extractTableOfContents(input.content);
  const publishedAt =
    input.status === 'published'
      ? input.published_at || new Date().toISOString()
      : input.status === 'scheduled'
      ? input.published_at
      : undefined;

  const articlePayload = {
    title: input.title.trim(),
    slug: finalSlug,
    excerpt: input.excerpt?.trim() || input.content.slice(0, 160).replace(/[#*]/g, '').trim() + '...',
    content: input.content,
    category: input.category,
    category_slug: input.category_slug || input.category.toLowerCase().replace(/\s+/g, '-'),
    cover_image: input.cover_image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    cover_caption: input.cover_caption,
    tags: input.tags || [],
    status: input.status,
    published_at: publishedAt,
    read_time: readTime,
    table_of_contents: toc,
    "references": input.references || [],
    seo_title: input.seo_title || input.title,
    seo_description: input.seo_description || input.excerpt,
    is_lead_story: Boolean(input.is_lead_story),
    is_featured: Boolean(input.is_featured),
    template_type: input.template_type || 'standard',
    template_data: input.template_data || {},
    author_id: user.id,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      if (input.id) {
        // Update existing article
        const { data, error } = await supabase
          .from('articles')
          .update(articlePayload)
          .eq('id', input.id)
          .select()
          .single();

        if (error) {
          return { data: null, error: `Database update failed: ${error.message}` };
        }
        return { data: data as Article, error: null };
      } else {
        // Create new article
        const { data, error } = await supabase
          .from('articles')
          .insert({
            ...articlePayload,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return { data: null, error: `Database save failed: ${error.message}` };
        }
        return { data: data as Article, error: null };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown database error';
      return { data: null, error: msg };
    }
  }

  // Local state update for development
  const savedArticle: Article = {
    ...articlePayload,
    id: input.id || `art-${Date.now()}`,
    author: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
    published_at: publishedAt || 'Oct 20, 2026',
  };

  const existingIndex = localArticlesStore.findIndex((a) => a.id === savedArticle.id);
  if (existingIndex >= 0) {
    localArticlesStore[existingIndex] = savedArticle;
  } else {
    localArticlesStore = [savedArticle, ...localArticlesStore];
  }

  return { data: savedArticle, error: null };
}

/**
 * Uploads an article cover image to Supabase Storage with size and type validation
 */
export async function uploadArticleCoverImage(file: File): Promise<CmsResponse<string>> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      data: null,
      error: `Invalid file type (${file.type}). Allowed image formats: JPEG, PNG, WEBP.`,
    };
  }

  // Validate file size (max 5 MB to respect Supabase Free limits)
  const MAX_BYTES = 5 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      data: null,
      error: `File size too large (${sizeMb} MB). Maximum allowed upload is 5 MB.`,
    };
  }

  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        return { data: null, error: `Upload failed: ${uploadError.message}` };
      }

      const { data } = supabase.storage.from('article-media').getPublicUrl(filePath);
      return { data: data.publicUrl, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Storage upload failed';
      return { data: null, error: msg };
    }
  }

  // Return local blob URL for offline mock testing
  const mockUrl = URL.createObjectURL(file);
  return { data: mockUrl, error: null };
}

/**
 * Deletes an article enforcing role restrictions
 */
export async function deleteArticle(
  articleId: string,
  user: { id: string; role: UserRole }
): Promise<{ success: boolean; error: string | null }> {
  if (user.role === 'reader') {
    return { success: false, error: 'Unauthorized to delete articles.' };
  }

  if (isSupabaseConfigured) {
    try {
      // Authors can only delete their own drafts; Admins can delete anything
      let query = supabase.from('articles').delete().eq('id', articleId);
      if (user.role === 'author') {
        query = query.eq('author_id', user.id).eq('status', 'draft');
      }

      const { error } = await query;
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
    }
  }

  localArticlesStore = localArticlesStore.filter((a) => a.id !== articleId);
  return { success: true, error: null };
}
