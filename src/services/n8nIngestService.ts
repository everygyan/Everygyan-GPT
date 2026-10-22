import { CATEGORIES } from '../data/seedData';
import { generateSlug, resolveUniqueSlug } from '../utils/slug';
import { calculateReadingTime } from '../utils/readingTime';
import { extractTableOfContents } from './cmsService';
import { supabase, isSupabaseConfigured } from './supabase';
import { Article } from '../types';

export const MAX_PAYLOAD_BYTES = 500 * 1024; // 500 KB payload limit

export interface N8nSourceRef {
  title?: string;
  url: string;
}

export interface N8nDraftPayload {
  request_id?: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  source_urls: Array<N8nSourceRef> | string[];
  tags?: string[];
  cover_image?: string;
  cover_caption?: string;
  template_type?: 'standard' | 'travel' | 'tutorial';
  template_data?: Record<string, unknown>;
  // Security trap fields: explicitly validated to block unauthorized privilege elevation
  status?: string;
  action?: string;
  delete?: boolean;
}

export interface IngestResponse<T = unknown> {
  statusCode: number;
  body: {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    idempotent_replay?: boolean;
  };
}

export interface IngestedDraftResult {
  article_id: string;
  title: string;
  slug: string;
  status: 'draft';
  category: string;
  review_url: string;
  created_at: string;
}

// In-memory audit store for test environments or offline development
const localAuditLogs: Map<string, { article_id: string; timestamp: string }> = new Map();

/**
 * Validates whether a given string is a valid HTTP/HTTPS URL
 */
