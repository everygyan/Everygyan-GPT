# Automated Testing & Security Regression Strategy

This document outlines the testing architecture, regression verification suites, continuous integration (CI) workflows, and honest security coverage boundaries for **EveryGyan**.

---

## 1. Test Architecture & Separation

The test suite is organized into distinct layers to keep feedback loops fast, deterministic, and free of costly third-party dependencies:

| Layer | Purpose | Target Files |
| :--- | :--- | :--- |
| **Unit Tests** | Component rendering, utility functions, reading time, slug collision algorithms, markdown TOC extraction. | `src/test/cms.test.tsx`, `src/test/seo.test.tsx`, `src/test/templates.test.tsx` |
| **Integration Tests** | Multi-step workflows including double opt-in subscriptions, unsubscribe preferences, comment submission queues, and newsletter batching. | `src/test/newsletter.test.tsx`, `src/test/comments.test.tsx`, `src/test/journeys.test.tsx` |
| **Security & RLS Regression** | Direct data-layer authorization tests simulating anonymous, reader, author, moderator, editor, and admin queries. | `src/test/security-rls.test.ts`, `src/test/n8n-ingest.test.ts` |
| **End-to-End Shell & Fallback** | Visual layout branding, public navigation, deep-link nested route refresh (`.htaccess`), and 404 handling. | `src/App.test.tsx`, `src/test/journeys.test.tsx` |

---

## 2. Test Suites Inventory

1. **[`src/App.test.tsx`](../src/App.test.tsx)** (10 tests)
   - EveryGyan wordmark, official tagline ("Knowledge for Everyone, Everywhere"), responsive header, primary navigation, newsletter lead form.
2. **[`src/test/auth.test.tsx`](../src/test/auth.test.tsx)** (2 tests)
   - Route guard protection, reader blocking on author/editor surfaces, role redirection.
3. **[`src/test/cms.test.tsx`](../src/test/cms.test.tsx)** (13 tests)
   - Slug generation, collision resolution (`slug-2`, `slug-3`), author publishing restriction, autosave feedback, TOC markdown extraction.
4. **[`src/test/comments.test.tsx`](../src/test/comments.test.tsx)** (13 tests)
   - Safe text rendering, XSS sanitization (`<script>`, `<iframe>`, `javascript:` rejection), moderation lifecycle (`pending`, `approved`, `rejected`, `spam`), rate limiting.
5. **[`src/test/newsletter.test.tsx`](../src/test/newsletter.test.tsx)** (15 tests)
   - Email format validation, pending confirmation token generation, double opt-in, unsubscribe flows, send batching, idempotent campaigns, provider failure handling.
6. **[`src/test/seo.test.tsx`](../src/test/seo.test.tsx)** (8 tests)
   - Dynamic page titles, meta descriptions, canonical URLs, robots directives (`noindex, follow` on search; `noindex, nofollow` on 404/admin), JSON-LD schemas, sitemap exclusion of private pages.
7. **[`src/test/templates.test.tsx`](../src/test/templates.test.tsx)** (8 tests)
   - Travel Guide template (destination, date-stamped best time to visit, transport, budget ranges, itinerary, official links, safety caveats).
   - Learning/Tutorial template (version applicability, difficulty badges, prerequisites, objectives, step implementation with copyable code, troubleshooting).
   - Strict conditional rendering (empty sections disappear completely).
8. **[`src/test/n8n-ingest.test.ts`](../src/test/n8n-ingest.test.ts)** (11 tests)
   - Webhook shared secret validation, 500 KB size ceiling, locked status (`draft`), forbidden publish/delete operations, idempotency key replay, category validation, required source URLs.
9. **[`src/test/security-rls.test.ts`](../src/test/security-rls.test.ts)** (16 tests)
   - Anonymous visitor permissions (published article read allowed; draft/review/scheduled/archived forbidden).
   - Draft invisibility invariant.
   - Author transition boundaries (cannot publish directly, cannot edit other authors' drafts).
   - Role escalation prevention (trigger `handle_profile_role_protection` blocks reader self-promotion).
   - Comment moderation authorization.
   - Subscriber list and audit log privacy boundaries.
10. **[`src/test/journeys.test.tsx`](../src/test/journeys.test.tsx)** (7 tests)
    - Password reset form validation.
    - Protected route barriers.
    - 404 empty states.
    - Nested-route refresh and Hostinger `.htaccess` rewrite rules.

---

## 3. Production Safety Safeguards

All test fixtures and seeds are managed in [`src/test/fixtures/safeFixtures.ts`](../src/test/fixtures/safeFixtures.ts):
- Every mock entity is explicitly assigned a prefixed ID (`test-mock-...`).
- Includes an active runtime environment guard `assertNotProductionEnvironment()`:
  ```typescript
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL SAFETY VIOLATION: Test fixture execution is strictly barred in production.');
  }
  ```
- **Tests never execute destructive SQL operations** (`DROP TABLE`, `TRUNCATE`, `DELETE FROM`) against production Supabase instances.

---

## 4. Continuous Integration (CI) Commands

The full verification suite can be executed with a single command:

```bash
# Complete CI pipeline (Typecheck + Lint + Test Suite + Build)
npm run ci

# Run only the Security & RLS regression suite
npm run test:security

# Run the complete test suite
npm run test:ci
```

Automated on every push and pull request via [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

---

## 5. Honest Disclosure of Uncovered Critical Cases

While this test suite enforces strong application-layer and database-layer authorization, the following operational risks lie outside the scope of automated unit/integration tests and require standard infrastructure vigilance:

1. **Third-Party CDN / Hostinger Infrastructure Outages**: Vitest cannot simulate edge network partition failures across Hostinger's data centers.
2. **Domain Registrar & DNS Hijacking**: If Hostinger hPanel credentials or DNS registrar access are compromised, traffic could be redirected before reaching application code. Keep 2FA enabled on Hostinger.
3. **Compromised Supabase Management Token**: If the project's master `service_role` key is leaked outside Supabase secret management, RLS policies can be bypassed via direct PostgreSQL connection.
4. **Zero-Day Browser Engine Vulnerabilities**: Client-side memory corruption in specific WebKit/Blink versions cannot be intercepted by React.

> [!CAUTION]
> **No Certification Claim**: This test suite provides rigorous regression testing for software correctness and authorization policies; it does **not** represent a formal third-party SOC2, ISO 27001, or external penetration testing certification.
