# EveryGyan — Technical Operations & Maintenance Runbook

**Publication:** EveryGyan — Knowledge for Everyone, Everywhere  
**System Architecture:** React 18 + Vite + TypeScript (Static SPA on Hostinger Business LiteSpeed)  
**Authoritative Backend:** Supabase Free (PostgreSQL Database, Auth, Storage)  
**Canonical Domain:** `https://everygyan.com`  
**Document Purpose:** Complete standalone technical manual for operating, maintaining, troubleshooting, and securing EveryGyan.

---

## Table of Contents
1. [Supported Environment & Local Setup](#1-supported-environment--local-setup)
2. [Environment Variables Reference](#2-environment-variables-reference)
3. [Database Migrations & Forward/Rollback Ordering](#3-database-migrations--forwardrollback-ordering)
4. [Safe Admin Bootstrap Procedure](#4-safe-admin-bootstrap-procedure)
5. [Hostinger Deployment & Rollback](#5-hostinger-deployment--rollback)
6. [Secret Rotation Playbook](#6-secret-rotation-playbook)
7. [Troubleshooting Common Operational Issues](#7-troubleshooting-common-operational-issues)
8. [Recurring Maintenance Schedule](#8-recurring-maintenance-schedule)

---

## 1. Supported Environment & Local Setup

### 1.1 Prerequisites
- **Node.js**: Version `18.x`, `20.x`, `22.x`, or `24.x` (Active LTS or Maintenance LTS). Tested on Node `v24.15.0`.
- **Package Manager**: `npm` version `9.x` or higher (tested on `11.12.1`). On Windows PowerShell, invoke via `npm.cmd`.
- **Git**: Version `2.30+`.
- **Database Client** (Optional): `psql` / `pg_dump` version `15+` for manual backups.

### 1.2 Local Machine Setup
```bash
# 1. Clone repository from GitHub
git clone https://github.com/everygyan/Everygyan-GPT.git
cd Everygyan-GPT

# 2. Install dependencies (frozen lockfile)
npm install

# 3. Copy environment configuration template
cp .env.example .env

# 4. Start local development server
npm run dev
# Application opens at http://localhost:3000
```

### 1.3 Available Verification Scripts
All commands must be executed from the repository root:

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | Dev Server | Launches Vite dev server with hot module replacement at port 3000 |
| `npm run typecheck` | Type Safety | Runs `tsc --noEmit` to verify TypeScript strict types |
| `npm run lint` | Code Quality | Runs ESLint across `src/` to catch syntax and standard violations |
| `npm test` | Test Suite | Runs all 126 automated Vitest regression, RLS, and a11y tests |
| `npm run test:security` | Security Tests | Runs standalone Supabase RLS and token simulation tests |
| `npm run sitemap` | SEO Generator| Compiles `public/sitemap.xml` for published articles |
| `npm run build` | Production Build | Executes typecheck, sitemap generation, and Vite Rollup compilation |
| `npm run preview` | Local Preview | Serves production `dist/` build locally for pre-flight testing |
| `npm run ci` | Unified CI Check | Runs typecheck + lint + test + build sequentially |

---

## 2. Environment Variables Reference

Vite statically embeds `VITE_*` environment variables at compile time (`npm run build`).

> [!CAUTION]
> **Zero-Secrets Policy:** NEVER put database passwords, Supabase `service_role` keys, SMTP passwords, or n8n webhook secrets in `.env`, client code, or repository files.

### 2.1 Client-Safe Variables (`.env` / `.env.production`)
These variables are exposed in browser bundles and must only interact with resources guarded by PostgreSQL Row-Level Security:

| Variable Name | Purpose | Example / Format |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase Cloud project HTTPS URL | `https://[project-ref].supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase public/publishable anon key | `eyJhbGciOi...` (Public anon token) |
| `VITE_SITE_URL` | Canonical production domain URL | `https://everygyan.com` |
| `VITE_SITE_NAME` | Website brand name | `EveryGyan` |
| `VITE_SITE_TAGLINE` | Publication tagline | `"Knowledge for Everyone, Everywhere"` |

### 2.2 Server-Side Secrets (Supabase Dashboard / Edge Functions Only)
Set these strictly in **Supabase Dashboard &rarr; Project Settings &rarr; Edge Functions &rarr; Secrets**:

| Secret Name | Purpose | Where Used |
| :--- | :--- | :--- |
| `N8N_INGEST_SECRET` | Shared secret token for n8n automated drafting | `n8n-draft-ingest` Edge Function |
| `N8N_AUTHOR_ID` | Default Supabase user UUID for AI-drafted articles | `n8n-draft-ingest` Edge Function |
| `SUPABASE_SERVICE_ROLE_KEY` | Master bypass key (auto-managed by Supabase) | Edge Functions server-side runtime only |
| `SMTP_HOST` | Hostinger SMTP server host | Email transport edge function |
| `SMTP_PORT` | Hostinger SMTP secure port (465 SSL or 587 TLS)| Email transport edge function |
| `SMTP_USER` | Sending mailbox email address | Email transport edge function |
| `SMTP_PASS` | Hostinger mailbox authentication password | Email transport edge function |

---

## 3. Database Migrations & Forward/Rollback Ordering

All schema modifications are tracked in [`supabase/migrations/`](../supabase/migrations/) as forward-only, reviewed SQL files.

### 3.1 Migration Execution Sequence
When setting up a new Supabase environment (e.g. Staging or Production), execute these files in the Supabase **SQL Editor** in exact chronological order:

```text
1. 20261020000000_schema_and_rls.sql
   └── Creates profiles, categories, tags, articles, comments, newsletter tables, RLS policies, and triggers.

2. 20261020000001_seed_articles.sql
   └── Seeds verified baseline categories, tags, and initial published articles.

3. 20261020000002_newsletter_subsystem.sql
   └── Extends subscribers with double opt-in tokens, creates newsletter_campaigns and send_logs.

4. 20261020000003_content_templates.sql
   └── Adds template_type ('standard' | 'travel' | 'tutorial') and template_data JSONB to articles.

5. 20261020000004_n8n_draft_audit.sql
   └── Creates audit_logs table for webhook idempotency and ingestion tracking.
```

### 3.2 Rollback Scripts (Reverse Order)
If an update must be reverted, execute the matching rollback scripts in reverse order:
1. `20261020000004_n8n_draft_audit_rollback.sql`
2. `20261020000003_content_templates_rollback.sql`
3. `20261020000002_newsletter_subsystem_rollback.sql`
4. `20261020000000_schema_and_rls_rollback.sql` *(Drops custom tables; auth.users is preserved)*

---

## 4. Safe Admin Bootstrap Procedure

By default, any user signing up via the front end receives the `reader` role. Roles cannot be escalated through browser requests or localStorage.

### 4.1 Step-by-Step Admin Granting
1. **Register User Account**:
   - The prospective administrator registers via the front end (`https://everygyan.com` &rarr; click **Sign In** &rarr; select **Register**).
   - Enter email and password. Verify email if email confirmation is enabled.
2. **Retrieve User ID**:
   - Open Supabase Dashboard &rarr; **Authentication** &rarr; **Users**.
   - Copy the `User UID` for the registered email.
3. **Execute Bootstrap SQL in Supabase SQL Editor**:
   ```sql
   -- Promote the specific user account to admin
   UPDATE public.profiles
   SET role = 'admin', updated_at = now()
   WHERE id = 'REPLACE-WITH-USER-UUID-HERE';

   -- Verify promotion
   SELECT id, full_name, role, updated_at
   FROM public.profiles
   WHERE id = 'REPLACE-WITH-USER-UUID-HERE';
   ```
4. **Log In to Dashboard**:
   - Return to the website and log in. The user will now have full administrative access to `/dashboard/*`.

---

## 5. Hostinger Deployment & Rollback

EveryGyan's front end is hosted on Hostinger Business Web Hosting using LiteSpeed.

### 5.1 Pre-Deployment Compilation
```powershell
# From local repository root:
npm.cmd run ci

# Package production build:
Compress-Archive -Path dist\* -DestinationPath dist-production.zip -Force
```

### 5.2 Uploading to Hostinger hPanel (Manual)
1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com).
2. Go to **Websites** &rarr; select `everygyan.com` &rarr; click **Manage**.
3. Under **Files**, open **File Manager** (`public_html`).
4. If updating an existing deployment:
   - Select all files in `public_html/` &rarr; Archive to `backup-prev.zip`.
5. Click **Upload** &rarr; select `dist-production.zip`.
6. Right-click `dist-production.zip` &rarr; click **Extract** into `/public_html`.
7. Delete `dist-production.zip`.
8. Verify `.htaccess` exists in `public_html/`.
9. Go to **Advanced** &rarr; **Purge Cache** (LiteSpeed) &rarr; click **Purge All**.

### 5.3 Rollback Procedure
If a critical frontend regression occurs:
1. In Hostinger File Manager, delete the broken `assets/` directory and `index.html`.
2. Extract `backup-prev.zip` into `public_html/`.
3. Purge LiteSpeed cache in hPanel.
4. Verify site restoration at `https://everygyan.com`.

---

## 6. Secret Rotation Playbook

If a credential or secret is compromised or suspected of exposure, follow these specific rotation protocols:

### Scenario A: Supabase Public Anon Key Compromised
*Risk: Low (Anon key is already public, protected by RLS). However, if rotated:*
1. Open Supabase Dashboard &rarr; **Project Settings** &rarr; **API**.
2. Under **Project API keys**, click **Generate new JWT secret** / Rotate Anon Key.
3. Update `VITE_SUPABASE_ANON_KEY` in `.env.production`.
4. Rebuild the application: `npm run build`.
5. Deploy updated `dist/` to Hostinger.

### Scenario B: Supabase `service_role` Key Compromised
*Risk: Critical (service_role bypasses all RLS policies).*
1. Open Supabase Dashboard &rarr; **Project Settings** &rarr; **API**.
2. Click **Generate new JWT secret** (this immediately revokes all current `service_role` and `anon` tokens).
3. Copy the newly generated `service_role` key.
4. Update any server-side Edge Functions or server secrets:
   - Supabase Dashboard &rarr; **Edge Functions** &rarr; **Secrets** &rarr; update `SUPABASE_SERVICE_ROLE_KEY`.
5. Update `VITE_SUPABASE_ANON_KEY` in frontend build and re-deploy.
6. Inspect `public.audit_logs` and Supabase Database Logs for unauthorized query patterns.

### Scenario C: PostgreSQL Database Password Compromised
*Risk: Critical (Direct connection bypasses API layer).*
1. Open Supabase Dashboard &rarr; **Project Settings** &rarr; **Database**.
2. Scroll to **Database password** &rarr; click **Reset database password**.
3. Generate a strong 32+ character random alphanumeric string.
4. Update your local offline backup scripts with the new password.

### Scenario D: Hostinger Mail / SMTP Credentials Compromised
*Risk: High (Attacker could send unauthorized spam).*
1. Log in to Hostinger hPanel &rarr; **Emails** &rarr; select `everygyan.com`.
2. Locate the sending mailbox &rarr; click **Manage** &rarr; **Change Password**.
3. Update `SMTP_PASS` in Supabase Edge Functions Secrets.
4. Send a test email via CMS Dashboard to verify dispatch.

### Scenario E: n8n Ingest Webhook Secret Compromised
*Risk: Medium (Unauthorized users could inject draft articles).*
1. Generate a new cryptographic token:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Open Supabase Dashboard &rarr; **Edge Functions** &rarr; **Secrets** &rarr; update `N8N_INGEST_SECRET`.
3. Open your n8n workflow &rarr; update the Header `x-n8n-secret` with the new token.
4. Test with a draft payload to confirm ingestion.

---

## 7. Troubleshooting Common Operational Issues

### Issue 1: "Database connection failed" / Seed Articles Rendered
- **Symptom**: Frontend displays verified seed data instead of live database articles; console warns `Supabase fetch failed`.
- **Causes**:
  1. `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing from build.
  2. Supabase Free project has auto-paused due to 7 days of inactivity.
- **Resolution**:
  1. Log in to Supabase Dashboard. If project is paused, click **Restore Project** (takes ~60 seconds).
  2. Verify environment keys in `.env` and rebuild: `npm run build`.

### Issue 2: Row-Level Security Denial (`42501 permission denied`)
- **Symptom**: User tries to save article or view subscriber list and receives a PostgreSQL 42501 error.
- **Causes**: User account is missing the required role (`author`, `editor`, or `admin`).
- **Resolution**: Check user role in Supabase `public.profiles`. If the user is an author attempting to delete an article that is already `in_review` or `published`, only admins have delete permission.

### Issue 3: LiteSpeed 404 Error on Direct Page Refresh
- **Symptom**: Visiting `https://everygyan.com/` works, but refreshing `https://everygyan.com/article/some-slug` returns a 404 Not Found error.
- **Cause**: `.htaccess` is missing from Hostinger's `/public_html` directory.
- **Resolution**:
  1. Open Hostinger File Manager &rarr; `/public_html`.
  2. Check if `.htaccess` is present (ensure "Show hidden files" is enabled).
  3. If missing, copy `public/.htaccess` from the repository into `/public_html`.

### Issue 4: Hostinger SMTP Delivery Throttling
- **Symptom**: Newsletter campaign gets stuck in `sending` or partial batches report failures.
- **Cause**: Exceeded Hostinger Business hourly email limit (typically 200–500 emails/hour).
- **Resolution**:
  1. The built-in batch sender processes in chunks of 25 recipients. Wait 60 minutes before retrying the next batch.
  2. Do not use Hostinger shared mailboxes for massive broadcast lists (> 1,000 subscribers); review third-party SMTP upgrade when subscriber count warrants it.

---

## 8. Recurring Maintenance Schedule

This checklist outlines proactive maintenance tasks, indicating whether they are manual, automated, or require a local developer machine.

### 8.1 Weekly Maintenance Checklist

| Task | Type | Tool / Interface | Instructions |
| :--- | :---: | :--- | :--- |
| **Inspect Failed Ingestion Jobs** | Manual | Supabase SQL Editor | Run: `SELECT * FROM public.audit_logs WHERE event_type LIKE '%fail%' ORDER BY created_at DESC LIMIT 20;` |
| **Review Failed Email Dispatches** | Manual | CMS Dashboard / DB | Check `/dashboard/newsletter` for partial send failures or unhandled errors. |
| **Pending Subscriber Review** | Manual | Supabase SQL Editor | Run: `SELECT count(*) FROM public.newsletter_subscribers WHERE status = 'pending_confirmation' AND created_at < now() - interval '7 days';` |
| **Comments Moderation Queue** | Manual | CMS Dashboard | Visit `/dashboard/comments` and approve, reject, or mark spam for pending comments. |

### 8.2 Monthly Maintenance Checklist

| Task | Type | Machine Needed? | Tool / Interface | Instructions |
| :--- | :---: | :---: | :--- | :--- |
| **Database Snapshot Backup** | Manual | **Yes** (Local CLI) | Terminal / `pg_dump` | Execute `pg_dump` backup command per [`docs/deployment-and-rollback-runbook.md`](./deployment-and-rollback-runbook.md) and store offsite. |
| **Backup Restore Rehearsal** | Manual | **Yes** (Local CLI) | Local PostgreSQL | Restore snapshot into a local test database (`everygyan_test`) to verify archive integrity. |
| **Media Storage Backup** | Manual | **Yes** (Local CLI) | Supabase CLI / curl | Download `public-media` bucket assets to local offline storage. |
| **Dependency & Security Audit** | Manual | **Yes** (Local CLI) | Terminal (`npm audit`) | Run `npm audit` and `npm outdated`; upgrade non-breaking patch dependencies. |
| **Role Audit** | Manual | No (Browser) | Supabase SQL Editor | Run: `SELECT role, count(*) FROM public.profiles GROUP BY role;` Verify author/admin accounts. |
| **Storage & Database Quotas** | Manual | No (Browser) | Supabase Dashboard | Verify database size is comfortably within the 500 MB Free Tier limit. |
| **Broken Link Spot-Check** | Manual | No (Browser) | W3C Link Checker | Run a scan on `https://everygyan.com` to detect broken internal/external reference links. |
| **Search Console Health** | Manual | No (Browser) | Google Search Console | Review Index Coverage, Core Web Vitals report, and sitemap fetch status. |
| **Hostinger SSL Renewal Check** | Manual | No (Browser) | Hostinger hPanel | Confirm Let's Encrypt auto-renewal status is active. |

---

*This document is maintained as part of the EveryGyan production documentation suite.*
