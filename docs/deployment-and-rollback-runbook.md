# EveryGyan — Hostinger Deployment and Rollback Runbook

**Publication:** EveryGyan — Knowledge for Everyone, Everywhere  
**Hosting Environment:** Hostinger Business Web Hosting (LiteSpeed Web Server)  
**Backend:** Supabase Free (PostgreSQL, Auth, Storage)  
**Frontend Architecture:** React 18 + Vite + TypeScript (Single-Page Application)  
**Production Domain:** `https://everygyan.com` (Canonical Non-WWW)  
**Document Status:** Operational Runbook  

---

> [!IMPORTANT]
> **Safety & Governance Mandate**  
> 1. Never deploy to production or execute DNS changes automatically. All steps in this runbook are designed for supervised execution with deliberate operator sign-off.  
> 2. Do not introduce a Node.js server, PM2 daemon, or Hostinger MySQL database. The front end is strictly a static Single-Page Application (SPA) served by Hostinger LiteSpeed, backed by Supabase.  
> 3. Never put Supabase `service_role` keys, SMTP credentials, n8n webhook secrets, or database passwords in client code, Git, `.env`, or Hostinger web directories.

---

## 1. Architectural Summary & System Boundary

```mermaid
flowchart TD
    subgraph Client ["Client Browser Tier"]
        Browser["User Browser (Desktop / Mobile)"]
    end

    subgraph Hostinger ["Hostinger Business Web Hosting"]
        WebRoot["/public_html"]
        LiteSpeed["LiteSpeed Web Server (.htaccess)"]
        DistAssets["Static Files (index.html, assets/*.js, assets/*.css, sitemap.xml)"]
        WebRoot --> DistAssets
        LiteSpeed --> WebRoot
    end

    subgraph Supabase ["Supabase Cloud Backend"]
        Auth["Supabase Auth (JWT)"]
        Postgres["PostgreSQL Database (RLS Enforced)"]
        Storage["Media Buckets (public-media)"]
        Edge["Edge Functions (n8n Ingest, Mail Dispatch)"]
    end

    Browser -- "1. Request HTML/JS/CSS (HTTPS)" --> LiteSpeed
    LiteSpeed -- "2. Serve Hashed Bundles (Cache-Control)" --> Browser
    Browser -- "3. Data Query via Anon Key (Supabase JS)" --> Postgres
    Browser -- "4. Session Auth (JWT tokens)" --> Auth
    Browser -- "5. Cover Images / Media" --> Storage
```

- **Frontend Hosting**: Hostinger Business provides high-speed LiteSpeed web servers with Apache `.htaccess` rewrite compatibility. It serves the pre-compiled `dist/` directory.
- **Backend Services**: Supabase Free tier provides Postgres, Row Level Security (RLS), authentication, and media storage. No database resides on Hostinger.

---

## 2. Pre-Deployment Build & Verification

Before uploading any build to Hostinger, the production bundle must be compiled and verified locally or in CI.

### 2.1 Complete CI Verification Command
Run the unified verification command from the repository root:
```bash
npm run ci
```
This single command executes:
1. `npm run typecheck` (`tsc --noEmit`) — ensures zero TypeScript type regressions.
2. `npm run lint` (`eslint src/`) — checks code standards and syntax hygiene.
3. `npm test` (`vitest run`) — runs all 126 unit, integration, and security regression tests.
4. `npm run build` (`tsc && node scripts/generate-sitemap.mjs && vite build`) — generates the sitemap and compiles the production bundle in `dist/`.

### 2.2 Build Output Breakdown (`dist/`)
Upon completion of `npm run build`, verify that the `dist/` directory contains:
```text
dist/
├── index.html                   # HTML entrypoint (configured with no-cache headers)
├── .htaccess                    # LiteSpeed SPA fallback, HTTPS redirect, security headers
├── robots.txt                   # Crawler directives (points to /sitemap.xml)
├── sitemap.xml                  # Dynamic XML sitemap of published indexable articles
├── favicon.svg                  # Brand favicon
└── assets/
    ├── index-[hash].js          # Core application logic (~179 kB / ~44 kB gzip)
    ├── vendor-react-[hash].js   # React & React-Router (~163 kB / ~53 kB gzip)
    ├── vendor-supabase-[hash].js# Supabase client (~227 kB / ~59 kB gzip)
    ├── index-[hash].css         # Compiled Tailwind styles (~48 kB / ~8.5 kB gzip)
    ├── ArticleEditor-[hash].js  # Lazy-loaded CMS editor chunk (~27 kB)
    ├── DashboardNewsletter-[hash].js # Lazy-loaded campaign chunk (~14 kB)
    └── Dashboard*-[hash].js     # Internal dashboard route chunks (< 10 kB each)
```

