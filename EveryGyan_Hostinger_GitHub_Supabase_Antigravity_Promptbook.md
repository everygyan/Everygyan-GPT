# EveryGyan Architecture Blueprint and Antigravity Promptbook

**Purpose:** A controlled, low-incremental-cost plan to finish a blog, learning, and travel website with authentication, role-based access, a CMS, comments, subscriber management, newsletters, SEO, and optional n8n-generated drafts.

**Confirmed project decisions:** The public website brand is **EveryGyan** with the tagline **Knowledge for Everyone, Everywhere**. Google Antigravity is the coding environment, not the website brand. The chosen architecture is **Hostinger Business + GitHub + Supabase Free**. Do not rename the brand or migrate to MySQL unless the owner explicitly changes this decision later.

---

## 1. Executive recommendation

Use Antigravity as the primary coding assistant, GitHub as the source of truth, Hostinger Business to host the built React/Vite website, and Supabase Free for authentication, PostgreSQL data, and media storage where appropriate. Preserve the current React/Vite + Supabase implementation. No Hostinger MySQL migration is in scope.

### Recommended first-release architecture

```text
Readers / authors / admins
          |
          v
Hostinger Business: serves the built React/Vite website
          |
          +---- Supabase Auth: sign-in, sign-out, password reset
          |
          +---- Supabase Postgres: articles, comments, roles, newsletter data
          |             with Row Level Security policies
          |
          +---- Supabase Storage: article cover images and approved media

GitHub: source code, migrations, tests, CI, architecture docs
Antigravity: inspect -> plan -> implement -> test -> summarize
Optional n8n: creates a draft through a restricted authenticated endpoint;
             it must never publish automatically by default
```

This is the lowest-risk path if the existing site already uses Supabase for public data, authentication, and storage. It avoids paying to rebuild the same backend twice.

### Architecture boundary

Hostinger is the production host for the front-end build; Supabase remains the single authoritative service for auth, data, and media. Do not introduce a custom Node.js backend or Hostinger MySQL simply because those options exist. Add a server-side endpoint (for example, a Supabase Edge Function) only when a feature genuinely needs privileged server-side logic and after checking current free-tier quotas. Never use the Supabase service-role key in browser code.

Hostinger's 50 GB hosting storage is separate from Supabase database/storage quotas. Keep article text and structured content in PostgreSQL; store image files as files in Supabase Storage and monitor quota usage.

### Cost and reliability reality

- **Antigravity / Gemini AI Pro:** good for coding assistance, but do not assume that the subscription automatically pays for Gemini API usage initiated by a production n8n workflow. Antigravity documents plan-dependent quotas; Gemini API has its own tier and billing model. Keep API billing disabled until you deliberately verify the selected model's free-tier limits.
- **Supabase Free:** suitable for an early-stage site, subject to quotas. Supabase documents a 500 MB database quota, 1 GB file storage, 5 GB egress, and automatic pausing of low-activity Free projects. Monitor usage and do not treat Free as an uptime guarantee.
- **Hostinger mail:** check the exact mailbox plan in hPanel. Hostinger's basic server-side mail/sendmail route is limited to 10 messages per minute and up to 100 per rolling 24 hours in its published hosting limits. A larger newsletter list needs a deliberate deliverability and provider-limit plan; don't build a bulk-mail system around PHP `mail()` or assume every mailbox plan has the same quota.
- **n8n:** local self-hosting can avoid a new hosting fee, but scheduled workflows only run while the machine, Docker/container, and internet connection are available. Treat local n8n as optional automation, not a 24/7 production dependency.
- **Lovable credits:** use the remaining credits only for a few well-scoped visual improvements or UI alternatives. Do not use Lovable and Antigravity to edit the same files concurrently without syncing and checking diffs. Lovable supports two-way GitHub sync, and it syncs one active branch at a time.

### Architecture decision gate after the audit

The owner has selected **Hostinger + GitHub + Supabase Free**. The audit should verify that the codebase actually follows this architecture, identify unfinished or unsafe integration points, and propose the smallest changes needed to stabilize it. Do not migrate to Hostinger MySQL, add a second source-of-truth database, or replace Supabase Auth without asking for explicit approval. If a genuine blocker is found (for example, a current app dependency that cannot work with the selected setup), explain it with evidence and pause for a decision rather than silently changing architecture.

---

## 2. Non-negotiable engineering rules

