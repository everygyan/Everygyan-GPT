# Architecture Decision Record (ADR)

* **Record ID:** ADR-001  
* **Title:** EveryGyan Web Platform Architecture Baseline  
* **Status:** Confirmed / Accepted by Project Owner  
* **Date:** 2026-10-20  
* **Decider:** Project Owner & Antigravity Assistant  

---

## 1. Context and Problem Statement

EveryGyan is an editorial, learning, and family-friendly travel publication aimed at delivering accessible, high-quality knowledge across multiple verticals (Technology/News, SAP & Learning Tutorials, Health, Geopolitics, Sports, and Travel).

The project requires a production-ready, highly secure, responsive, and cost-effective digital publishing platform. The architecture must minimize operational costs, leverage existing infrastructure subscriptions, eliminate server management overhead, ensure robust access control, and provide a clear separation of concerns across hosting, data, version control, and development tooling.

---

## 2. Confirmed Project Decisions & Brand Identity

* **Public Brand Name:** **EveryGyan**
* **Official Tagline:** **Knowledge for Everyone, Everywhere**
* **Environment vs. Brand Distinction:** Google Antigravity is the development environment and agentic coding assistant; it is not the website brand or customer-facing identity.
* **Approved Infrastructure Stack:**
  * **Frontend:** React + Vite + TypeScript (Single-Page Application architecture with client-side routing).
  * **Styling & Design System:** Tailored utility-first design system reflecting the confirmed editorial layout (white canvas, dark navy `#0F172A`/`#111827` header and footer, restrained red accent `#E53E3E` for CTAs and labels, rounded card modules, and accessible contrast).
  * **Authoritative Backend & Database:** **Supabase Free** (`https://wttiswajotrmmrcwzqdy.supabase.co`). Provides PostgreSQL, Supabase Auth (JWT-based), Supabase Storage for media, and Row Level Security (RLS).
  * **Production Hosting:** **Hostinger Business Web Hosting** for serving the compiled static assets (`dist/`) and domain management.
  * **Source of Truth:** **GitHub** (`https://github.com/everygyan/Everygyan-GPT`) with `main` representing production-ready code.
  * **AI Draft Automation (Optional):** Local/self-hosted n8n workflows connecting strictly to a authenticated draft endpoint. AI-generated content must remain in `draft` status pending editorial review.

---

## 3. Explicit Architecture Boundaries (Non-Negotiables)

1. **No Database Migration to MySQL:** Hostinger MySQL will not be introduced. Supabase PostgreSQL remains the sole authoritative source of truth for application data.
2. **No Second Authoritative Database:** All relational data (articles, users, roles, categories, tags, comments, newsletter subscribers) lives exclusively in Supabase.
3. **No Custom Node.js Server:** We will not run or maintain a custom Express/Node.js server process on Hostinger. The built frontend consists of static HTML/JS/CSS, interacting directly with Supabase via secure HTTPS/REST and RLS.
4. **No Paid Dependencies:** No third-party paid services or API subscriptions will be introduced without prior explicit written owner approval.
5. **No Secrets in Client Code or Git:** Supabase `service_role` secrets, database passwords, and SMTP credentials must never appear in frontend code, browser bundles, sample code, or git-tracked files. Only the public `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_URL` may exist in client code, strictly shielded by PostgreSQL Row-Level Security policies.

---

## 4. Repository Verification & Mismatch Analysis

An audit was conducted on the repository directory (`C:\Users\Devansh\OneDrive\AG PRJs\GPT`):

| Evaluation Point | Expected State | Current Workspace State | Evaluation & Impact |
|---|---|---|---|
| **Documentation & Rules** | `GEMINI.md`, Promptbook, setup checklist | Present and verified | Aligned. Project rules and promptbook are established. |
| **Git Tracking** | Initialized repository linked to GitHub | Not initialized (`.git` absent) | Mismatch to be resolved in Prompt 3 (safe Git initialization and remote setup). |
| **Frontend Codebase** | React + Vite + TypeScript application | Not yet scaffolded | Clean slate. No conflicting code or legacy debt exists. |
| **Database Migrations** | Local SQL migration files | Not yet created | Clean slate. Forward-only SQL migrations will be created in `supabase/migrations`. |
| **Environment Configuration** | `.env.example` with placeholders | Not yet created | To be introduced in Prompt 3 with `.gitignore`. |

* **Material Blockers:** None. The clean state provides an uncompromised foundation to build the exact approved architecture without breaking legacy integrations.

---

## 5. Operational Limits & Risk Management

### A. Supabase Free Tier
* **Database Size:** Limited to 500 MB. Adequate for hundreds of thousands of structured text articles and comments.
* **Storage Limit:** 1 GB file storage and 5 GB egress. Media uploads must be optimized, compressed (WebP/JPEG), and dimensionally constrained.
* **Inactivity Pausing:** Supabase pauses Free projects after 7 consecutive days of inactivity.
  * *Operational Policy:* Document manual restoration from the Supabase dashboard. Maintain regular schema and content backups in git/local SQL. Automated keep-alive workarounds that violate platform terms are prohibited.

### B. Hostinger Email Limits
* Hostinger Business basic server-side mail/PHP sendmail is strictly throttled (typically 10 messages/minute and 100 per rolling 24 hours).
* *Operational Policy:* Newsletter subscription records and campaigns will be stored and managed in the database. Bulk email sends will strictly respect rate limits and must be verified against actual mailbox parameters before initiating broadcasts.

### C. n8n Automation Workflows
* Local/self-hosted n8n workflows rely on machine uptime and network connectivity.
* *Operational Policy:* n8n is strictly an optional productivity accelerator. The core publication platform must operate completely independently of n8n. All AI drafts require human verification and manual publication.

---

## 6. Consequences & Implementation Path

### Positive Consequences
* **Zero Infrastructure Overhead:** Fully serverless architecture leveraging managed Supabase and static CDN/web hosting.
* **Cost Predictability:** $0 incremental operational costs by utilizing existing Hostinger Business and Supabase Free quotas.
* **Enterprise-Grade Access Security:** Row Level Security (RLS) policies baked directly into the database engine rather than brittle UI-only checks.
* **High Performance:** Vite-bundled React code delivers sub-second initial loads, optimized assets, and responsive rendering across all viewports.

### Negative Consequences / Trade-offs
* **Hostinger SPA Routing:** Single Page Application client-side routing requires Apache `.htaccess` rewrite configuration on Hostinger to prevent 404 errors on browser page reloads.
* **Free-Tier Vigilance:** Requires active monitoring of Supabase database and storage usage to avoid unexpected project pauses.

---

## 7. Acceptance & Next Step

This record confirms the architectural baseline. No application code was altered.

* **Next Safe Step:** Proceed to **Prompt 3 — Git hygiene and safe development workflow** (initialize local Git, create `.gitignore` and `.env.example`, document workflow in `docs/development-workflow.md`, and establish remote connection to `https://github.com/everygyan/Everygyan-GPT`).