function isValidUrl(val: string): boolean {
  try {
    const url = new URL(val);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Ingests an article draft from an automated n8n workflow with strict least-privilege enforcement.
 *
 * Security Constraints:
 * 1. Requires valid shared secret.
 * 2. Payload size capped at 500 KB.
 * 3. Cannot publish, schedule, or delete articles (status strictly locked to 'draft').
 * 4. Cannot query subscriber lists or perform arbitrary SQL.
 * 5. Requires at least 1 validated source reference URL.
 * 6. Deduplicates via request_id / idempotency key.
 */
export async function processN8nDraftIngest(
  payload: unknown,
  providedSecret: string | null,
  expectedSecret: string,
  idempotencyHeader?: string | null
): Promise<IngestResponse<IngestedDraftResult>> {
  // 1. Secret Authentication
  if (!providedSecret || providedSecret !== expectedSecret) {
    return {
      statusCode: 401,
      body: {
        success: false,
        error: 'Unauthorized: Invalid or missing webhook secret.',
      },
    };
  }

  // 2. Payload Size Check
  const rawString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  if (rawString.length > MAX_PAYLOAD_BYTES) {
    return {
      statusCode: 413,
      body: {
        success: false,
        error: `Payload Too Large: Request exceeds maximum size limit of ${MAX_PAYLOAD_BYTES / 1024} KB.`,
      },
    };
  }

  // 3. JSON Structure & Malformed Validation
  if (!payload || typeof payload !== 'object') {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: 'Bad Request: Malformed JSON payload body.',
      },
    };
  }

  const data = payload as N8nDraftPayload;

  // 4. Prohibited Action Interception (Strict Least Privilege)
  if (data.action === 'delete' || data.delete === true) {
    return {
      statusCode: 403,
      body: {
        success: false,
        error: 'Forbidden: Automated pipelines are not permitted to delete articles or modify existing records.',
      },
    };
  }

  if (data.status && data.status !== 'draft') {
    return {
      statusCode: 403,
      body: {
        success: false,
        error: `Forbidden: Automated workflows cannot set status to '${data.status}'. All automated content must be created as 'draft' for editorial human review.`,
      },
    };
  }

  // 5. Title & Content Validation
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 5) {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: 'Validation Error: "title" is required and must be at least 5 characters long.',
      },
    };
  }

  if (!data.content || typeof data.content !== 'string' || data.content.trim().length < 50) {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: 'Validation Error: "content" is required and must be at least 50 characters long.',
      },
    };
  }

  // 6. Category Validation (Must match established publication taxonomy or legacy aliases)
  const categoryInput = (data.category || '').toLowerCase().trim();
  let matchedCategory = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === categoryInput || c.name.toLowerCase() === categoryInput
  );

  // Backward-compatible alias mapping
  if (!matchedCategory) {
    if (categoryInput === 'tech') {
      matchedCategory = CATEGORIES.find((c) => c.slug === 'learn-ai');
    } else if (categoryInput === 'learning') {
      matchedCategory = CATEGORIES.find((c) => c.slug === 'learn-sap');
    } else if (categoryInput === 'sports') {
      matchedCategory = CATEGORIES.find((c) => c.slug === 'news-asia');
    } else if (categoryInput === 'geopolitics') {
      matchedCategory = CATEGORIES.find((c) => c.slug === 'news-world');
    } else if (categoryInput === 'travel') {
      matchedCategory = CATEGORIES.find((c) => c.slug === 'travel-world');
    }
  }

  if (!matchedCategory) {
    const validNames = CATEGORIES.map((c) => c.slug).join(', ');
    return {
      statusCode: 400,
      body: {
        success: false,
        error: `Validation Error: Invalid category '${data.category}'. Allowed categories: ${validNames}.`,
      },
    };
  }

  // 7. Research Source URLs Validation (Every AI/n8n draft must cite sources)
  if (!data.source_urls || !Array.isArray(data.source_urls) || data.source_urls.length === 0) {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: 'Validation Error: At least one verified source URL ("source_urls") is required for research content.',
      },
    };
  }

  const normalizedSources: { title: string; url: string }[] = [];
  for (const item of data.source_urls) {
    const url = typeof item === 'string' ? item.trim() : (item.url || '').trim();
    const title = typeof item === 'string' ? item.trim() : (item.title || item.url || '').trim();

    if (!isValidUrl(url)) {
      return {
        statusCode: 400,
        body: {
          success: false,
          error: `Validation Error: Source URL '${url}' is not a valid HTTP/HTTPS link.`,
        },
      };
    }
    normalizedSources.push({ title, url });
  }

  // 8. Idempotency Key Resolution & Duplicate Replay Detection
  const idempotencyKey =
    idempotencyHeader ||
    data.request_id ||
    `idemp-${data.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30)}`;

  if (localAuditLogs.has(idempotencyKey)) {
    const cached = localAuditLogs.get(idempotencyKey)!;
    return {
      statusCode: 200,
      body: {
        success: true,
        idempotent_replay: true,
        message: 'Draft already ingested previously with this idempotency key.',
        data: {
          article_id: cached.article_id,
          title: data.title.trim(),
          slug: generateSlug(data.title),
          status: 'draft',
          category: matchedCategory.name,
          review_url: `https://everygyan.com/dashboard/articles/${cached.article_id}/edit`,
          created_at: cached.timestamp,
        },
      },
    };
  }

  // 9. Slug Generation
  const rawSlug = generateSlug(data.title);
  const finalSlug = resolveUniqueSlug(rawSlug, []);

  // 10. Metadata calculation
  const readTime = calculateReadingTime(data.content);
  const toc = extractTableOfContents(data.content);
  const now = new Date().toISOString();
  const articleId = `art-n8n-${Date.now()}`;

  const articleRecord: Partial<Article> = {
    id: articleId,
    title: data.title.trim(),
    slug: finalSlug,
    excerpt: data.excerpt?.trim() || data.content.slice(0, 160).replace(/[#*]/g, '').trim() + '...',
    content: data.content,
    category: matchedCategory.name,
    category_slug: matchedCategory.slug,
    tags: data.tags || ['Automated Draft', matchedCategory.name],
    cover_image: data.cover_image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    cover_caption: data.cover_caption || 'Source: Editorial research archive.',
    status: 'draft', // Hardcoded invariant: Always draft
    read_time: readTime,
    table_of_contents: toc,
    references: normalizedSources,
    template_type: data.template_type || 'standard',
    template_data: data.template_data || {},
  };

  // 11. Database Persistence & Audit Log
  if (isSupabaseConfigured) {
    try {
      // Check database audit logs for idempotency
      const { data: existingAudit } = await supabase
        .from('audit_logs')
        .select('entity_id, created_at')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existingAudit) {
        return {
          statusCode: 200,
          body: {
            success: true,
            idempotent_replay: true,
            message: 'Draft already recorded in database audit log.',
            data: {
              article_id: existingAudit.entity_id,
              title: data.title.trim(),
              slug: finalSlug,
              status: 'draft',
              category: matchedCategory.name,
              review_url: `https://everygyan.com/dashboard/articles/${existingAudit.entity_id}/edit`,
              created_at: existingAudit.created_at,
            },
          },
        };
      }

      // Fetch or assign author (fallback to system bot author)
      const { data: botAuthor } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['author', 'editor', 'admin'])
        .limit(1)
        .maybeSingle();

      const authorId = botAuthor?.id || '00000000-0000-0000-0000-000000000000';

      const { data: dbArticle, error: dbError } = await supabase
        .from('articles')
        .insert({
          ...articleRecord,
          author_id: authorId,
          created_at: now,
          updated_at: now,
        })
        .select('id, slug, title, status, category, created_at')
        .single();

      if (dbError) {
        return {
          statusCode: 500,
          body: {
            success: false,
            error: `Database Insertion Error: ${dbError.message}`,
          },
        };
      }

      // Record audit log entry
      await supabase.from('audit_logs').insert({
        event_type: 'n8n_draft_created',
        entity_type: 'article',
        entity_id: dbArticle.id,
        idempotency_key: idempotencyKey,
        actor: 'n8n_integration',
        metadata: {
          title: data.title,
          slug: finalSlug,
          category: matchedCategory.slug,
          sources_count: normalizedSources.length,
        },
      });

      return {
        statusCode: 201,
        body: {
          success: true,
          data: {
            article_id: dbArticle.id,
            title: dbArticle.title,
            slug: dbArticle.slug,
            status: 'draft',
            category: dbArticle.category,
            review_url: `https://everygyan.com/dashboard/articles/${dbArticle.id}/edit`,
            created_at: dbArticle.created_at,
          },
        },
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: {
          success: false,
          error: `Server Error: ${err instanceof Error ? err.message : 'Unknown database failure.'}`,
        },
      };
    }
  }

  // 12. Local / Offline Fallback Success
  localAuditLogs.set(idempotencyKey, { article_id: articleId, timestamp: now });

  return {
    statusCode: 201,
    body: {
      success: true,
      data: {
        article_id: articleId,
        title: articleRecord.title!,
        slug: finalSlug,
        status: 'draft',
        category: matchedCategory.name,
        review_url: `https://everygyan.com/dashboard/articles/${articleId}/edit`,
        created_at: now,
      },
    },
  };
}

/**
 * Helper to clear local test audit logs in test suites
 */
export function resetLocalAuditLogs() {
  localAuditLogs.clear();
}