1. **Audit first; don't regenerate the app.** Preserve functioning features unless a defect or explicit requirement justifies changing them.
2. **GitHub is the source of truth.** `main` is production-ready. Use short-lived `feature/*` branches and small commits.
3. **No secrets in frontend code or Git.** Never commit `.env`, service-role keys, SMTP passwords, n8n credentials, API tokens, or production database passwords. Keep only placeholders in `.env.example`.
4. **No destructive database actions without a verified backup.** Never reset/drop production tables to fix a migration. Prefer forward-only migrations and migration review.
5. **Authorization belongs on the server/database, not just in the UI.** Hiding an Admin button is not access control. Supabase uses RLS; a custom Node backend must enforce roles on each protected endpoint.
6. **Draft-first AI automation.** AI and n8n create `draft` or `needs_review` content only. An authenticated human publisher approves and publishes it.
7. **Every phase ends with evidence.** Tests, build results, screenshots where useful, changed files, migration details, known limitations, and rollback instructions.
8. **Do not mix architecture work with unrelated redesign.** One objective per prompt/branch.
9. **No fake integrations.** If email sending, analytics, search, upload, scheduling, or a test is not truly connected, show an explicit configured/not configured state instead of a success message.
10. **Privacy by design.** Collect only necessary user data. Make newsletter consent clear, keep an unsubscribe route, and set a retention policy for logs and submissions.

---

## 2A. Confirmed stack and operating constraints

- **Frontend:** keep the existing React + Vite + TypeScript stack and current router/component library unless the audit demonstrates a concrete defect.
- **Production host:** Hostinger Business serves the production front-end build. Follow the current account's supported deployment method and verify nested route refreshes on the real domain.
- **Backend/data:** Supabase Free is authoritative for auth, PostgreSQL, and media storage already used by the application. Use Row Level Security (RLS) for protected data. The browser may use only the project's public/publishable key; privileged service-role secrets must remain server-side.
- **Version control:** GitHub stores source, migrations, tests, rules and docs. Never store environment files, database dumps containing real data, or secrets.
- **Cost rule:** do not add paid services, new providers, build tools, or a custom API server without owner approval. Prefer current dependencies and existing free-tier capabilities. Record quota, usage and uptime limitations honestly.
- **Supabase Free risk:** monitor database/storage/egress quotas and the inactivity-pause behavior. Back up schema and important content regularly. Free is appropriate for the early stage but is not an uptime guarantee. Never use an automated “keep-alive” workaround to evade provider limits; follow the provider's documented guidance.
- **n8n:** optional and deferred until CMS permissions are secure. Local n8n only runs schedules while the host computer/container and network remain available. Use narrow credentials and a draft-only workflow. Gemini AI Pro does not automatically guarantee free Gemini API calls from n8n; verify billing/quota before enabling AI requests.
- **Email:** newsletter storage and editor functionality can be built before bulk sending. Do not promise deliverability or high-volume sends until the exact Hostinger mail limits, sender authentication and real test results are verified.

## 3. Target feature set and data model

Build only after the audit has established what already exists. Avoid duplicate tables or duplicate functionality.

### Public reader experience

- Responsive home page with recent articles, featured content, category sections, popular/related articles, and clear navigation.
- Categories: Tech, Learning/SAP, Travel, Health, Geopolitics, Sports, or the final category set confirmed by the owner.
- Category and tag pages; article pages with author, publication date, reading time, table of contents where useful, references, related content, share links, and accessible images.
- Search with useful empty/loading/error states and filters by category or tag.
- About, Contact, Privacy Policy, Cookie/Tracking Notice where relevant, Terms, newsletter subscription, and custom 404 pages.
- Travel destination/itinerary features only to the extent planned; avoid building a complex travel booking system unless it becomes a real requirement.

### Authentication and roles

Suggested roles: `reader`, `author`, `editor`, `admin` (and `moderator` if comment moderation needs separate permissions). New accounts default to `reader`. Do not make a user an administrator because their email merely matches a client-side string.

- Registration, sign-in/out, password reset, protected account area, profile/preferences, and sensible expired-session behavior.
- Role assignment must be restricted to a trusted administrator/server path.
- Every privileged action must validate the role on the server or through database policies.
- Add an audit record for consequential administrative actions.

### Article/CMS fields

Minimum suggested fields (use the existing schema if it already satisfies the need):

- ID, title, unique slug, excerpt, body/content, cover image path, author, category, tags.
- Status: `draft`, `in_review`, `scheduled`, `published`, `archived`.
- `published_at`, optional `scheduled_for`, created/updated timestamps.
- SEO title, SEO description, canonical URL when needed, social image, indexability flag.
- Source/reference URLs for research-led content; a clear AI-assisted-content marker internally if desired.
- Revision history for restoring previous content.

Suggested related entities: categories, tags, article-tag join table, article revisions, media metadata, comments, subscriber records, newsletter campaigns, email queue/send history, travel destinations/itineraries (if approved), and admin audit events. Use appropriate foreign keys, unique constraints, indexes, timestamps, and migration files.

### Comments

- Guest comments or signed-in comments: decide after inspecting current UX.
- Moderation states: `pending`, `approved`, `rejected`, `spam`.
- Validation, length limits, safe rendering, rate limiting, anti-spam measures, and moderator/admin controls.
- Never render arbitrary HTML from commenters. Sanitize allowed formatting and guard against XSS.