---

## 3. Environment Variables & Secret Separation

Vite replaces `import.meta.env.VITE_*` variables at **build time**. They are statically bundled into the JavaScript artifacts.

### 3.1 Allowed Client Variables (`.env.production`)
For the production build, ensure `.env.production` contains only public client keys:
```ini
# Supabase Cloud Project Configuration (Anon Key only)
VITE_SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-public-anon-key>

# Public Domain Canonical Configuration
VITE_SITE_URL=https://everygyan.com
VITE_SITE_NAME=EveryGyan
VITE_SITE_TAGLINE="Knowledge for Everyone, Everywhere"
```

### 3.2 Non-Negotiable Secrets Protection
| Secret | Allowed in Client Code? | Allowed in Git? | Correct Location |
| :--- | :---: | :---: | :--- |
| `VITE_SUPABASE_ANON_KEY` | **Yes** (Protected by RLS) | No (Use `.env.example`) | Hostinger build environment / local `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | **NEVER** | **NEVER** | Supabase Edge Functions Secrets only |
| Hostinger SMTP Password | **NEVER** | **NEVER** | Supabase Edge Functions Secrets only |
| n8n Shared Webhook Secret | **NEVER** | **NEVER** | Supabase Secrets & n8n Credential Vault |
| PostgreSQL Database Password | **NEVER** | **NEVER** | Operator password manager / connection string |

---

## 4. Hostinger Business Deployment Procedure

### Option A: Manual Archive Upload via Hostinger hPanel (Recommended for Initial Launch)

1. **Package the Production Build**:
   ```bash
   # From project root in PowerShell:
   Compress-Archive -Path dist\* -DestinationPath dist-production.zip -Force
   ```
2. **Log in to Hostinger hPanel**:
   - Navigate to **Websites** &rarr; Select `everygyan.com` &rarr; Click **Manage**.
3. **Open File Manager**:
   - Under **Files**, click **File Manager** (`public_html`).
   - Navigate to `/home/uXXXXXXX/domains/everygyan.com/public_html` (or default `/public_html`).
4. **Backup Existing Webroot** *(if updating an existing deployment)*:
   - Select all files &rarr; Click **Archive** &rarr; Name `backup-previous-deploy.zip`.
5. **Upload & Extract**:
   - Click the **Upload** button in the top menu &rarr; Select `dist-production.zip`.
   - Right-click `dist-production.zip` &rarr; Select **Extract** &rarr; Extract to `/public_html`.
   - Delete `dist-production.zip` once extracted.
6. **Verify Hidden Files**:
   - Ensure `.htaccess` is present in `/public_html` (toggle "Show hidden files" in File Manager settings if needed).

---

### Option B: Automated Git Deployment via Hostinger hPanel

Hostinger Business supports automatic Git webhook deployment from GitHub:

1. In Hostinger hPanel, go to **Advanced** &rarr; **Git**.
2. **Repository URL**: `https://github.com/everygyan/Everygyan-GPT.git`
3. **Branch**: `main`
4. **Install Path**: `/` (will clone to a release directory).
5. **Deploy Script**: Hostinger LiteSpeed shared hosting does not run long Node build jobs on low-memory containers. The approved workflow is:
   - Build `dist/` via GitHub Actions on tagged releases, or
   - Push compiled assets using a dedicated deployment action.

---

### Option C: SFTP / rsync Deployment via SSH

For fast, incremental updates using SSH access enabled in Hostinger hPanel:
```bash
# 1. Enable SSH in Hostinger hPanel -> Advanced -> SSH Access
# 2. Synchronize dist/ contents to public_html:
rsync -avz --delete -e 'ssh -p 65002' dist/ uXXXXXXX@everygyan.com:public_html/
```

---

## 5. Single-Page Application (SPA) Routing & `.htaccess`

Because React Router handles routing in the browser, direct visits or refreshes to `/article/sample-title` or `/dashboard/articles` will result in a LiteSpeed 404 error without server-level rewrite rules.

