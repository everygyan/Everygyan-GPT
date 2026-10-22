import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {
    from: vi.fn(),
  },
}));

import {
  submitContactMessage,
  fetchContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '../services/contactService';

describe('Contact Inquiries & Support Service Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Form Validation Rules', () => {
    it('rejects submission when name is shorter than 2 characters', async () => {
      const res = await submitContactMessage({
        name: 'A',
        email: 'reader@example.com',
        subject: 'General Question',
        message: 'This is a valid long reader message to test length requirements.',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/at least 2 characters/i);
    });

    it('rejects submission with an invalid email address', async () => {
      const res = await submitContactMessage({
        name: 'Jane Doe',
        email: 'invalid-email-format',
        subject: 'General Question',
        message: 'This is a valid long reader message to test length requirements.',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/valid email/i);
    });

    it('rejects submission when subject is shorter than 2 characters', async () => {
      const res = await submitContactMessage({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'H',
        message: 'This is a valid long reader message to test length requirements.',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/subject/i);
    });

    it('rejects submission when message is shorter than 5 characters', async () => {
      const res = await submitContactMessage({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Travel Inquiry',
        message: 'Hi',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/at least 5 characters/i);
    });
  });

  describe('Submission & Offline Fallback', () => {
    it('accepts and stores valid contact inquiries in localStorage fallback mode', async () => {
      const submission = {
        name: 'Sandeep Kumar',
        email: 'sandeep@example.com',
        subject: 'Partnership Query',
        message: 'I would like to inquire about publishing high quality technical articles on SAP BTP.',
      };

      const res = await submitContactMessage(submission);
      expect(res.success).toBe(true);
      expect(res.data?.id).toBeDefined();

      // Fetch messages from fallback storage
      const fetched = await fetchContactMessages();
      expect(fetched.length).toBe(1);
      expect(fetched[0].subject).toBe('Partnership Query');
      expect(fetched[0].status).toBe('unread');
      expect(fetched[0].name).toBe('Sandeep Kumar');
    });

    it('updates inquiry status across the editorial lifecycle', async () => {
      const res = await submitContactMessage({
        name: 'Elena Rostova',
        email: 'elena@example.com',
        subject: 'Feedback on German Grammar Guide',
        message: 'Thank you for the wonderful German A1 beginner grammar explanations.',
      });
      expect(res.success).toBe(true);
      const msgId = res.data!.id;

      // Mark as read
      const readRes = await updateContactMessageStatus(msgId, 'read');
      expect(readRes.success).toBe(true);

      let list = await fetchContactMessages({ status: 'read' });
      expect(list.length).toBe(1);
      expect(list[0].status).toBe('read');

      // Mark as replied
      const replyRes = await updateContactMessageStatus(msgId, 'replied');
      expect(replyRes.success).toBe(true);

      list = await fetchContactMessages({ status: 'replied' });
      expect(list.length).toBe(1);
      expect(list[0].status).toBe('replied');
      expect(list[0].replied_at).toBeDefined();

      // Mark as archived
      const archiveRes = await updateContactMessageStatus(msgId, 'archived');
      expect(archiveRes.success).toBe(true);

      list = await fetchContactMessages({ status: 'archived' });
      expect(list.length).toBe(1);
      expect(list[0].status).toBe('archived');
    });

    it('deletes an inquiry from storage', async () => {
      const res = await submitContactMessage({
        name: 'Spam Bot',
        email: 'spam@bot.com',
        subject: 'Buy Crypto Now',
        message: 'Exclusive financial opportunity that you should definitely not miss.',
      });
      expect(res.success).toBe(true);
      const msgId = res.data!.id;

      const delRes = await deleteContactMessage(msgId);
      expect(delRes.success).toBe(true);

      const list = await fetchContactMessages();
      expect(list.find((m) => m.id === msgId)).toBeUndefined();
    });
  });
});