### Newsletter and weekly letters

- Subscriber states: `pending_confirmation`, `confirmed`, `unsubscribed`, and, if supported, `bounced`.
- Capture consent timestamp and source; confirm email addresses before marketing sends.
- Secure unsubscribe with a non-guessable token; do not require a user to log in to unsubscribe.
- Newsletter issue/campaign states: `draft`, `scheduled`, `sending`, `sent`, `failed`.
- Send queue, batching, retry limits, idempotency, logs, preview/test-send, and suppression of unsubscribed recipients.
- Never mark a campaign “sent” unless the sender actually accepted the messages. Show partial failures.
- Start with manual sending or a small, tested subscriber count until SMTP and deliverability are confirmed.

### n8n integration

- n8n sends structured data to a restricted API/Edge Function, not an unrestricted database credential in a public client.
- The endpoint validates a shared secret/signature, validates payload length and fields, checks an idempotency key, and creates a draft only.
- Keep any server-side Supabase service-role key inside the server-side secret store—not in React, GitHub, or a shared workflow export.
- Log source workflow ID, request ID, creation result, and failures without logging tokens or private subscriber data.
- Use a human approval step before publication. AI-generated factual/travel/health content needs source links and editorial review.

---

## 4. Phases and acceptance criteria

### Phase 0 — Scope and architecture lock
**Goal:** Decide the brand, authoritative database, first-release scope, and what is already implemented.

**Deliverables:** architecture decision record, feature inventory, risk list, naming decision, acceptance criteria, no code changes.

**Exit criteria:** every critical feature is labelled `working`, `partial`, `broken`, `missing`, or `out of scope`; the Hostinger + GitHub + Supabase Free architecture and its known free-tier risks are documented.

### Phase 1 — Repository and production safety
**Goal:** Establish a recoverable baseline.

**Tasks:** connect/verify GitHub, inspect current branch and uncommitted files, add `.env.example`, ensure ignores are correct, capture baseline build/test status, create a verified database backup, document current deployment and redirect rules.

**Exit criteria:** clean checkpoint commit, no secrets tracked by Git, working backup/restore instructions, no unexplained production changes.

### Phase 2 — Audit and stabilization
**Goal:** Fix existing errors before adding features.

**Tasks:** dependency/install audit, TypeScript/lint/build, dead route and console-error audit, responsive inspection, API and data query audit, authentication/RLS audit, loading/error/empty states.

**Exit criteria:** baseline passes repeatable build checks; open issues are categorized by severity; critical data/security risks are resolved before feature expansion.

### Phase 3 — Visual design system and public pages
**Goal:** Deliver a coherent, accessible site.

**Tasks:** design tokens, type scale, spacing, buttons/forms/cards, layout, header/footer, responsive navigation, home, category/tag, article, search, about/contact/legal pages, 404.

**Exit criteria:** visual consistency across mobile/tablet/desktop, keyboard navigation, correct link states, no horizontal overflow, public pages do not expose draft data.

### Phase 4 — Data schema and authorization
**Goal:** Establish a reliable content model and enforce access correctly.

**Tasks:** inspect current schema, migrations, foreign keys, indexes, role model, RLS policies (or API middleware if migrating), seed data strategy, backup and rollback strategy.

**Exit criteria:** anonymous users can read published content only; draft and private user data are inaccessible; only authorized roles can write; migrations are repeatable from a fresh staging database.

### Phase 5 — Authentication and account area
**Goal:** Secure login and role-aware experiences.

**Tasks:** registration, login, logout, reset password, session persistence, profile, user preferences, admin/author/moderator route guards, server/database authorization tests.

**Exit criteria:** a reader cannot execute editor/admin operations by calling APIs directly; role escalation is not possible through profile editing; reset flows and expired sessions work.

### Phase 6 — CMS and editorial workflow
**Goal:** Make daily publishing manageable.

**Tasks:** article list/filter, editor, slug handling, autosave with visible status, preview, image selection/upload, draft/review/publish/archive transitions, schedule representation, revision history, category/tag management, audit logs.

**Exit criteria:** author/editor can create and preview a draft; only authorized roles publish; double-submit does not duplicate articles; failed uploads/saves are reported accurately; published URL and metadata are correct.

### Phase 7 — Comments and moderation
**Goal:** Add community interaction without opening a security hole.

**Tasks:** submission form, validation, moderation queue, approve/reject/spam actions, rate limiting, sanitization, pagination, comment notification only if real email delivery exists.

**Exit criteria:** malicious HTML/script is inert; unauthorized users cannot approve comments; spam/rate limits work; deleted or rejected content is not public.

### Phase 8 — Newsletter and weekly letters
**Goal:** Capture consent and publish controlled email editions.

**Tasks:** subscribe and confirmation flow, preference/unsubscribe page, subscriber export restricted to admins, issue composer, preview/test-send, campaign queue, batching, retries, delivery logs, sender domain authentication checklist.

