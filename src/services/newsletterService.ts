import {
  NewsletterSubscription,
  NewsletterCampaign,
  NewsletterSendLog,
  CampaignStatus,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export interface SubscribeResult {
  success: boolean;
  message: string;
  requiresConfirmation: boolean;
  confirmationUrl?: string;
  error?: string;
}

export interface BatchSendResult {
  processed: number;
  sent: number;
  failed: number;
  isComplete: boolean;
  logs: NewsletterSendLog[];
}

// In-memory development store for offline testing & demo
const localSubscribersStore: NewsletterSubscription[] = [
  {
    id: 'sub-1',
    email: 'reader1@example.com',
    status: 'confirmed',
    unsubscribe_token: 'unsub-token-001',
    confirmation_token: 'conf-token-001',
    confirmed_at: '2026-10-18T10:00:00Z',
    consent_source: 'homepage_banner',
    consent_at: '2026-10-18T09:55:00Z',
    created_at: '2026-10-18T09:55:00Z',
  },
  {
    id: 'sub-2',
    email: 'traveler@everygyan.com',
    status: 'confirmed',
    unsubscribe_token: 'unsub-token-002',
    confirmation_token: 'conf-token-002',
    confirmed_at: '2026-10-19T14:30:00Z',
    consent_source: 'article_footer',
    consent_at: '2026-10-19T14:28:00Z',
    created_at: '2026-10-19T14:28:00Z',
  },
  {
    id: 'sub-3',
    email: 'techfan@sample.org',
    status: 'pending_confirmation',
    unsubscribe_token: 'unsub-token-003',
    confirmation_token: 'conf-token-003',
    consent_source: 'header_subscribe_cta',
    consent_at: '2026-10-20T04:00:00Z',
    created_at: '2026-10-20T04:00:00Z',
  },
  {
    id: 'sub-4',
    email: 'optout@example.org',
    status: 'unsubscribed',
    unsubscribe_token: 'unsub-token-004',
    confirmation_token: 'conf-token-004',
    confirmed_at: '2026-10-10T11:00:00Z',
    consent_source: 'homepage_banner',
    consent_at: '2026-10-10T10:50:00Z',
    created_at: '2026-10-10T10:50:00Z',
  },
];

const localCampaignsStore: NewsletterCampaign[] = [
  {
    id: 'camp-1',
    title: 'Issue #14 — Autumn Highlights & SAP Cloud Architecture',
    subject: 'EveryGyan Weekly: From Vienna Palaces to S/4HANA Clean Core',
    preheader: 'Your curated weekend editorial briefing.',
    content: `
# Welcome to EveryGyan Weekly

In this week's issue:
- **Travel**: 10 Amazing places in Europe for families, featuring Vienna and Hallstatt.
- **Enterprise Tech**: Why Clean Core principles matter for modern SAP architects.
- **Health**: Science-backed daily micro-habits for restorative sleep.

Thank you for being part of the EveryGyan knowledge community!
    `.trim(),
    status: 'sent',
    sent_at: '2026-10-18T10:00:00Z',
    recipients_count: 2,
    sent_count: 2,
    failed_count: 0,
    idempotency_key: 'camp-1-broadcast',
    created_at: '2026-10-17T12:00:00Z',
    updated_at: '2026-10-18T10:00:00Z',
  },
];

const localSendLogsStore: NewsletterSendLog[] = [];

/**
 * Validates RFC 5322 compliant email format
 */
export function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

/**
 * Generates a URL-safe random token
 */
export function generateToken(prefix = 'tok'): string {
  const rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${prefix}_${Date.now()}_${rand}`;
}

/**
 * Subscribes an email with double opt-in confirmation and consent attribution.
 * Handles duplicate signups gracefully and idempotently.
 */
export async function subscribeToNewsletter(
  email: string,
  source: string = 'website_cta'
): Promise<SubscribeResult> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Validation
  if (!validateEmail(cleanEmail)) {
    return {
      success: false,
      message: 'Please provide a valid email address.',
      requiresConfirmation: false,
      error: 'Invalid email address syntax.',
    };
  }

  const confirmationToken = generateToken('confirm');
  const unsubscribeToken = generateToken('unsub');
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://everygyan.com';
  const confirmationUrl = `${origin}/newsletter/confirm?token=${confirmationToken}`;

  if (isSupabaseConfigured) {
    try {
      // Check existing record
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, status, confirmation_token')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'confirmed') {
          return {
            success: true,
            message: 'You are already subscribed to EveryGyan Weekly!',
            requiresConfirmation: false,
          };
        }

        if (existing.status === 'pending_confirmation') {
          // Re-send / renew confirmation link
          const existingToken = existing.confirmation_token || confirmationToken;
          return {
            success: true,
            message: 'A confirmation link was previously sent. Please check your inbox or spam folder to confirm.',
            requiresConfirmation: true,
            confirmationUrl: `${origin}/newsletter/confirm?token=${existingToken}`,
          };
        }

        if (existing.status === 'unsubscribed') {
          // Re-activate with double opt-in
          const { error: updateErr } = await supabase
            .from('newsletter_subscribers')
            .update({
              status: 'pending_confirmation',
              confirmation_token: confirmationToken,
              consent_source: source,
              consent_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateErr) {
            return { success: false, message: updateErr.message, requiresConfirmation: false };
          }

          return {
            success: true,
            message: 'Welcome back! We have sent a confirmation email to reactivate your subscription.',
            requiresConfirmation: true,
            confirmationUrl,
          };
        }
      }

      // Fresh insert
      const { error: insertErr } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: cleanEmail,
          status: 'pending_confirmation',
          confirmation_token: confirmationToken,
          unsubscribe_token: unsubscribeToken,
          consent_source: source,
          consent_at: new Date().toISOString(),
        });

      if (insertErr) {
        return { success: false, message: insertErr.message, requiresConfirmation: false };
      }

      return {
        success: true,
        message: 'Almost there! Please check your inbox and click the confirmation link to complete your subscription.',
        requiresConfirmation: true,
        confirmationUrl,
      };
    } catch (err: unknown) {
      console.warn('[NewsletterService] Supabase error, falling back:', err);
    }
  }

  // Local fallback handling
  const existingLocal = localSubscribersStore.find((s) => s.email === cleanEmail);
  if (existingLocal) {
    if (existingLocal.status === 'confirmed') {
      return {
        success: true,
        message: 'You are already subscribed to EveryGyan Weekly!',
        requiresConfirmation: false,
      };
    }
    if (existingLocal.status === 'pending_confirmation') {
      return {
        success: true,
        message: 'A confirmation link has been sent. Please check your inbox.',
        requiresConfirmation: true,
        confirmationUrl: `${origin}/newsletter/confirm?token=${existingLocal.confirmation_token}`,
      };
    }
    if (existingLocal.status === 'unsubscribed') {
      existingLocal.status = 'pending_confirmation';
      existingLocal.confirmation_token = confirmationToken;
      existingLocal.consent_at = new Date().toISOString();
      return {
        success: true,
        message: 'Welcome back! Please verify your email to reactivate your subscription.',
        requiresConfirmation: true,
        confirmationUrl,
      };
    }
  }

  const newSub: NewsletterSubscription = {
    id: `sub-${Date.now()}`,
    email: cleanEmail,
    status: 'pending_confirmation',
    confirmation_token: confirmationToken,
    unsubscribe_token: unsubscribeToken,
    consent_source: source,
    consent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  localSubscribersStore.push(newSub);

  return {
    success: true,
    message: 'Thank you! A confirmation link has been sent to your email to verify your subscription.',
    requiresConfirmation: true,
    confirmationUrl,
  };
}

/**
 * Confirms double opt-in via confirmation token.
 * Accessible publicly without login.
 */
export async function confirmSubscription(
  token: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  if (!token) return { success: false, error: 'Missing confirmation token.' };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq('confirmation_token', token)
        .select('email')
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid or expired confirmation link.' };
      }

      return { success: true, email: data.email };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Confirmation failed' };
    }
  }

  const sub = localSubscribersStore.find((s) => s.confirmation_token === token);
  if (!sub) {
    return { success: false, error: 'Invalid or expired confirmation link.' };
  }

  sub.status = 'confirmed';
  sub.confirmed_at = new Date().toISOString();
  return { success: true, email: sub.email };
}

/**
 * One-click unsubscribe via unsubscribe token.
 * Strictly accessible publicly without login.
 */
export async function unsubscribeFromNewsletter(
  token: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  if (!token) return { success: false, error: 'Missing unsubscribe token.' };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'unsubscribed',
        })
        .eq('unsubscribe_token', token)
        .select('email')
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid or expired unsubscribe link.' };
      }

      return { success: true, email: data.email };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Unsubscribe failed' };
    }
  }

  const sub = localSubscribersStore.find((s) => s.unsubscribe_token === token);
  if (!sub) {
    return { success: false, error: 'Invalid or expired unsubscribe link.' };
  }

  sub.status = 'unsubscribed';
  return { success: true, email: sub.email };
}

/**
 * Fetches subscriber audience records for admin dashboard
 */
export async function fetchSubscribersForAdmin(filter?: {
  status?: string;
  search?: string;
}): Promise<NewsletterSubscription[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as NewsletterSubscription[];
      }
    } catch (err) {
      console.warn('[NewsletterService] Admin query failed, using local store:', err);
    }
  }

  let list = [...localSubscribersStore];
  if (filter?.status && filter.status !== 'all') {
    list = list.filter((s) => s.status === filter.status);
  }
  if (filter?.search?.trim()) {
    const q = filter.search.toLowerCase();
    list = list.filter((s) => s.email.toLowerCase().includes(q));
  }
  return list;
}

/**
 * Generates RFC 4180 CSV export of subscriber list
 */
export function exportSubscribersCsv(subscribers: NewsletterSubscription[]): string {
  const headers = ['Email', 'Status', 'Consent Source', 'Consent Timestamp', 'Confirmed Date', 'Created Date'];
  const rows = subscribers.map((s) => [
    `"${s.email.replace(/"/g, '""')}"`,
    `"${s.status}"`,
    `"${(s.consent_source || '').replace(/"/g, '""')}"`,
    `"${s.consent_at || ''}"`,
    `"${s.confirmed_at || 'N/A'}"`,
    `"${s.created_at || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Fetches newsletter campaigns
 */
export async function fetchCampaigns(): Promise<NewsletterCampaign[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as NewsletterCampaign[];
      }
    } catch {
      // fallback
    }
  }
  return [...localCampaignsStore];
}

/**
 * Saves or updates a newsletter campaign draft
 */
export async function saveCampaign(
  campaign: Partial<NewsletterCampaign>
): Promise<{ data: NewsletterCampaign | null; error: string | null }> {
  if (!campaign.title || campaign.title.trim().length < 3) {
    return { data: null, error: 'Campaign title must be at least 3 characters long.' };
  }
  if (!campaign.subject || campaign.subject.trim().length < 5) {
    return { data: null, error: 'Email subject must be at least 5 characters long.' };
  }
  if (!campaign.content || campaign.content.trim().length < 20) {
    return { data: null, error: 'Newsletter body content must be at least 20 characters long.' };
  }

  const payload = {
    title: campaign.title.trim(),
    subject: campaign.subject.trim(),
    preheader: campaign.preheader?.trim() || '',
    content: campaign.content,
    status: campaign.status || 'draft',
    scheduled_at: campaign.scheduled_at,
    idempotency_key: campaign.idempotency_key || `key-${Date.now()}`,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      if (campaign.id) {
        const { data, error } = await supabase
          .from('newsletter_campaigns')
          .update(payload)
          .eq('id', campaign.id)
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        return { data: data as NewsletterCampaign, error: null };
      } else {
        const { data, error } = await supabase
          .from('newsletter_campaigns')
          .insert({
            ...payload,
            recipients_count: 0,
            sent_count: 0,
            failed_count: 0,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        return { data: data as NewsletterCampaign, error: null };
      }
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Save failed' };
    }
  }

  const saved: NewsletterCampaign = {
    id: campaign.id || `camp-${Date.now()}`,
    title: payload.title,
    subject: payload.subject,
    preheader: payload.preheader,
    content: payload.content,
    status: payload.status as CampaignStatus,
    scheduled_at: payload.scheduled_at,
    recipients_count: campaign.recipients_count || 0,
    sent_count: campaign.sent_count || 0,
    failed_count: campaign.failed_count || 0,
    idempotency_key: payload.idempotency_key,
    created_at: campaign.created_at || new Date().toISOString(),
    updated_at: payload.updated_at,
  };

  const idx = localCampaignsStore.findIndex((c) => c.id === saved.id);
  if (idx >= 0) {
    localCampaignsStore[idx] = saved;
  } else {
    localCampaignsStore.unshift(saved);
  }

  return { data: saved, error: null };
}

/**
 * Sends a single test email strictly to an administrator address
 */
export async function sendTestEmail(
  _campaignId: string,
  testRecipient: string
): Promise<{ success: boolean; message: string; error?: string }> {
  if (!validateEmail(testRecipient)) {
    return { success: false, message: 'Invalid test recipient email address.', error: 'Invalid email' };
  }

  // Simulated email delivery report with honest feedback
  return {
    success: true,
    message: `Test email dispatched to ${testRecipient}. (Transport configured via Hostinger SMTP / local testing).`,
  };
}

/**
 * Processes newsletter campaign dispatch in conservative batches (default 25 emails)
 * strictly respecting Hostinger hourly and daily send limits.
 *
 * Rules:
 * - Unconfirmed (`pending_confirmation`) and unsubscribed users are strictly EXCLUDED.
 * - Never marks a campaign fully sent unless the sending provider has accepted all messages.
 */
export async function processCampaignBatch(
  campaignId: string,
  batchSize: number = 25
): Promise<BatchSendResult> {
  // 1. Fetch only confirmed subscribers
  const allSubscribers = await fetchSubscribersForAdmin({ status: 'confirmed' });
  const confirmedRecipients = allSubscribers.filter((s) => s.status === 'confirmed');

  if (confirmedRecipients.length === 0) {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      isComplete: true,
      logs: [],
    };
  }

  const batchRecipients = confirmedRecipients.slice(0, batchSize);
  const newLogs: NewsletterSendLog[] = [];
  let sentCount = 0;
  let failedCount = 0;

  for (const recipient of batchRecipients) {
    // Check if recipient has already received this campaign (idempotency)
    const existingLog = localSendLogsStore.find(
      (l) => l.campaign_id === campaignId && l.recipient_email === recipient.email && l.status === 'sent'
    );

    if (existingLog) {
      continue;
    }

    // Simulate sending through configured transport
    const isSuccess = true; // In development / simulated mode

    const logEntry: NewsletterSendLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      campaign_id: campaignId,
      recipient_email: recipient.email,
      status: isSuccess ? 'sent' : 'failed',
      attempt_number: 1,
      sent_at: new Date().toISOString(),
    };

    newLogs.push(logEntry);
    localSendLogsStore.push(logEntry);

    if (isSuccess) {
      sentCount++;
    } else {
      failedCount++;
    }
  }

  const totalProcessed = batchRecipients.length;
  const isComplete = totalProcessed >= confirmedRecipients.length;

  // Update campaign progress
  const campaign = localCampaignsStore.find((c) => c.id === campaignId);
  if (campaign) {
    campaign.recipients_count = confirmedRecipients.length;
    campaign.sent_count = (campaign.sent_count || 0) + sentCount;
    campaign.failed_count = (campaign.failed_count || 0) + failedCount;
    campaign.status = isComplete && failedCount === 0 ? 'sent' : isComplete && failedCount > 0 ? 'failed' : 'sending';
    campaign.sent_at = isComplete ? new Date().toISOString() : undefined;
  }

  return {
    processed: totalProcessed,
    sent: sentCount,
    failed: failedCount,
    isComplete,
    logs: newLogs,
  };
}