The `public/.htaccess` file (copied to `dist/.htaccess` during build) enforces:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # 1. Enforce HTTPS
  RewriteCond %{HTTPS} !=on
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # 2. Canonical Non-WWW Redirect (www.everygyan.com -> everygyan.com)
  RewriteCond %{HTTP_HOST} ^www\.everygyan\.com$ [NC]
  RewriteRule ^(.*)$ https://everygyan.com/$1 [L,R=301]

  # 3. Block access to sensitive files
  RewriteRule ^(\.git|\.env|composer\.|package(-lock)?\.json) - [F,L]

  # 4. SPA Rewrite: Send all non-file/non-directory requests to index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Cache-Control Policy in `.htaccess`
- **`index.html`**: Must NEVER be cached aggressively (`no-cache, no-store, must-revalidate`). When a new deployment occurs, clients immediately receive the new `index.html` with references to newly hashed JS/CSS files.
- **Hashed Assets (`/assets/*.js`, `/assets/*.css`)**: Cached with `public, max-age=31536000, immutable` for maximum speed.

---

## 6. Domain, DNS & SSL Configuration

### 6.1 DNS Records (Hostinger / Registrar)
Ensure the domain's authoritative DNS zone matches:

| Type | Name | Content / Value | TTL | Note |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | Hostinger Server IP (from hPanel dashboard) | 300 | Primary root apex record |
| **CNAME** | `www` | `everygyan.com` | 300 | Redirected to root via `.htaccess` |

Verify DNS propagation via command line:
```bash
nslookup everygyan.com
nslookup www.everygyan.com
```

### 6.2 Hostinger SSL Activation (Let's Encrypt)
1. In Hostinger hPanel, go to **Security** &rarr; **SSL**.
2. Select domain `everygyan.com` (and `*.everygyan.com` or `www.everygyan.com`).
3. Click **Install SSL**.
4. Confirm status displays **Active** with auto-renewal enabled.
5. In hPanel, toggle **Force HTTPS** to ON.

---

## 7. Staging vs. Production Environment Separation

To avoid corrupting production subscriber records or search indexing during development, EveryGyan maintains two strictly separated environments:

| Feature / Resource | Staging Environment | Production Environment |
| :--- | :--- | :--- |
| **Domain URL** | `https://staging.everygyan.com` | `https://everygyan.com` |
| **Hostinger Webroot** | `domains/staging.everygyan.com/public_html` | `domains/everygyan.com/public_html` |
| **Supabase Project** | `everygyan-staging` | `everygyan-prod` |
| **Search Engine Directives** | `X-Robots-Tag: noindex, nofollow` | `sitemap.xml` & indexable `robots.txt` |
| **Subscribers & Campaigns** | Fake test seed addresses only | Real opted-in confirmed readers |
| **n8n Endpoint Target** | Staging Supabase Edge Function | Production Supabase Edge Function |

### Strict Migration Ordering
When rolling out schema or architectural updates:
1. **Apply on Staging**: Run forward migration SQL against the Staging Supabase project.
2. **Automated Verification**: Run `npm run ci` pointing to the Staging project.
3. **Take Production Backup**: Export a full schema & data snapshot of Production.
4. **Apply on Production**: Execute the reviewed migration SQL in the Production Supabase SQL Editor.
5. **Deploy Frontend**: Upload the production `dist/` bundle to Hostinger.
6. **Execute Smoke Tests**: Run the post-deployment smoke test suite.

---

## 8. Database & Media Backup & Restore Procedures

### 8.1 Automated Supabase Backups
- Supabase Free tier provides daily automated infrastructure backups.