**Exit criteria:** non-confirmed/unsubscribed addresses do not receive marketing mail; unsubscribe takes effect immediately; failed/partial sends are visible; test send works on the exact provider plan; email limits are respected.

### Phase 9 — SEO and discoverability
**Goal:** Make published content indexable and drafts private.

**Tasks:** titles/descriptions, canonical URLs, Open Graph/Twitter metadata, XML sitemap, robots.txt, article/author/breadcrumb structured data where valid, category breadcrumbs, redirect map, image alt text, search-engine verification instructions.

**Exit criteria:** no draft/private URLs in sitemap; published article has one canonical URL; old URLs redirect correctly; structured data matches visible content; no accidental `noindex` on key pages.

### Phase 10 — n8n draft automation
**Goal:** Generate useful drafts with safe review gates.

**Tasks:** define JSON contract, authenticated endpoint, idempotency key, payload validation, maximum sizes, audit log, source URL storage, duplicate detection, workflow error handling, draft notification, manual approval. Build one workflow before scaling categories.

**Exit criteria:** a repeated workflow execution does not create duplicates; invalid signatures are rejected; failures don't publish half-written articles; generated content stays draft; no secrets appear in workflow exports/logs.

### Phase 11 — Quality, security, accessibility, and performance
**Goal:** Test the whole system like a product.

**Tasks:** unit/integration/end-to-end tests, mobile navigation, browser console, accessibility, dependency audit, RLS/API authorization tests, XSS/CSRF/session review appropriate to stack, image sizing, cache strategy, Core Web Vitals baseline, broken-link scan.

**Exit criteria:** production build passes; critical flows pass in automated/manual tests; no known critical/high security defect is left without an explicit risk decision; performance budget is documented.

### Phase 12 — Staging, deployment, and launch
**Goal:** Deploy predictably and recover quickly.

**Tasks:** stage config, production secrets in host dashboard, production build, rewrite/fallback rules for SPA routes if applicable, DNS/SSL, DB migration order, smoke tests, rollback and backup rehearsal, monitoring/log review.

**Exit criteria:** root, article, category, login, CMS, subscribe/unsubscribe and admin actions tested on the production domain; HTTPS works; errors are observable; restore procedure is documented.

### Phase 13 — Ongoing operations
**Goal:** Maintain without depending on the AI remembering how the project works.

**Daily/weekly:** review comments and article drafts; check failed emails and automation runs; test new pages; monitor hosting/database usage; keep an editorial queue.

**Each change:** create branch, inspect plan/diff, run tests, commit, deploy, smoke-test, monitor, retain rollback point.

**Monthly:** restore-test a backup, review role assignments, remove unused credentials, check dependency updates, review storage/database usage, validate newsletter unsubscribe and sender records, examine top broken links and slow pages.

**Exit criterion:** a `docs/runbook.md` explains deployment, backup, restore, environment variables, admin bootstrap, troubleshooting, and emergency rollback without depending on chat history.

---

## 5. Copy-ready Antigravity prompts — use in order

**How to use:** Open the project folder in Antigravity. Start with Prompt 1. Read the resulting audit and approve the architecture direction yourself. Use one prompt per task/branch; do not paste all prompts into one huge request. After each change, inspect the diff and test results before continuing. If any prompt reveals a destructive change or a new paid service is required, stop and document the decision first.

### Prompt 1 — Read-only full project audit

```text
Act as a senior software architect and security-focused maintainer for this existing blog/learning/travel website. First perform a READ-ONLY audit. Do not edit files, install packages, run destructive commands, change the database, or deploy anything.

Inspect the repository structure, package scripts, framework versions, routing, components, styling system, data layer, authentication, Supabase config/migrations/policies, storage usage, environment-variable references, build setup, Git status, tests, and deployment configuration. Identify the current source of truth and any incomplete or duplicated features.

Produce these files as proposed content only in your response, not by editing the repository: (1) architecture summary, (2) route/page inventory, (3) feature matrix labelled working/partial/broken/missing, (4) security risks ranked Critical/High/Medium/Low, (5) data model summary, (6) build/test baseline commands and results, (7) unknowns that must be verified, (8) recommended phased plan. Clearly separate observed facts from assumptions. Do not invent test results. Finish with the smallest safe next step.
```

### Prompt 2 — Confirm selected architecture and create decision record

```text
Using the audit evidence, create docs/architecture-decision-record.md. The owner has selected: public brand EveryGyan; tagline “Knowledge for Everyone, Everywhere”; React + Vite + TypeScript; Hostinger Business for production front-end hosting; GitHub as the source of truth; Supabase Free for Auth, PostgreSQL and Storage where already used. Antigravity is the coding tool, not the website name.

Verify the repository against this selected architecture and document any mismatch. Do not propose or implement a MySQL migration by default. Do not replace Supabase Auth, change the public brand, change domains/slugs, add another database, or add a paid dependency. If evidence shows a material blocker, explain the facts, options, risks and estimated migration scope, then stop for owner approval. Include Supabase Free limits/pausing as operational risks to monitor. No application code changes in this prompt.
```

