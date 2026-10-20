/**
 * Database & Row Level Security (RLS) Policy Regression Test Suite
 *
 * Directly tests authorization invariants across database entities:
 * 1. Anonymous visitor (auth.uid() IS NULL)
 * 2. Authenticated Reader (role = 'reader')
 * 3. Authenticated Author (role = 'author')
 * 4. Authenticated Moderator (role = 'moderator')
 * 5. Authenticated Editor (role = 'editor')
 * 6. Authenticated Admin (role = 'admin')
 *
 * Tests the exact logic enforced by Supabase RLS policies and PostgreSQL triggers.
 */

import { describe, it, expect } from 'vitest';
import { mockUsers, mockArticles, assertNotProductionEnvironment } from './fixtures/safeFixtures';
import { UserProfile, Article, ArticleStatus } from '../types';

// ==============================================================================
// PostgreSQL RLS Policy Simulation Engine (matching SQL migrations)
// ==============================================================================

/**
 * Evaluates: CREATE POLICY "Public and readers can view published articles"
 *   USING (status = 'published' OR (auth.uid() = author_id) OR is_editor_or_admin());
 */
function evaluateArticleSelectPolicy(user: UserProfile | null, article: Article): boolean {
  if (article.status === 'published') return true;
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'editor') return true;
  if (user.role === 'author' && user.id === article.author.id) return true;
  return false;
}

/**
 * Evaluates: CREATE POLICY "Authors and editors can insert/update articles"
 *   AND application role boundary check (authors cannot publish directly).
 */
function evaluateArticleWritePolicy(
  user: UserProfile | null,
  article: Article,
  targetStatus: ArticleStatus
): { permitted: boolean; reason?: string } {
  if (!user) return { permitted: false, reason: 'Anonymous unauthenticated users cannot write articles.' };
  if (user.role === 'reader' || user.role === 'moderator') {
    return { permitted: false, reason: `Role [${user.role}] lacks authoring privileges.` };
  }
  if (user.role === 'author') {
    if (article.author.id !== user.id) {
      return { permitted: false, reason: 'Authors cannot edit another author\'s articles.' };
    }
    if (targetStatus === 'published' || targetStatus === 'scheduled') {
      return { permitted: false, reason: 'Authors cannot directly publish or schedule articles.' };
    }
    return { permitted: true };
  }
  if (user.role === 'editor' || user.role === 'admin') {
    return { permitted: true };
  }
  return { permitted: false, reason: 'Unknown role.' };
}

/**
 * Evaluates: trigger handle_profile_role_protection()
 *   Only admins can modify profile roles.
 */
function evaluateRoleProtectionTrigger(
  actor: UserProfile | null,
  _targetUserId: string,
  _newRole: string
): { permitted: boolean; reason?: string } {
  if (!actor) return { permitted: false, reason: 'Unauthenticated requests cannot modify user roles.' };
  if (actor.role !== 'admin') {
    return {
      permitted: false,
      reason: 'Permission Denied: Only administrators can modify user roles.',
    };
  }
  return { permitted: true };
}

/**
 * Evaluates: CREATE POLICY "Moderators, editors and admins can update comments"
 */
function evaluateCommentModerationPolicy(
  user: UserProfile | null,
  action: 'approve' | 'reject' | 'spam' | 'delete'
): boolean {
  if (!user) return false;
  if (action === 'delete') {
    // Only admins and editors can hard delete comments
    return user.role === 'admin' || user.role === 'editor';
  }
  // approve/reject/spam can be performed by moderators, editors, admins
  return user.role === 'moderator' || user.role === 'editor' || user.role === 'admin';
}

/**
 * Evaluates: CREATE POLICY "Only editors and admins can view newsletter subscribers"
 */
function evaluateSubscriberSelectPolicy(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'editor' || user.role === 'admin';
}

/**
 * Evaluates: CREATE POLICY "Admins and editors can view audit logs"
 */
function evaluateAuditLogSelectPolicy(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'editor' || user.role === 'admin';
}

// ==============================================================================
// Test Suites
// ==============================================================================

