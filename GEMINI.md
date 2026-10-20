# EveryGyan — Workspace Rules for Google Antigravity

## Project identity
- Public brand: **EveryGyan**
- Tagline: **Knowledge for Everyone, Everywhere**
- Website purpose: editorial/blog, learning tutorials (including SAP), technology/news, health, geopolitics, sports, and family-friendly travel content.
- This file defines persistent project rules. Google Antigravity is the coding environment, not the site's public brand.

## Approved architecture
- Front end: preserve the repository's existing React + Vite + TypeScript architecture and its current routing, styling and component choices unless an audited defect justifies a change.
- Hosting: Hostinger Business for the built front end and the public domain.
- Repository/source of truth: GitHub.
- Backend: Supabase Free for the existing authentication, PostgreSQL database, and Storage functionality.
- Do not migrate to Hostinger MySQL or add a custom Node.js backend unless the owner explicitly approves a written architecture change.
- Do not introduce a second authoritative database. Do not add paid services or dependencies without asking first.

## Work method
1. Inspect before editing. For unfamiliar areas, begin with a read-only audit and a short implementation plan.
2. Make one bounded change at a time. Avoid broad rewrites, generated replacement apps, unrelated cleanup, and simultaneous feature work.
3. Preserve existing user changes. Check `git status` before making edits. Never reset, force-push, rewrite Git history, or discard work without explicit approval.
4. Work on a feature branch when feasible. Keep commits small and descriptive; leave `main` deployable.
5. Before finishing, run the relevant available checks (lint, type-check, tests, build). Report the exact commands and actual results; never claim a test was run if it was not.
6. Summarize files changed, migrations, security implications, remaining issues, manual steps, and rollback path. Ask before destructive database operations, production deployment, DNS changes, or credential rotation.
7. Keep documentation in `docs/` and update it when architecture, setup, deployment, schemas, auth, roles or operational behavior changes.

## Security and privacy — non-negotiable
- Never put Supabase `service_role` secrets, SMTP credentials, Gemini/API tokens, n8n credentials, production database passwords, or other secrets in client code, Git, screenshots, logs, or sample files.
- `.env` and production environment files must be ignored by Git. Use `.env.example` with clearly fake placeholders only.
- The Supabase public/publishable (anon) key may be present in a browser app only when all relevant tables and Storage buckets are protected correctly with RLS/policies. Never treat a hidden button or client-side role check as authorization.
- Every privileged operation must be enforced by Supabase RLS or a trusted server-side/Edge Function endpoint. Users must not be able to grant themselves `author`, `editor`, `moderator` or `admin` through profile edits, local storage, URL parameters or browser requests.
- New accounts default to `reader`. Admin bootstrap must be deliberate and documented; no hard-coded credentials or email-only client-side admin checks.
- Public visitors may see published/indexable content and approved comments only. Drafts, scheduled/private content, subscriber data, account data and audit logs must remain private.
- Never render arbitrary commenter HTML. Validate inputs, limit payload sizes, sanitize supported rich text, and apply sensible rate limits.
- Do not reset/drop production tables to fix a migration. Use reviewed forward-only migrations, a backup and a rollback plan.
- Minimize personal data. Newsletter marketing requires clear consent, a working unsubscribe flow and exclusion of unconfirmed/unsubscribed addresses.

## Editorial/product rules
- Article lifecycle: `draft` → `in_review` → `scheduled` or `published` → `archived`, subject to role permissions and current schema.
- AI/n8n content must be created as a draft/needs-review item by default. Never automatically publish, delete, change roles, or access private subscriber records from an AI workflow.
- Keep source/reference URLs for research-led content. Do not invent facts, dates, prices, opening hours, visa rules, citations, reviews or test results.
- Do not hard-code fake articles or sample metrics to conceal broken database calls. Use clearly marked development seed data and honest loading, empty, error and unconfigured states.
- Newsletter campaigns must show truthful status and errors; never mark a campaign sent unless the real sending mechanism reports success.
- SEO sitemap and structured data must only include content that is actually published and eligible for indexing.

## Visual design direction
- Design EveryGyan as a polished editorial publication, not a generic SaaS template.
- Palette direction: white/light content canvas, dark navy/near-black header and footer, restrained vivid red accent for primary calls to action and category labels, soft neutral borders, subtle shadows, rounded content cards.
- Public home: dark header; EveryGyan wordmark/tagline; clear nav (Latest News, Reviews, Big Tech, Entertainment, Gadgets, Learning, Travel); search/login/subscribe actions; lead story with strong photography; Latest News list; topic icons; featured articles grid; newsletter band; dark footer.
- Article pages: narrow comfortable reading width, title/byline/date, accessible cover image, table of contents when useful, well-spaced headings, references, related articles and safe comments.
- Signed-in admin pages use a separate dashboard layout and show only actions permitted to the current role.
- Prioritize mobile-first responsive layouts, readable typography, image optimization, semantic HTML, keyboard support, visible focus, labels and accessible contrast. Do not copy placeholder story text from visual mockups into production.

## Cost and service limits
- Use the chosen free-tier architecture responsibly. Check current Hostinger and Supabase quotas rather than assuming unlimited use.
- Monitor Supabase database, storage and bandwidth; Free projects may pause with low activity. Keep independent backups and document restoration steps.
- Local/self-hosted n8n schedules only run while the machine/container is online. Do not assume Gemini AI Pro includes API credits for programmatic n8n requests. Verify the model, API quota and billing settings before activating.
- Do not promise high-volume email or reliable delivery until the exact mail plan/limits and sender-domain authentication are tested.

## Definition of done for every task
- The change meets stated acceptance criteria and is scoped to the requested task.
- Relevant tests/lint/type-check/build have been run where available, with actual results reported.
- No known secret has been added to Git; no unauthorized role/data access has been introduced.
- Loading, empty and failure states are honest and usable.
- Docs are updated when needed; deployment/migration risks and rollback are stated.
- Report: summary, changed files, commands/results, manual setup still needed, known limitations, and the recommended next smallest step.