### Prompt 3 — Git hygiene and safe development workflow

```text
Prepare this repository for controlled feature development without changing application behavior. Inspect Git status first and do not discard any user changes. Recommend a simple solo workflow: production-ready main branch, short-lived feature branches, small commits, and a tagged rollback point before risky work.

Check .gitignore and ensure secrets, local environment files, build output, dependency folders, logs, and local database dumps are excluded appropriately. Add or update .env.example using placeholder values only. Search tracked files for likely secrets; report file paths and secret types but never print the full secret value. Do not revoke or rotate credentials automatically.

Document the workflow in docs/development-workflow.md. If edits are safe, make only those specific hygiene edits, show the diff, run relevant checks, and stop. Never force-push, rewrite history, or overwrite existing work.
```

### Prompt 4 — Baseline build and bug triage

```text
Establish a truthful baseline for the existing app. Inspect package scripts, then run only non-destructive install/build/lint/type-check/test commands supported by the repository. Do not upgrade all dependencies or rewrite configuration as a shortcut.

Collect build errors, TypeScript errors, lint failures, failed tests, browser-console issues that can be reproduced, broken routes, missing assets, and obvious mobile overflow. Categorize each issue by severity and user impact. Fix only clear build blockers that can be safely fixed without changing product behavior; otherwise report proposed fix options first.

At the end provide exact commands and actual results, files changed, any unresolved error, and a recommended order of remediation. Do not claim a test passed if it was not run.
```

### Prompt 5 — Visual design system and responsive shell

```text
Implement the next visual-system task only, using the existing stack and components. Do not introduce a new UI framework or duplicate an existing design system. Brand is confirmed as **EveryGyan**; tagline: **Knowledge for Everyone, Everywhere**. Build a modern editorial/news/learning/travel publication with a white content canvas, dark navy header/footer, crisp typography, generous whitespace, a restrained red accent for CTAs and labels, subtle borders/shadows, rounded article cards, and accessible contrast. Keep theme tokens in one place.

Homepage direction: (1) dark header with EveryGyan wordmark, tagline, primary nav for Latest News, Reviews, Big Tech, Entertainment, Gadgets, Learning, Travel, search, Login and red Subscribe CTA; (2) prominent lead-story card with large travel/editorial image and readable overlay text; (3) compact Latest News column alongside it; (4) category icon row such as Tech, Health, Geopolitics, Sports, Travel, Learning; (5) three-column Featured Articles cards on desktop; (6) newsletter banner; (7) dark footer with quick links, categories, social links and legal links. Do not copy the mock-up's text or claim placeholder articles are real; use actual database content and good empty states.

The article page should use a readable narrow text column, breadcrumb, category, title, byline/date/reading time, cover image, table of contents for long articles, body headings, references, related articles, share controls and comments where available. The signed-in dashboard should use a different shell from the public site, with a left sidebar for Dashboard, My Articles, Comments, Subscribers, Newsletters and Settings, showing only permitted links. Review and improve shared header, navigation, footer, buttons, forms, article cards, category chips, loading skeletons, empty/error states.

Test mobile, tablet, and desktop widths; verify keyboard navigation and visible focus. Avoid placeholder links and fake interaction. Do not restructure backend code. Summarize screenshots/URLs checked, files changed, accessibility issues remaining, and build results.
```

### Prompt 6 — Public routes and reader experience

```text
Audit the public routes and implement only missing or defective reader-facing pages: home, category, tag, article detail, search, about, contact, privacy/legal pages, and not-found page. Reuse the existing database and components. Do not invent static hard-coded article data to conceal a failed API; show honest loading, empty, and error states.

The home page should make recent and featured content easy to discover. Category and tag pages need pagination or a bounded list. Article detail should support title, excerpt, author, dates, reading time where calculated correctly, cover image with alt text, table of contents for sufficiently long content, references where supplied, and related articles.

Ensure anonymous readers only receive content meant to be public. Draft, scheduled, archived, private user data, and admin-only data must not leak in client payloads. Verify direct URL loading and browser refresh on nested routes under the actual hosting strategy. Run tests and report exact routes checked.
```

### Prompt 7 — Supabase schema and authorization audit

```text
For the current Supabase-based implementation, inspect migrations, tables, indexes, foreign keys, authentication linkage, Row Level Security status, and every policy relevant to articles, profiles/roles, comments, media, and newsletter data. Do not reset the database or edit production data.

Create a table-by-table access matrix for anonymous, reader, author, editor, moderator, and admin. Identify any table accessible without necessary RLS, policies that allow unintended writes, policies that trust user-provided role values, or public endpoints that expose private data. Distinguish a verified vulnerability from a suspicion.

Propose minimal forward-only migrations and policy changes. Preserve current data and existing deployed migration history. For each proposed change include risk, rollback approach, and tests. Wait to implement security-policy changes until the proposal is reviewed; never put a service-role key into frontend code.
```