### 8.2 Manual Point-in-Time Database Backup (Pre-Deployment)
Before running any forward migration on production, execute a point-in-time snapshot using PostgreSQL `pg_dump`:
```bash
# Retrieve database connection string from:
# Supabase Dashboard -> Project Settings -> Database -> Connection string (URI)
pg_dump "postgresql://postgres.[PROJECT-REF]:[DB-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="everygyan_prod_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### 8.3 Storage Bucket Media Backup
To back up uploaded cover images and article illustrations:
```bash
# Using Supabase CLI or S3-compatible tool:
supabase storage download public-media ./backup_media_$(date +%Y%m%d)/
```

### 8.4 Restore Verification Test Procedure
To verify that a backup file is viable without touching production:
1. Spin up a temporary local PostgreSQL database or staging instance:
   ```bash
   createdb everygyan_restore_test
   ```
2. Restore the dump:
   ```bash
   pg_restore --clean --if-exists --no-owner -d everygyan_restore_test everygyan_prod_backup_YYYYMMDD_HHMMSS.dump
   ```
3. Run verification query:
   ```sql
   SELECT count(*) FROM public.articles;
   SELECT count(*) FROM public.newsletter_subscribers;
   ```

---

## 9. Rollback Runbook (Code & Schema)

### 9.1 Frontend Code Rollback (T < 2 minutes)
If a critical frontend regression occurs after deployment:

#### Method 1: Hostinger File Manager Restore (Fastest)
1. Open Hostinger hPanel &rarr; **File Manager** &rarr; `public_html`.
2. Delete the malfunctioning `assets/` folder and `index.html`.
3. Extract `backup-previous-deploy.zip` (created during Step 4.A.4).
4. In hPanel, navigate to **Advanced** &rarr; **Purge Cache** (LiteSpeed) and click **Purge All**.

#### Method 2: Git Tag Rollback
1. Checkout the previous known-good tag in local terminal:
   ```bash
   git checkout checkpoint-phase-13
   npm run build
   Compress-Archive -Path dist\* -DestinationPath dist-rollback.zip -Force
   ```
2. Upload and extract `dist-rollback.zip` to `public_html`.

---

### 9.2 Database Schema Rollback
All database migrations in [`supabase/migrations/`](../supabase/migrations/) have strict, reversible rollback counterparts:

| Migration File | Rollback Counterpart File | What It Reverts |
| :--- | :--- | :--- |
| `20261020000004_n8n_draft_audit.sql` | `20261020000004_n8n_draft_audit_rollback.sql` | Drops `audit_logs` table and indexes |
| `20261020000003_content_templates.sql` | `20261020000003_content_templates_rollback.sql` | Drops `template_type` & `template_data` from `articles` |
| `20261020000002_newsletter_subsystem.sql` | `20261020000002_newsletter_subsystem_rollback.sql` | Drops `newsletter_campaigns`, send logs, revert tokens |
| `20261020000000_schema_and_rls.sql` | `20261020000000_schema_and_rls_rollback.sql` | Drops custom tables, triggers, and helper functions |

**Execution**: Open Supabase Dashboard &rarr; **SQL Editor** &rarr; Open the required rollback `.sql` script &rarr; Run.

---

## 10. Post-Deployment Smoke Test Checklist

Execute these 10 live checks immediately following deployment to `https://everygyan.com`:

| Step | Test Item | Verification Method | Expected Result | Pass/Fail |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **SSL & Canonical Redirect** | Visit `http://everygyan.com` and `https://www.everygyan.com` | Both 301-redirect to `https://everygyan.com/` with a valid green padlock. | [ ] |
| **2** | **SPA Route Refresh** | Visit `https://everygyan.com/category/tech` and press F5 | Page reloads correctly without a LiteSpeed 404 error. | [ ] |
| **3** | **Anonymous Article Read** | Click on any article card from the home page | Article loads, byline and cover image render, no auth prompt required. | [ ] |
| **4** | **Draft Invisibility** | Attempt to navigate to a draft URL directly | Returns "Article Not Found" empty state; draft is not queryable. | [ ] |
| **5** | **Search Dialog** | Press `Ctrl+K` or click the search icon | `SearchModal` opens; type "SAP" or "Tech"; matching articles return. | [ ] |
| **6** | **Newsletter Subscription** | Submit a valid email in the homepage newsletter banner | Double opt-in confirmation message appears; status is `pending_confirmation`. | [ ] |
| **7** | **Authentication Guard** | Try navigating directly to `/dashboard` as an unauthenticated visitor | Redirects to login modal or home; reader cannot view admin CMS. | [ ] |
| **8** | **Author CMS Access** | Sign in with an author/admin account | Dashboard opens; CMS article editor loads on demand. | [ ] |
| **9** | **Robots & Sitemap** | Visit `https://everygyan.com/robots.txt` and `/sitemap.xml` | Both return 200 OK with valid XML containing only published articles. | [ ] |
| **10**| **Security Headers** | Inspect network response headers in DevTools | `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` present. | [ ] |
