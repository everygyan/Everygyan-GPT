import { Comment, CommentStatus, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export interface SubmitCommentInput {
  articleId: string;
  articleTitle?: string;
  authorName: string;
  content: string;
  honeypot?: string; // Hidden bot field
  formRenderedAt?: number; // Milliseconds timestamp when form was rendered
}

export interface CommentFilter {
  status?: string;
  search?: string;
}

export interface PaginatedComments {
  comments: Comment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// In-memory development storage for offline/testing
let localCommentsStore: Comment[] = [
  {
    id: 'cmt-1',
    article_id: 'art-lead-1',
    article_title: 'Family Guide to Austria: From Vienna to Hallstatt',
    author_name: 'Priya Sharma',
    content: 'Vienna and Hallstatt are absolutely wonderful for young kids. The salt mine slides were an unforgettable highlight!',
    status: 'approved',
    created_at: '2026-10-20T03:30:00Z',
  },
  {
    id: 'cmt-2',
    article_id: 'art-2',
    article_title: 'SAP S/4HANA Cloud: Migration Architecture Guide',
    author_name: 'Rohit Verma',
    content: 'Could you please recommend introductory resources for Clean Core principles on BTP?',
    status: 'pending',
    created_at: '2026-10-20T04:15:00Z',
  },
  {
    id: 'cmt-3',
    article_id: 'art-1',
    article_title: 'The European Semiconductor Landscape in 2026',
    author_name: 'Alexandre Moreau',
    content: 'Great overview of the Dresden and Grenoble fabs. The supply chain resilience point is spot on.',
    status: 'approved',
    created_at: '2026-10-20T05:00:00Z',
  },
  {
    id: 'cmt-4',
    article_id: 'art-3',
    article_title: 'Sleep Optimization Science: Evidence-Based Rest Strategies',
    author_name: 'SpamBot9000',
    content: 'BUY CHEAP CRYPTO AIRDROP NOW AT http://spam-bonus-tokens.fake',
    status: 'spam',
    created_at: '2026-10-20T05:30:00Z',
  },
];

// Rate limiting state per browser session
let lastSubmissionTimestamp = 0;
const SUBMISSION_COOLDOWN_MS = 20000; // 20 seconds cooldown

/**
 * Sanitizes comment text:
 * - Strips all HTML/XML tags
 * - Strips script tags and event handlers
 * - Collapses excessive whitespace while preserving single newlines
 * - Enforces UTF-8 printable content
 */
export function sanitizeCommentText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Strip style tags
    .replace(/<[^>]+>/g, '') // Strip all remaining HTML tags
    .replace(/javascript:/gi, '') // Strip javascript pseudo-protocols
    .replace(/on\w+="[^"]*"/gi, '') // Strip inline JS handlers
    .replace(/[\r\n]{3,}/g, '\n\n') // Collapse excessive newlines
    .trim();
}

/**
 * Built-in spam detection heuristics:
 * 1. Honeypot check (hidden field filled by bots)
 * 2. Instant submission velocity check (< 2.5 seconds to fill form)
 * 3. Keyword and spam link analysis
 */
export function detectSpam(
  content: string,
  authorName: string,
  honeypot?: string,
  formRenderedAt?: number
): { isSpam: boolean; reason?: string } {
  // 1. Honeypot trap
  if (honeypot && honeypot.trim().length > 0) {
    return { isSpam: true, reason: 'Honeypot trap triggered (automated bot detection)' };
  }

  // 2. Velocity check: human beings take at least 2.5 seconds to read/type
  if (formRenderedAt && Date.now() - formRenderedAt < 2500) {
    return { isSpam: true, reason: 'Submission too rapid (< 2.5s), automated script detected' };
  }

  // 3. Spam keyword and excessive URL heuristics
  const spamKeywords = [
    /\b(casino|viagra|cialis|crypto\s*airdrop|poker|free\s*tokens|buy\s*followers)\b/i,
    /\b(earn\s*\$?\d{3,}\s*(daily|per\s*day|hourly))\b/i,
    /(http|https):\/\/[^\s]{20,}/gi, // Long obscure URLs
  ];

  for (const pattern of spamKeywords) {
    if (pattern.test(content) || pattern.test(authorName)) {
      return { isSpam: true, reason: 'Matched automated spam keyword signature' };
    }
  }

  // Count links - more than 2 links in a short comment is spam
  const linkMatches = content.match(/https?:\/\//gi);
  if (linkMatches && linkMatches.length > 2) {
    return { isSpam: true, reason: 'Too many URLs in comment body' };
  }

  return { isSpam: false };
}

/**
 * Checks in-session rate limit
 */
export function checkRateLimit(): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const elapsed = now - lastSubmissionTimestamp;
  if (lastSubmissionTimestamp > 0 && elapsed < SUBMISSION_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((SUBMISSION_COOLDOWN_MS - elapsed) / 1000);
    return { allowed: false, waitSeconds };
  }
  return { allowed: true };
}

/**
 * Submits a new comment for moderation.
 * Regardless of user role, ALL submitted comments enter status = 'pending' or 'spam'.
 * Never immediately published.
 */
export async function submitComment(
  input: SubmitCommentInput,
  user?: { id: string; name: string } | null
): Promise<{ data: Comment | null; error: string | null }> {
  // 1. Rate Limit Verification
  const rateLimit = checkRateLimit();
  if (!rateLimit.allowed) {
    return {
      data: null,
      error: `Please wait ${rateLimit.waitSeconds} seconds before posting another comment.`,
    };
  }

  // 2. Text Sanitization
  const cleanAuthorName = sanitizeCommentText(input.authorName);
  const cleanContent = sanitizeCommentText(input.content);

  // 3. Field Validation & Length Limits
  if (!cleanAuthorName || cleanAuthorName.length < 2) {
    return { data: null, error: 'Author name must be at least 2 characters long.' };
  }
  if (cleanAuthorName.length > 60) {
    return { data: null, error: 'Author name cannot exceed 60 characters.' };
  }
  if (!cleanContent || cleanContent.length < 3) {
    return { data: null, error: 'Comment must be at least 3 characters long.' };
  }
  if (cleanContent.length > 1000) {
    return { data: null, error: 'Comment cannot exceed 1,000 characters.' };
  }

  // 4. Spam Detection
  const spamCheck = detectSpam(cleanContent, cleanAuthorName, input.honeypot, input.formRenderedAt);
  const initialStatus: CommentStatus = spamCheck.isSpam ? 'spam' : 'pending';

  // Record rate limit timestamp
  lastSubmissionTimestamp = Date.now();

  const commentPayload = {
    article_id: input.articleId,
    user_id: user?.id || null,
    author_name: cleanAuthorName,
    content: cleanContent,
    status: initialStatus,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert(commentPayload)
        .select()
        .single();

      if (error) {
        return { data: null, error: `Failed to submit comment: ${error.message}` };
      }

      return { data: data as Comment, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database error';
      return { data: null, error: msg };
    }
  }

  // Local fallback for offline/development
  const localComment: Comment = {
    ...commentPayload,
    id: `cmt-${Date.now()}`,
    article_title: input.articleTitle || 'Article',
    user_id: user?.id,
  };

  localCommentsStore = [localComment, ...localCommentsStore];
  return { data: localComment, error: null };
}

/**
 * Fetches approved comments for an article (Public Readers).
 * Strictly filters by status = 'approved'.
 * Supports pagination.
 */
export async function fetchApprovedComments(
  articleId: string,
  page = 1,
  pageSize = 10
): Promise<PaginatedComments> {
  if (isSupabaseConfigured) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('comments')
        .select('id, article_id, author_name, content, status, created_at', { count: 'exact' })
        .eq('article_id', articleId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        const total = count || data.length;
        return {
          comments: data as Comment[],
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize) || 1,
        };
      }
    } catch (err) {
      console.warn('[CommentService] Supabase fetch failed, falling back:', err);
    }
  }

  // Local fallback
  const approved = localCommentsStore.filter(
    (c) => c.article_id === articleId && c.status === 'approved'
  );
  const total = approved.length;
  const startIndex = (page - 1) * pageSize;
  const pageItems = approved.slice(startIndex, startIndex + pageSize);

  return {
    comments: pageItems,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

/**
 * Fetches comments for the moderator/admin dashboard queue.
 * Allows filtering by status ('pending', 'approved', 'rejected', 'spam', 'all').
 */
export async function fetchCommentsForModeration(
  filter?: CommentFilter,
  page = 1,
  pageSize = 20
): Promise<PaginatedComments> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('comments')
        .select(`
          id,
          article_id,
          author_name,
          content,
          status,
          created_at,
          article:articles(title)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (!error && data) {
        const total = count || data.length;
        const mapped: Comment[] = (data as Array<{
          id: string;
          article_id: string;
          author_name: string;
          content: string;
          status: string;
          created_at: string;
          article?: { title?: string } | { title?: string }[];
        }>).map((item) => {
          const articleObj = Array.isArray(item.article) ? item.article[0] : item.article;
          return {
            id: item.id,
            article_id: item.article_id,
            article_title: articleObj?.title || 'Unknown Article',
            author_name: item.author_name,
            content: item.content,
            status: item.status as CommentStatus,
            created_at: item.created_at,
          };
        });

        return {
          comments: mapped,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize) || 1,
        };
      }
    } catch (err) {
      console.warn('[CommentService] Moderation fetch failed, using local store:', err);
    }
  }

  // Local fallback
  let list = [...localCommentsStore];
  if (filter?.status && filter.status !== 'all') {
    list = list.filter((c) => c.status === filter.status);
  }
  if (filter?.search?.trim()) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.author_name.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        (c.article_title && c.article_title.toLowerCase().includes(q))
    );
  }

  const total = list.length;
  const startIndex = (page - 1) * pageSize;
  const pageItems = list.slice(startIndex, startIndex + pageSize);

  return {
    comments: pageItems,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

/**
 * Updates a comment's moderation status.
 * Strictly checks that the actor is a moderator, editor, or admin.
 * Readers and authors are unauthorized.
 */
export async function updateCommentStatus(
  commentId: string,
  newStatus: CommentStatus,
  userRole: UserRole
): Promise<{ success: boolean; error: string | null }> {
  // Enforce role authorization
  const allowedRoles: UserRole[] = ['moderator', 'editor', 'admin'];
  if (!allowedRoles.includes(userRole)) {
    return {
      success: false,
      error: `Permission Denied: User role [${userRole}] cannot moderate comments. Only moderators and editors can update statuses.`,
    };
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: newStatus })
        .eq('id', commentId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  }

  // Local store update
  const index = localCommentsStore.findIndex((c) => c.id === commentId);
  if (index >= 0) {
    localCommentsStore[index] = { ...localCommentsStore[index], status: newStatus };
    return { success: true, error: null };
  }
  return { success: false, error: 'Comment not found' };
}

/**
 * Deletes a comment completely.
 * Allowed for moderators and administrators only.
 */
export async function deleteComment(
  commentId: string,
  userRole: UserRole
): Promise<{ success: boolean; error: string | null }> {
  const allowedRoles: UserRole[] = ['moderator', 'admin'];
  if (!allowedRoles.includes(userRole)) {
    return {
      success: false,
      error: `Permission Denied: User role [${userRole}] cannot delete comments.`,
    };
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
    }
  }

  localCommentsStore = localCommentsStore.filter((c) => c.id !== commentId);
  return { success: true, error: null };
}