### Prompt 8 — Authentication, user profile, and role enforcement

```text
Implement or repair account features using the existing authentication provider: sign up, sign in, sign out, password reset, session handling, profile/preferences, and appropriate unauthorized/expired-session states. Do not replace the auth provider or change providers as part of this task.

Roles should be reader, author, editor, and admin; add moderator only if the existing product needs separate comment permissions. New users must default to reader. Role changes must only be possible through a trusted admin/server/database path. Never infer admin status solely from a client-side email comparison or a local-storage flag.

Enforce authorization in database policies/server endpoints, not merely by hiding UI elements. Add tests that directly attempt forbidden reads/writes for each role. Check password reset URLs and redirects for the production domain. Do not create a hard-coded default admin password. Document the safe one-time admin-bootstrap procedure without exposing credentials.
```

### Prompt 9 — CMS, editorial workflow, revisions, and media

```text
Build a complete but maintainable CMS on top of the existing data model. First verify the schema; do not create duplicate articles/categories/tags tables. The editor should support title, slug, excerpt, article body, category/tags, cover media, author, SEO title/description, references, and status.

Required workflow: draft -> in_review -> scheduled or published -> archived, with transitions limited by role. Include article list with filters and status, create/edit, preview, meaningful save/autosave feedback, safe slug generation with collision handling, cover-image upload/selection, publication timestamp, and revision history or another documented recovery mechanism.

Never show a success state if save/upload failed. Avoid losing editor content on a failed request. Make published URLs stable and validate content before publishing. Add tests for role restrictions, unique slugs, double submission, autosave, upload failure, preview, scheduling metadata, and draft invisibility. Do not build automatic publishing by AI.
```

### Prompt 10 — Comments, spam controls, and moderation

```text
Implement the comment lifecycle using the existing authentication/data architecture. Before coding, confirm whether comments are guest-submitted or limited to signed-in readers; preserve current behavior unless it is unsafe.

Add validation and length limits, safe text rendering/sanitization, rate limits, pagination, moderation states pending/approved/rejected/spam, and an admin/moderator queue with approve/reject/spam actions. Public article pages must show only approved comments. A reader must not be able to approve or delete another person's content by calling the API directly.

Do not render arbitrary user-provided HTML. If an anti-spam provider would require a paid plan or new third-party service, keep a low-cost built-in rate-limit/honeypot option and clearly document its limitations rather than silently integrating a paid service. Test XSS-like payloads, direct unauthorized API calls, repeated submissions, and empty/error/loading states.
```

### Prompt 11 — Newsletter subscriptions and weekly letters

```text
Implement a consent-based newsletter subsystem using the current database and an explicitly configured email transport. Do not add a paid email provider automatically, and do not pretend email sending works until a real test email succeeds.

Include subscription form validation, pending confirmation/double opt-in, confirmed/unsubscribed states, consent timestamp/source, preference or unsubscribe page, admin-only subscriber list/export, newsletter issue editor/preview, test-send, scheduled campaign metadata, sending queue, batching, retries, idempotency, and send logs. Keep unsubscribe available without requiring login, and ensure unsubscribed or unconfirmed users are excluded from marketing sends.

Check the exact Hostinger email plan and send limits before designing batch sizes. Never use basic server-side mail as an unlimited bulk mailing service. Show partial failures and never mark a campaign fully sent unless the sending provider has accepted the messages. Provide a test plan for confirmation, duplicate signup, unsubscribe, test-send, provider failure, retry, and partial batch failure. Document SPF/DKIM/DMARC setup as an operational checklist, not a fabricated completed integration.
```

### Prompt 12 — SEO, metadata, sitemap, and public trust

```text
Implement a technical SEO pass without altering article content or inventing metadata facts. Ensure each indexable public page has a useful title and description, canonical URL, Open Graph/social preview fields, correct robots directives, breadcrumb navigation where useful, and structured data only when its fields match visible content.

Generate sitemap.xml from published, indexable routes only; exclude drafts, scheduled/private pages, login/account/admin pages, search result URLs where appropriate, and preview routes. Add/update robots.txt, article image alt text, author and date metadata, and redirect rules for existing URLs where provided. Avoid changing existing slugs unless a redirect is created and tested.

Check for duplicate titles/canonicals, broken internal links, missing images, accidental noindex, and the correct production domain. Provide steps for Search Console verification but do not claim verification occurred unless it actually did.
```

### Prompt 13 — Travel and learning content templates

