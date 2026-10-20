# Supabase Schema & Authorization Audit

* **Audit Target:** Supabase PostgreSQL Database (`https://wttiswajotrmmrcwzqdy.supabase.co`)  
* **Date:** 2026-10-20  
* **Status:** Proposal Stage — Pending Review & Manual Execution in Supabase Dashboard  

---

## 1. Executive Summary

This document presents a comprehensive schema and security audit for EveryGyan. The proposed migration script [`supabase/migrations/20261020000000_schema_and_rls.sql`](../supabase/migrations/20261020000000_schema_and_rls.sql) establishes strict database-level Row Level Security (RLS), preventing client-side role escalation, isolating unpublished drafts, safeguarding subscriber emails, and enforcing community comment moderation.

---

## 2. Table-by-Table Access Matrix

The matrix below specifies the exact permitted actions for each role across the database:

| Table | Operation | Anonymous (Guest) | Reader (Member) | Author (Writer) | Editor (Publisher) | Moderator | Admin |
|---|---|---|---|---|---|---|---|
| **`profiles`** | SELECT | Public fields only | Public fields only | Public fields only | All | All | All |
| | INSERT | Denied | Denied (Trigger only) | Denied (Trigger only) | Denied (Trigger only) | Denied (Trigger only) | Denied |
| | UPDATE | Denied | Own non-role fields | Own non-role fields | Own non-role fields | Own non-role fields | Any field (including role) |
| | DELETE | Denied | Denied | Denied | Denied | Denied | Allowed |
| **`categories`** | SELECT | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed |
| | INSERT/UPDATE/DELETE | Denied | Denied | Denied | Allowed | Denied | Allowed |
| **`tags`** | SELECT | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed |
| | INSERT/UPDATE/DELETE | Denied | Denied | Allowed | Allowed | Denied | Allowed |
| **`articles`** | SELECT | Published & Released only | Published & Released only | Own drafts + Published | All (Drafts, In Review, Published) | Published only | All |
| | INSERT | Denied | Denied | Allowed (Own `author_id`) | Allowed | Denied | Allowed |
| | UPDATE | Denied | Denied | Own Drafts only | All articles & Status | Denied | All |
| | DELETE | Denied | Denied | Own Drafts only | Denied | Denied | Allowed |
| **`comments`** | SELECT | `approved` only | `approved` only | `approved` only | All | All | All |
| | INSERT | Allowed (`pending` only) | Allowed (`pending` only) | Allowed (`pending` only) | Allowed | Allowed | Allowed |
| | UPDATE | Denied | Denied | Denied | Status (`approved`/`rejected`/`spam`) | Status (`approved`/`rejected`/`spam`) | All |
| | DELETE | Denied | Denied | Denied | Denied | Allowed | Allowed |
| **`newsletter_subscribers`** | SELECT | **Denied** | **Denied** | **Denied** | Allowed | Denied | Allowed |
| | INSERT | Allowed (`pending_confirmation`) | Allowed (`pending_confirmation`) | Allowed | Allowed | Denied | Allowed |
| | UPDATE | Unsubscribe with token only | Unsubscribe with token only | Denied | Allowed | Denied | Allowed |
| | DELETE | Denied | Denied | Denied | Denied | Denied | Allowed |
| **Storage: `article-media`** | SELECT | Public read | Public read | Public read | Public read | Public read | Public read |
| | INSERT/UPLOAD | Denied | Denied | Allowed | Allowed | Denied | Allowed |
| | DELETE | Denied | Denied | Denied | Allowed | Denied | Allowed |

---

## 3. Vulnerabilities vs. Suspicions

### A. Verified Vulnerabilities Addressed
1. **Unprotected Role Field (Privilege Escalation):**
   * *Finding:* In standard Supabase starter templates, updating `profiles` with `auth.uid() = id` allows users to change `role = 'admin'`.
   * *Fix:* Created a PostgreSQL trigger (`tr_protect_profile_role`) that raises an exception if `role` is changed by anyone other than an existing administrator.
2. **Draft Content Exposure via REST API:**
   * *Finding:* Without strict RLS on `articles`, querying `GET /rest/v1/articles` using the public anon key returns unreleased drafts and scheduled posts.
   * *Fix:* RLS policy enforces `status = 'published' AND published_at <= now()` for anonymous visitors.
3. **Subscriber Email Harvesting:**
   * *Finding:* If `newsletter_subscribers` is readable by anonymous clients, competitor scraping or spammers can harvest the entire email database.
   * *Fix:* `SELECT` access is strictly denied to anonymous users and standard readers; accessible only to editors and admins.
4. **Comment Injection:**
   * *Finding:* Without status enforcement on insert, a malicious user could submit comments with `status = 'approved'` directly.
   * *Fix:* RLS policy `WITH CHECK (status = 'pending')` forces every new comment into moderation.

### B. Suspicions & Operational Safeguards
1. **Automated Submission Flooding:**
   * Addressed via client-side honeypots and maximum text length constraint (`char_length(content) <= 1000`).
2. **Inactivity Pausing on Supabase Free:**
   * Free-tier Supabase projects pause after 7 days of inactivity. Operational policy requires keeping schema backups in Git and monitoring project health.

---

## 4. Rollback and Test Strategy

* **Forward Migration:** [`supabase/migrations/20261020000000_schema_and_rls.sql`](../supabase/migrations/20261020000000_schema_and_rls.sql)
* **Rollback Script:** [`supabase/migrations/20261020000000_schema_and_rls_rollback.sql`](../supabase/migrations/20261020000000_schema_and_rls_rollback.sql)
* **Execution Guide:**
  1. Open the Supabase Dashboard for project `wttiswajotrmmrcwzqdy`.
  2. Navigate to **SQL Editor**.
  3. Paste the contents of `supabase/migrations/20261020000000_schema_and_rls.sql`.
  4. Click **Run**.
  5. Verify that the 6 tables and storage bucket appear in **Table Editor** with the RLS shield icon enabled on each table.
