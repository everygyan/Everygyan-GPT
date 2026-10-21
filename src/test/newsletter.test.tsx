import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {
    from: vi.fn(),
  },
}));

import {
  validateEmail,
  subscribeToNewsletter,
  confirmSubscription,
  unsubscribeFromNewsletter,
  exportSubscribersCsv,
  saveCampaign,
  sendTestEmail,
  processCampaignBatch,
  fetchSubscribersForAdmin,
  adminConfirmSubscriber,
  adminUnsubscribeSubscriber,
} from '../services/newsletterService';

describe('Newsletter Subsystem & Double Opt-in Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Email Format Validation', () => {
    it('accepts standard RFC compliant email addresses', () => {
      expect(validateEmail('sandeep@everygyan.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('reader_123@sub.example.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });
  });

  describe('Double Opt-in Subscription Lifecycle', () => {
    it('creates new subscriber as pending_confirmation with verification token', async () => {
      const email = `newreader_${Date.now()}@test.com`;
      const res = await subscribeToNewsletter(email, 'homepage_banner');

      expect(res.success).toBe(true);
      expect(res.requiresConfirmation).toBe(true);
      expect(res.confirmationUrl).toContain('/newsletter/confirm?token=');

      // Verify in admin records
      const all = await fetchSubscribersForAdmin({ search: email });
      expect(all.length).toBe(1);
      expect(all[0].status).toBe('pending_confirmation');
      expect(all[0].consent_source).toBe('homepage_banner');
    });

    it('confirms double opt-in when valid confirmation token is supplied', async () => {
      const email = `confirm_test_${Date.now()}@test.com`;
      const subRes = await subscribeToNewsletter(email, 'article_footer');
      const token = subRes.confirmationUrl?.split('token=')[1];
      expect(token).toBeDefined();

      const confirmRes = await confirmSubscription(token!);
      expect(confirmRes.success).toBe(true);
      expect(confirmRes.email).toBe(email);

      // Verify status is now confirmed
      const verified = await fetchSubscribersForAdmin({ search: email });
      expect(verified[0].status).toBe('confirmed');
      expect(verified[0].confirmed_at).toBeDefined();
    });

    it('rejects invalid or missing confirmation tokens', async () => {
      const res = await confirmSubscription('non_existent_token_12345');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid or expired');
    });
  });

  describe('Duplicate Signup Handling', () => {
    it('handles duplicate signup for already confirmed users idempotently', async () => {
      // Confirmed subscriber from seed store: reader1@example.com
      const res = await subscribeToNewsletter('reader1@example.com', 'header_subscribe');
      expect(res.success).toBe(true);
      expect(res.message).toContain('already subscribed');
      expect(res.requiresConfirmation).toBe(false);
    });

    it('resends confirmation message for pending subscriber without creating duplicate', async () => {
      // Pending subscriber from seed store: techfan@sample.org
      const res = await subscribeToNewsletter('techfan@sample.org', 'header_subscribe');
      expect(res.success).toBe(true);
      expect(res.requiresConfirmation).toBe(true);
      expect(res.confirmationUrl).toContain('conf-token-003');
    });
  });

  describe('Unsubscribe Lifecycle (No Login Required)', () => {
    it('unsubscribes confirmed subscriber via token without authentication', async () => {
      // Unsubscribe token for traveler@everygyan.com is 'unsub-token-002'
      const res = await unsubscribeFromNewsletter('unsub-token-002');
      expect(res.success).toBe(true);
      expect(res.email).toBe('traveler@everygyan.com');

      const updated = await fetchSubscribersForAdmin({ search: 'traveler@everygyan.com' });
      expect(updated[0].status).toBe('unsubscribed');
    });

    it('rejects invalid unsubscribe token', async () => {
      const res = await unsubscribeFromNewsletter('fake_unsub_token');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid or expired');
    });
  });

  describe('Administrator Subscriber Moderation Actions', () => {
    it('allows admin to manually confirm a pending subscriber by id', async () => {
      const email = `admin_confirm_test_${Date.now()}@example.com`;
      await subscribeToNewsletter(email, 'homepage_banner');

      const records = await fetchSubscribersForAdmin({ search: email });
      expect(records.length).toBe(1);
      expect(records[0].status).toBe('pending_confirmation');

      const result = await adminConfirmSubscriber(records[0].id);
      expect(result.success).toBe(true);

      const updated = await fetchSubscribersForAdmin({ search: email });
      expect(updated[0].status).toBe('confirmed');
      expect(updated[0].confirmed_at).toBeDefined();
    });

    it('allows admin to manually unsubscribe a subscriber by id', async () => {
      const email = `admin_unsub_test_${Date.now()}@example.com`;
      await subscribeToNewsletter(email, 'homepage_banner');

      const records = await fetchSubscribersForAdmin({ search: email });
      expect(records.length).toBe(1);

      await adminConfirmSubscriber(records[0].id);

      const result = await adminUnsubscribeSubscriber(records[0].id);
      expect(result.success).toBe(true);

      const updated = await fetchSubscribersForAdmin({ search: email });
      expect(updated[0].status).toBe('unsubscribed');
    });

    it('returns error when admin tries to confirm non-existent subscriber', async () => {
      const result = await adminConfirmSubscriber('non-existent-sub-id');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Subscriber not found');
    });
  });

  describe('Audience Exclusion & Marketing Sends', () => {
    it('strictly excludes pending and unsubscribed members from campaign batches', async () => {
      const batch = await processCampaignBatch('camp-1', 50);

      // Verify that no unconfirmed or unsubscribed emails were sent
      const sentEmails = batch.logs.map((l) => l.recipient_email);
      expect(sentEmails).not.toContain('techfan@sample.org'); // Pending
      expect(sentEmails).not.toContain('optout@example.org'); // Unsubscribed
    });
  });

  describe('Campaign Management & Batch Dispatch', () => {
    it('rejects campaign drafts with missing required fields', async () => {
      const res = await saveCampaign({ title: 'Hi', subject: 'Short', content: 'Short' });
      expect(res.data).toBeNull();
      expect(res.error).toContain('at least 3 characters');
    });

    it('saves a valid newsletter campaign draft', async () => {
      const res = await saveCampaign({
        title: 'Issue #15 — November Planning',
        subject: 'EveryGyan: Winter Escapes & SAP Migration Architecture',
        preheader: 'Your weekend briefing',
        content: '# Deep dive into ABAP RAP and Alpine destinations.\n\nMore content here...',
      });

      expect(res.error).toBeNull();
      expect(res.data?.status).toBe('draft');
      expect(res.data?.id).toBeDefined();
    });

    it('sends test email to specified administrator address', async () => {
      const testRes = await sendTestEmail('camp-1', 'admin@everygyan.com');
      expect(testRes.success).toBe(true);
      expect(testRes.message).toContain('admin@everygyan.com');
    });

    it('rejects test email if recipient address is invalid', async () => {
      const testRes = await sendTestEmail('camp-1', 'invalid-email');
      expect(testRes.success).toBe(false);
      expect(testRes.error).toContain('Invalid email');
    });
  });

  describe('CSV Export', () => {
    it('generates clean RFC-compliant CSV headers and quoted rows', () => {
      const subscribers = [
        {
          id: 'sub-1',
          email: 'test@example.com',
          status: 'confirmed' as const,
          unsubscribe_token: 'tok-1',
          consent_source: 'homepage_banner',
          consent_at: '2026-10-20T00:00:00Z',
          confirmed_at: '2026-10-20T00:05:00Z',
          created_at: '2026-10-20T00:00:00Z',
        },
      ];

      const csv = exportSubscribersCsv(subscribers);
      expect(csv).toContain('Email,Status,Consent Source');
      expect(csv).toContain('"test@example.com"');
      expect(csv).toContain('"confirmed"');
      expect(csv).toContain('"homepage_banner"');
    });
  });
});