```text
Build reusable templates for travel guides and learning/tutorial articles without creating a separate app or overcomplicating the schema. Inspect existing categories and content first. Keep the common article system authoritative; add structured fields or a destination/itinerary entity only if the actual editorial requirements justify it.

Travel guide template may include destination, best time to visit (editor-supplied and date-stamped where facts can change), transport, budget ranges with currency/date, family/accessibility notes where relevant, itinerary, maps/official links, safety/travel-document caveats, and sources. Learning/SAP tutorial template may include prerequisites, objectives, steps, screenshots, examples, version applicability, troubleshooting, and related lessons.

Do not invent current prices, opening times, visa rules, or factual source links. Make optional sections disappear when empty. Keep pages accessible and fast. Add content validation and preview tests. Report what is schema-driven versus presentation-only.
```

### Prompt 14 — Restricted n8n-to-draft integration

```text
Design a secure n8n integration that can create an article draft, but cannot publish, delete existing articles, change roles, read private subscriber data, or run arbitrary database queries.

Prefer a narrow server-side API/Edge Function endpoint with a server-side secret over putting privileged database credentials in frontend code or a broadly scoped workflow. The endpoint must validate a shared secret/signature, use request IDs/idempotency keys, validate title/slug/body/category/source URLs and payload size, reject malformed requests, detect duplicates, set status=draft/needs_review, and write an audit entry. Keep secrets in the server-side secret manager/n8n credentials and never in the repository or logs.

Return a documented JSON success/error contract. Add tests for valid request, invalid secret, duplicate request, oversized payload, invalid category, missing sources, database failure, and attempts to publish/delete. Provide an example workflow payload with placeholder values only. Explain how to test against staging first. Never auto-publish generated content.
```

### Prompt 15 — Automated tests and security regression suite

```text
Build a maintainable test strategy around critical user journeys, using the test tools already in the project when suitable. Do not introduce a costly testing service. Separate unit, integration, and end-to-end tests. Create fixtures/seeds that cannot accidentally delete production data.

Cover: anonymous published-article reads; draft invisibility; registration/login/reset; reader-vs-author/editor/admin permissions; CMS save/preview/publish; comments and moderation; subscribe/confirm/unsubscribe; newsletter draft/test-send behavior; n8n draft endpoint; sitemap exclusion of private content; error and empty states; nested-route refresh.

For Supabase, test RLS using users/tokens representing different roles rather than only testing the frontend. For a Node backend, test every protected API handler without valid credentials and with lower-privilege roles. Add a documented command that runs the checks in CI. Report uncovered critical cases and do not claim security certification. Run the build and tests; include actual output summary.
```

### Prompt 16 — Accessibility, responsive design, and performance

```text
Audit and improve accessibility and performance without changing business logic. Test narrow mobile, normal mobile, tablet, laptop, and wide desktop. Check keyboard-only navigation, logical headings, focus visibility, labels/errors, contrast, alt text, reduced-motion preferences, dialog focus behavior, and touch target sizes. Use semantic HTML and avoid ARIA when native controls are sufficient.

Inspect image dimensions/formats, lazy loading, font loading, bundle size, duplicated dependencies, blocking scripts, expensive queries, pagination, and caching. Set realistic performance budgets based on measured results. Do not install a paid monitoring or optimization service. Avoid lazy-loading the main above-the-fold image if it harms perceived loading; use measured evidence.

Report measured results and the test method. Distinguish a local Lighthouse result from production real-user data. Fix only the issues in scope, run the tests/build, and document trade-offs.
```

### Prompt 17 — Hostinger deployment and rollback runbook

```text
Prepare a deployment plan for the selected architecture and the actual Hostinger Business account capabilities. Do not deploy to production or change DNS automatically.

For React/Vite, document the actual build output (usually dist/), deployment/upload steps for Hostinger Business, SPA route fallback/rewrite behavior if needed, environment-variable handling, Supabase project URL and publishable/anon key configuration, SSL/domain checks, cache invalidation, and smoke tests. Do not add a custom Node.js backend or MySQL in this project. Never expose Supabase service-role keys, SMTP passwords, n8n secrets, or any privileged credential to browser code.

Document staging vs production environment separation, migration ordering, how to back up the database and uploaded media, how to test a restore, and rollback steps for both code and schema. Provide exact commands based on this repository and label any hosting-panel step that must be completed manually. Do not report deployment success until the production URL has been tested.
```

### Prompt 18 — Final production-readiness review

```text
Act as an independent release reviewer. Do not implement new features during this review. Inspect the final diff, repository status, test/build history, environment configuration, authentication/authorization tests, RLS or API policies, newsletter handling, n8n endpoint, SEO configuration, accessibility, performance, backup/restore notes, and deployment procedure.

Create docs/production-readiness-checklist.md with pass/fail/not-tested results and supporting evidence. Prioritize findings by severity and state the user impact. Explicitly check for secrets in Git history/current files, accidental public access to drafts or subscriber data, role escalation, broken redirects, missing unsubscribe behavior, inaccurate email campaign statuses, and AI auto-publishing.

Do not certify the site as secure or production-ready if critical tests are missing. Give a go/no-go recommendation, list blocking fixes, and provide a short post-deployment smoke-test sequence. Preserve the working code; no broad refactor in this phase.
```

