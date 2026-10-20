import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {
    from: vi.fn(),
  },
}));

import {
  processN8nDraftIngest,
  resetLocalAuditLogs,
  N8nDraftPayload,
  MAX_PAYLOAD_BYTES,
} from '../services/n8nIngestService';

describe('Restricted n8n-to-Draft Ingest Subsystem', () => {
  const EXPECTED_SECRET = 'super-secret-test-token-12345';

  const validPayload: N8nDraftPayload = {
    request_id: 'req-test-uuid-001',
    title: 'Automated Research: Next-Gen Solid State Battery Breakthroughs',
    content:
      'Solid-state electrolytes offer significant advantages in energy density and thermal safety over conventional liquid lithium-ion cells. Recent industrial pilot lines demonstrate 400 Wh/kg specific energy metrics.',
    category: 'tech',
    tags: ['Battery Tech', 'Renewable Energy', 'Automated Draft'],
    source_urls: [
      {
        title: 'Battery Materials Review 2026',
        url: 'https://example.com/energy-research/solid-state-2026',
      },
    ],
  };

  beforeEach(() => {
    resetLocalAuditLogs();
  });

  it('successfully creates an article draft with status "draft" when payload is valid', async () => {
    const res = await processN8nDraftIngest(validPayload, EXPECTED_SECRET, EXPECTED_SECRET);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data?.status).toBe('draft');
    expect(res.body.data?.title).toBe(validPayload.title);
    expect(res.body.data?.review_url).toContain('/dashboard/articles/');
  });

  it('rejects requests with an invalid secret (401 Unauthorized)', async () => {
    const res = await processN8nDraftIngest(validPayload, 'wrong-token', EXPECTED_SECRET);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('rejects requests with a missing secret (401 Unauthorized)', async () => {
    const res = await processN8nDraftIngest(validPayload, null, EXPECTED_SECRET);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('strictly blocks attempts to publish articles (403 Forbidden)', async () => {
    const maliciousPublishPayload = {
      ...validPayload,
      status: 'published',
    };

    const res = await processN8nDraftIngest(maliciousPublishPayload, EXPECTED_SECRET, EXPECTED_SECRET);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Forbidden');
    expect(res.body.error).toContain("created as 'draft'");
  });

  it('strictly blocks attempts to delete articles (403 Forbidden)', async () => {
    const maliciousDeletePayload = {
      ...validPayload,
      action: 'delete',
      delete: true,
    };

    const res = await processN8nDraftIngest(maliciousDeletePayload, EXPECTED_SECRET, EXPECTED_SECRET);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Forbidden');
    expect(res.body.error).toContain('delete articles');
  });

  it('detects duplicate submissions via idempotency key and returns idempotent replay (200 OK)', async () => {
    // First ingestion
    const firstRes = await processN8nDraftIngest(
      validPayload,
      EXPECTED_SECRET,
      EXPECTED_SECRET,
      'idempotency-key-alpha-99'
    );
    expect(firstRes.statusCode).toBe(201);
    const originalArticleId = firstRes.body.data?.article_id;

    // Second ingestion with the same idempotency key
    const secondRes = await processN8nDraftIngest(
      validPayload,
      EXPECTED_SECRET,
      EXPECTED_SECRET,
      'idempotency-key-alpha-99'
    );

    expect(secondRes.statusCode).toBe(200);
    expect(secondRes.body.success).toBe(true);
    expect(secondRes.body.idempotent_replay).toBe(true);
    expect(secondRes.body.data?.article_id).toBe(originalArticleId);
  });

  it('rejects oversized payloads exceeding 500 KB (413 Payload Too Large)', async () => {
    const hugeContent = 'A'.repeat(MAX_PAYLOAD_BYTES + 200);
    const oversizedPayload: N8nDraftPayload = {
      ...validPayload,
      content: hugeContent,
    };

    const res = await processN8nDraftIngest(oversizedPayload, EXPECTED_SECRET, EXPECTED_SECRET);

    expect(res.statusCode).toBe(413);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Payload Too Large');
  });

  it('rejects requests with an invalid category (400 Bad Request)', async () => {
    const invalidCatPayload: N8nDraftPayload = {
      ...validPayload,
      category: 'non-existent-crypto-casino',
    };

    const res = await processN8nDraftIngest(invalidCatPayload, EXPECTED_SECRET, EXPECTED_SECRET);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid category');
  });

  it('rejects requests with missing or empty source URLs (400 Bad Request)', async () => {
    const missingSourcesPayload: N8nDraftPayload = {
      ...validPayload,
      source_urls: [],
    };

    const res = await processN8nDraftIngest(missingSourcesPayload, EXPECTED_SECRET, EXPECTED_SECRET);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('verified source URL');
  });

  it('rejects requests with invalid or malformed source URLs (400 Bad Request)', async () => {
    const badUrlPayload: N8nDraftPayload = {
      ...validPayload,
      source_urls: ['not-a-valid-http-url'],
    };

    const res = await processN8nDraftIngest(badUrlPayload, EXPECTED_SECRET, EXPECTED_SECRET);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('not a valid HTTP/HTTPS link');
  });

  it('rejects malformed non-object JSON payloads (400 Bad Request)', async () => {
    const res = await processN8nDraftIngest('plain string', EXPECTED_SECRET, EXPECTED_SECRET);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
