# Restricted n8n-to-Draft Integration Specification

This document defines the architecture, security invariants, API contract, and testing procedure for automated content draft ingestion via **n8n** or AI pipelines on **EveryGyan**.

> [!IMPORTANT]
> **Golden Security Principle**: Automated pipelines operate under **strict least privilege**. They can **only** insert articles as `status = 'draft'` for human editorial review. They **cannot** publish, schedule, delete, update existing records, access private newsletter subscriber lists, or execute arbitrary database queries.

---

## 1. Architectural Guardrails & Threat Model

| Threat / Risk | Mitigating Security Control |
| :--- | :--- |
| **Accidental or Hallucinated Auto-Publishing** | Hardcoded invariant in the Edge Function: `status` is forced to `'draft'`. Any request attempting `status: 'published'` or `'scheduled'` is rejected with `403 Forbidden`. |
| **Accidental Content Deletion** | The endpoint strictly implements `POST /draft-ingest`. Any delete directive or method is rejected with `403 Forbidden`. |
| **Exposure of Production Credentials** | n8n never receives Supabase `service_role` keys or raw database credentials. It only receives a dedicated webhook secret (`N8N_INGEST_SECRET`). |
| **Private Subscriber Data Leakage** | The endpoint possesses zero read queries for `subscribers` or `newsletter_campaigns`. |
| **Duplicate Ingestion on Network Retries** | Uses `x-idempotency-key` / `request_id` tracked in `audit_logs`. Replays return `200 OK` with the existing `article_id` without creating duplicates. |
| **Denial of Service (DoS) / Massive Payloads** | Enforces a strict 500 KB payload ceiling (`413 Payload Too Large`). |
| **Unverified Research Content** | Requires at least 1 validated HTTP/HTTPS source citation in `source_urls` (`400 Bad Request` if missing). |

---

## 2. API Contract Specification

### Endpoint Details
- **Method**: `POST`
- **Path**: `https://<project-ref>.supabase.co/functions/v1/n8n-draft-ingest`
- **Required Headers**:
  - `Content-Type`: `application/json`
  - `x-n8n-secret`: `<N8N_INGEST_SECRET>` (or `Authorization: Bearer <N8N_INGEST_SECRET>`)
  - `x-idempotency-key`: `<unique-uuid-or-hash>` (recommended for idempotency across retries)

---

### Request Payload (JSON)

```json
{
  "request_id": "n8n-exec-20261020-001",
  "title": "Enterprise Cloud Architecture: High-Availability Patterns",
  "excerpt": "A deep dive into multi-region redundancy, stateful service replication, and failover automation.",
  "category": "tech",
  "tags": ["Cloud", "Enterprise", "Architecture", "Automated Draft"],
  "content": "Full article body content written in standard Markdown with headings, lists, and code blocks...",
  "cover_image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "cover_caption": "Photo: Enterprise Cloud Infrastructure Overview.",
  "template_type": "standard",
  "source_urls": [
    {
      "title": "AWS Well-Architected Framework: Reliability Pillar",
      "url": "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/"
    },
    {
      "title": "Google Cloud Architecture Framework: High Availability",
      "url": "https://cloud.google.com/architecture/framework"
    }
  ]
}
```

---

### Success Responses

#### 1. New Draft Created (`201 Created`)
```json
{
  "success": true,
  "data": {
    "article_id": "00000000-0000-0000-0000-000000000001",
    "title": "Enterprise Cloud Architecture: High-Availability Patterns",
    "slug": "enterprise-cloud-architecture-high-availability-patterns",
    "status": "draft",
    "category": "Tech",
    "review_url": "https://everygyan.com/dashboard/articles/00000000-0000-0000-0000-000000000001/edit",
    "created_at": "2026-10-20T08:00:00.000Z"
  }
}
```

#### 2. Idempotent Replay (`200 OK`)
When n8n retries a request with the same `x-idempotency-key` or `request_id`:
```json
{
  "success": true,
  "idempotent_replay": true,
  "message": "Draft already ingested previously with this idempotency key.",
  "data": {
    "article_id": "00000000-0000-0000-0000-000000000001",
    "title": "Enterprise Cloud Architecture: High-Availability Patterns",
    "status": "draft",
    "review_url": "https://everygyan.com/dashboard/articles/00000000-0000-0000-0000-000000000001/edit"
  }
}
```

---

### Error Responses

| Status Code | Reason | Example Response Body |
| :--- | :--- | :--- |
| `401 Unauthorized` | Invalid or missing secret | `{"success": false, "error": "Unauthorized: Invalid or missing webhook secret."}` |
| `403 Forbidden` | Attempt to publish or delete | `{"success": false, "error": "Forbidden: Automated workflows cannot set status to 'published'..."}` |
| `400 Bad Request` | Missing title/content/sources or invalid category | `{"success": false, "error": "Validation Error: At least one verified source URL is required."}` |
| `413 Payload Too Large` | Request body exceeds 500 KB | `{"success": false, "error": "Payload Too Large: Request exceeds maximum size limit of 500 KB."}` |
| `500 Server Error` | Database failure | `{"success": false, "error": "Database Error: ..."}` |

---

## 3. Testing Against Local / Staging First

Before configuring n8n in production:

### Step 1: Run Local Edge Function
Using the Supabase CLI:
```bash
supabase functions serve n8n-draft-ingest --env-file ./supabase/.env.local
```

### Step 2: Test with curl
```bash
curl -i -X POST http://localhost:54321/functions/v1/n8n-draft-ingest \
  -H "Content-Type: application/json" \
  -H "x-n8n-secret: test-secret-placeholder" \
  -H "x-idempotency-key: test-req-001" \
  -d '{
    "title": "Testing Local n8n Draft Ingest Pipeline",
    "content": "This is a comprehensive test draft body exceeding fifty characters for local verification.",
    "category": "tech",
    "source_urls": [{"title": "Official Docs", "url": "https://example.com/docs"}]
  }'
```

Verify that:
1. Response returns `201 Created` with `status: 'draft'`.
2. Re-running the identical command returns `200 OK` with `"idempotent_replay": true`.
3. An audit record is visible in table `public.audit_logs`.
4. Sending `"status": "published"` immediately yields `403 Forbidden`.