### Prompt 19 — Ongoing maintenance documentation

```text
Create/update docs/runbook.md and docs/editorial-workflow.md so the website can be operated without relying on this chat. Cover local setup, supported Node/package versions, environment variables (names only, no values), migrations, safe admin bootstrap, content publishing, comments moderation, newsletter confirmation/unsubscribe, draft review, n8n workflow operation, troubleshooting common errors, backup/restore, deployment, rollback, and how to rotate a compromised secret.

Add a recurring maintenance checklist: weekly logs/failed jobs and subscriber issues; monthly backup restore rehearsal, dependency/security updates, role review, storage/database usage, broken links, newsletter deliverability, and SEO spot checks. State which tasks are manual, which are automated, and which require a working local machine. Do not invent automation that isn't present in the code. Verify all commands against the repository before documenting them.
```

---

## 6. Release test matrix

| Area | Test | Expected result |
|---|---|---|
| Public access | Open home/category/article while signed out | Published content is visible; drafts/private records are not |
| Routes | Paste a nested article URL into a new tab and refresh | Route loads correctly on production hosting |
| Search | Search valid, absent, special-character and long query | Useful results or safe empty state; no broken layout |
| Auth | Register, log in/out, reset password, expired session | All flows work; redirect domains are correct |
| Roles | Reader tries CMS API; author tries admin settings | Server/database denies unauthorized actions |
| CMS | Create draft, edit, preview, publish, archive | Correct status and public visibility; no duplicate save |
| Media | Upload valid file, invalid type, oversized file | Valid upload works; invalid upload is rejected clearly |
| Comments | Submit normal text, HTML/script payload, repeated comments | Safe rendering, rate limiting, moderation enforced |
| Newsletter | Signup, confirm, unsubscribe, duplicate signup | Consent and state transitions correct; unsubscribe suppresses sends |
| Email campaign | Test send, provider rejection, partial batch failure | Truthful status; failures logged and retry behavior controlled |
| n8n | Valid, invalid-secret, repeated and malformed webhook | Draft only; invalid requests rejected; retry does not duplicate |
| SEO | Check canonical, sitemap, robots, Open Graph | Published URLs indexed as intended; drafts excluded |
| Accessibility | Keyboard-only and mobile checks | No blocked navigation; labels and visible focus present |
| Reliability | Restore database backup in non-production | Documented recovery procedure succeeds |
| Deployment | HTTPS, redirects, login, publish, subscribe, unsubscribe | Core flows work on the production domain |

### Minimum technical commands

First inspect `package.json` and use scripts that actually exist. Typical checks might be:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Do not add missing scripts blindly; create them intentionally and document them. If the project uses another package manager, follow the committed lockfile instead of changing package managers.

---

## 7. Recommended release order

1. Run Prompts 1–4 before implementing features.
2. Decide branding and database architecture from evidence; take backups and commit a baseline.
3. Fix critical security/data issues, then design-system and public-reader issues.
4. Implement authorization before exposing CMS/admin actions.
5. Build the editorial workflow before comments/newsletters; these depend on secure roles and stable content models.
6. Add newsletter sending only after a real provider/plan test. Start with a test recipient and a small list.
7. Add n8n last, with a restricted draft-only endpoint and staging test.
8. Run accessibility, SEO, security, and performance tests before release.
9. Deploy only with a backup and rollback plan; perform a production smoke test immediately after deployment.

## 8. Official documentation references to re-check before implementation

- Hostinger web hosting plan parameters: https://support.hostinger.com/en/articles/6976044-parameters-and-limits-of-hosting-plans
- Hostinger Node.js deployment: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- Supabase Free project pausing: https://supabase.com/docs/guides/platform/free-project-pausing
- Supabase quotas/billing: https://supabase.com/docs/guides/platform/billing-on-supabase
- Lovable GitHub sync: https://docs.lovable.dev/integrations/github
- Antigravity plans/quotas: https://www.antigravity.google/docs/plans
- Antigravity workspace rules (GEMINI.md / AGENTS.md): https://www.antigravity.google/docs/rules/
- Supabase Free plan limits: https://supabase.com/docs/guides/platform/billing-on-supabase
- Gemini API billing: https://ai.google.dev/gemini-api/docs/billing
- n8n Supabase node: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.supabase/

**Final rule:** don't ask the AI to “make the website perfect.” Give it one bounded change, acceptance criteria, and a test plan; require an honest summary of changed files, actual commands/results, remaining issues, and rollback steps. This protects the existing site from accidental regressions.