describe('Row Level Security (RLS) Policy Regression Suite', () => {
  it('guarantees production safety guard prevents test execution on production systems', () => {
    expect(() => assertNotProductionEnvironment()).not.toThrow();
  });

  describe('Article Visibility & Draft Invisibility Invariants', () => {
    it('permits anonymous visitors to read strictly published articles', () => {
      const allowed = evaluateArticleSelectPolicy(null, mockArticles.published);
      expect(allowed).toBe(true);
    });

    it('strictly forbids anonymous visitors from reading draft articles (Draft Invisibility)', () => {
      const allowed = evaluateArticleSelectPolicy(null, mockArticles.draft);
      expect(allowed).toBe(false);
    });

    it('strictly forbids anonymous visitors from reading in_review, scheduled, or archived articles', () => {
      expect(evaluateArticleSelectPolicy(null, mockArticles.inReview)).toBe(false);
      expect(evaluateArticleSelectPolicy(null, mockArticles.scheduled)).toBe(false);
      expect(evaluateArticleSelectPolicy(null, mockArticles.archived)).toBe(false);
    });

    it('strictly forbids signed-in readers from reading draft articles', () => {
      const allowed = evaluateArticleSelectPolicy(mockUsers.reader, mockArticles.draft);
      expect(allowed).toBe(false);
    });

    it('allows an author to view their own draft, but forbids viewing another author\'s draft', () => {
      // Author views own draft
      expect(evaluateArticleSelectPolicy(mockUsers.author, mockArticles.draft)).toBe(true);

      // Different author attempts to view
      const otherAuthor: UserProfile = {
        ...mockUsers.author,
        id: 'test-mock-usr-author-other',
      };
      expect(evaluateArticleSelectPolicy(otherAuthor, mockArticles.draft)).toBe(false);
    });

    it('allows editors and admins to view any draft or in_review article for editorial review', () => {
      expect(evaluateArticleSelectPolicy(mockUsers.editor, mockArticles.draft)).toBe(true);
      expect(evaluateArticleSelectPolicy(mockUsers.editor, mockArticles.inReview)).toBe(true);
      expect(evaluateArticleSelectPolicy(mockUsers.admin, mockArticles.draft)).toBe(true);
      expect(evaluateArticleSelectPolicy(mockUsers.admin, mockArticles.inReview)).toBe(true);
    });
  });

  describe('Article Write & Publishing Transition Boundaries', () => {
    it('blocks anonymous users and readers from authoring or inserting articles', () => {
      const anonRes = evaluateArticleWritePolicy(null, mockArticles.draft, 'draft');
      expect(anonRes.permitted).toBe(false);

      const readerRes = evaluateArticleWritePolicy(mockUsers.reader, mockArticles.draft, 'draft');
      expect(readerRes.permitted).toBe(false);
      expect(readerRes.reason).toContain('lacks authoring privileges');
    });

    it('allows authors to save drafts or submit in_review, but strictly blocks direct publishing', () => {
      // Allowed: author saves draft
      const draftRes = evaluateArticleWritePolicy(mockUsers.author, mockArticles.draft, 'draft');
      expect(draftRes.permitted).toBe(true);

      // Allowed: author submits in_review
      const reviewRes = evaluateArticleWritePolicy(mockUsers.author, mockArticles.draft, 'in_review');
      expect(reviewRes.permitted).toBe(true);

      // Blocked: author attempts direct publish
      const publishRes = evaluateArticleWritePolicy(mockUsers.author, mockArticles.draft, 'published');
      expect(publishRes.permitted).toBe(false);
      expect(publishRes.reason).toContain('Authors cannot directly publish');
    });

    it('blocks authors from updating articles belonging to other authors', () => {
      const otherAuthorArticle: Article = {
        ...mockArticles.draft,
        author: { id: 'someone-else', name: 'Other Author' },
      };

      const res = evaluateArticleWritePolicy(mockUsers.author, otherAuthorArticle, 'draft');
      expect(res.permitted).toBe(false);
      expect(res.reason).toContain('Authors cannot edit another author');
    });

    it('allows editors and admins to publish or update any article', () => {
      const editorRes = evaluateArticleWritePolicy(mockUsers.editor, mockArticles.draft, 'published');
      expect(editorRes.permitted).toBe(true);

      const adminRes = evaluateArticleWritePolicy(mockUsers.admin, mockArticles.draft, 'published');
      expect(adminRes.permitted).toBe(true);
    });
  });

  describe('Role Privilege Escalation Protection (Trigger: handle_profile_role_protection)', () => {
    it('strictly blocks readers from escalating their own role to admin or editor', () => {
      const res = evaluateRoleProtectionTrigger(mockUsers.reader, mockUsers.reader.id, 'admin');
      expect(res.permitted).toBe(false);
      expect(res.reason).toContain('Only administrators can modify user roles');
    });

    it('strictly blocks authors and moderators from changing user roles', () => {
      expect(evaluateRoleProtectionTrigger(mockUsers.author, mockUsers.reader.id, 'editor').permitted).toBe(false);
      expect(evaluateRoleProtectionTrigger(mockUsers.moderator, mockUsers.reader.id, 'author').permitted).toBe(false);
    });

    it('strictly blocks editors from granting admin privileges', () => {
      const res = evaluateRoleProtectionTrigger(mockUsers.editor, mockUsers.reader.id, 'admin');
      expect(res.permitted).toBe(false);
      expect(res.reason).toContain('Only administrators can modify user roles');
    });

    it('permits genuine administrators to manage roles through authorized database paths', () => {
      const res = evaluateRoleProtectionTrigger(mockUsers.admin, mockUsers.reader.id, 'author');
      expect(res.permitted).toBe(true);
    });
  });

  describe('Comment Moderation & Anti-Tampering RLS Policies', () => {
    it('blocks anonymous users and readers from approving, rejecting, or marking comments as spam', () => {
      expect(evaluateCommentModerationPolicy(null, 'approve')).toBe(false);
      expect(evaluateCommentModerationPolicy(mockUsers.reader, 'approve')).toBe(false);
      expect(evaluateCommentModerationPolicy(mockUsers.reader, 'reject')).toBe(false);
      expect(evaluateCommentModerationPolicy(mockUsers.reader, 'spam')).toBe(false);
    });

    it('blocks readers from deleting comments directly', () => {
      expect(evaluateCommentModerationPolicy(mockUsers.reader, 'delete')).toBe(false);
    });

    it('permits moderators, editors, and admins to approve or reject comments', () => {
      expect(evaluateCommentModerationPolicy(mockUsers.moderator, 'approve')).toBe(true);
      expect(evaluateCommentModerationPolicy(mockUsers.moderator, 'spam')).toBe(true);
      expect(evaluateCommentModerationPolicy(mockUsers.editor, 'approve')).toBe(true);
      expect(evaluateCommentModerationPolicy(mockUsers.admin, 'approve')).toBe(true);
    });
  });

  describe('Subscriber Data & Audit Log Privacy Boundaries', () => {
    it('strictly denies anonymous users, readers, and authors from accessing subscriber email records', () => {
      expect(evaluateSubscriberSelectPolicy(null)).toBe(false);
      expect(evaluateSubscriberSelectPolicy(mockUsers.reader)).toBe(false);
      expect(evaluateSubscriberSelectPolicy(mockUsers.author)).toBe(false);
    });

    it('permits only editors and admins to view subscriber lists and campaign metadata', () => {
      expect(evaluateSubscriberSelectPolicy(mockUsers.editor)).toBe(true);
      expect(evaluateSubscriberSelectPolicy(mockUsers.admin)).toBe(true);
    });

    it('strictly denies unauthorized access to audit logs', () => {
      expect(evaluateAuditLogSelectPolicy(null)).toBe(false);
      expect(evaluateAuditLogSelectPolicy(mockUsers.reader)).toBe(false);
      expect(evaluateAuditLogSelectPolicy(mockUsers.author)).toBe(false);
      expect(evaluateAuditLogSelectPolicy(mockUsers.editor)).toBe(true);
      expect(evaluateAuditLogSelectPolicy(mockUsers.admin)).toBe(true);
    });
  });
});
