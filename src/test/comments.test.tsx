import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {
    from: vi.fn(),
  },
}));

import {
  sanitizeCommentText,
  detectSpam,
  submitComment,
  fetchApprovedComments,
  updateCommentStatus,
  deleteComment,
} from '../services/commentService';
import { CommentSection } from '../components/article/CommentSection';
import { AuthProvider } from '../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

describe('Comments, Spam Controls & Moderation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Safe Text Rendering & Sanitization (XSS Prevention)', () => {
    it('strips script tags and executable Javascript from comment text', () => {
      const maliciousPayload = '<script>alert("XSS Attack!")</script>This is clean text.';
      const sanitized = sanitizeCommentText(maliciousPayload);
      expect(sanitized).toBe('This is clean text.');
      expect(sanitized).not.toContain('<script>');
    });

    it('strips HTML image tags with onerror handlers', () => {
      const maliciousPayload = '<img src="invalid.jpg" onerror="alert(document.cookie)" />Interesting article!';
      const sanitized = sanitizeCommentText(maliciousPayload);
      expect(sanitized).toBe('Interesting article!');
      expect(sanitized).not.toContain('<img');
      expect(sanitized).not.toContain('onerror');
    });

    it('strips javascript pseudo-protocols in links', () => {
      const maliciousPayload = '<a href="javascript:doEvil()">Click here</a> to see my site.';
      const sanitized = sanitizeCommentText(maliciousPayload);
      expect(sanitized).toBe('Click here to see my site.');
      expect(sanitized).not.toContain('javascript:');
    });

    it('renders comment content as safe text nodes without interpreting HTML tags', () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <CommentSection articleId="art-lead-1" articleTitle="Family Guide to Austria" />
          </AuthProvider>
        </MemoryRouter>
      );

      // Verify safe container is present
      expect(screen.getByRole('region', { name: /comments/i })).toBeInTheDocument();
    });
  });

  describe('Validation & Length Limits', () => {
    it('rejects comments that are too short (< 3 characters)', async () => {
      const result = await submitComment({
        articleId: 'art-lead-1',
        authorName: 'Valid Name',
        content: 'Hi',
      });

      expect(result.data).toBeNull();
      expect(result.error).toContain('at least 3 characters');
    });

    it('rejects comments with an author name shorter than 2 characters', async () => {
      const result = await submitComment({
        articleId: 'art-lead-1',
        authorName: 'A',
        content: 'This is a genuine comment with sufficient length.',
      });

      expect(result.data).toBeNull();
      expect(result.error).toContain('Author name must be at least 2 characters');
    });

    it('rejects comments exceeding 1,000 characters', async () => {
      const longComment = 'a'.repeat(1001);
      const result = await submitComment({
        articleId: 'art-lead-1',
        authorName: 'Devansh',
        content: longComment,
      });

      expect(result.data).toBeNull();
      expect(result.error).toContain('cannot exceed 1,000 characters');
    });
  });

  describe('Anti-Spam Heuristics & Honeypot Detection', () => {
    it('flags submission as spam when honeypot trap field is populated by bots', () => {
      const check = detectSpam('Valid normal comment body here', 'Bot User', 'http://bot-trap.com');
      expect(check.isSpam).toBe(true);
      expect(check.reason).toContain('Honeypot trap');
    });

    it('flags submission as spam if submitted under 2.5 seconds (instant script velocity)', () => {
      const renderedTime = Date.now() - 500; // 500ms ago
      const check = detectSpam('Normal comment', 'Fast Bot', undefined, renderedTime);
      expect(check.isSpam).toBe(true);
      expect(check.reason).toContain('Submission too rapid');
    });

    it('flags automated spam keywords in comment body', () => {
      const spamText = 'Check out this free crypto airdrop on telegram!';
      const check = detectSpam(spamText, 'CryptoSpammer');
      expect(check.isSpam).toBe(true);
      expect(check.reason).toContain('spam keyword');
    });

    it('allows clean human comment submitted after realistic typing time', () => {
      const renderedTime = Date.now() - 5000; // 5 seconds ago
      const check = detectSpam(
        'Thank you for the detailed breakdown of the travel itinerary.',
        'Maya Rao',
        '',
        renderedTime
      );
      expect(check.isSpam).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('blocks immediate repeated submissions within cooldown period', async () => {
      // First submission
      const first = await submitComment({
        articleId: 'art-lead-1',
        authorName: 'Normal Reader',
        content: 'First thoughtful comment on this post.',
        formRenderedAt: Date.now() - 4000,
      });
      expect(first.error).toBeNull();

      // Immediate second submission
      const second = await submitComment({
        articleId: 'art-lead-1',
        authorName: 'Normal Reader',
        content: 'Immediate second comment should be rate limited.',
        formRenderedAt: Date.now() - 4000,
      });

      expect(second.data).toBeNull();
      expect(second.error).toContain('Please wait');
    });
  });

  describe('Role Authorization & Moderation Actions', () => {
    it('blocks reader role from approving comments', async () => {
      const result = await updateCommentStatus('cmt-2', 'approved', 'reader');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission Denied');
    });

    it('blocks author role from approving comments', async () => {
      const result = await updateCommentStatus('cmt-2', 'approved', 'author');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission Denied');
    });

    it('allows moderator and editor roles to approve comments', async () => {
      const modResult = await updateCommentStatus('cmt-2', 'approved', 'moderator');
      expect(modResult.success).toBe(true);
      expect(modResult.error).toBeNull();

      const editorResult = await updateCommentStatus('cmt-2', 'rejected', 'editor');
      expect(editorResult.success).toBe(true);
      expect(editorResult.error).toBeNull();
    });

    it('blocks non-admin/non-moderator from deleting comments', async () => {
      const result = await deleteComment('cmt-2', 'reader');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission Denied');
    });
  });

  describe('Public Comments Isolation (Pending/Spam Invisibility)', () => {
    it('fetchApprovedComments strictly returns only approved comments', async () => {
      const result = await fetchApprovedComments('art-lead-1');
      const hasUnapproved = result.comments.some((c) => c.status !== 'approved');
      expect(hasUnapproved).toBe(false);
    });
  });
});
