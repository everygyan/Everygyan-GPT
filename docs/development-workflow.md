# EveryGyan Development Workflow & Git Hygiene

This document defines the solo development workflow, version control conventions, secret safety practices, and rollback procedures for the EveryGyan web platform.

---

## 1. Branching Strategy & Solo Workflow

A simple, robust, trunk-based workflow is adopted to keep development fast while ensuring production safety:

```text
main (Always production-ready, deployable to Hostinger)
  │
  ├──► feature/ui-shell ──► (Verify, Test, Build) ──► Merge to main
  │
  ├──► feature/supabase-auth ──► (Verify, Test, Build) ──► Merge to main
  │
  └──► tag: checkpoint-phase-X (Tagged rollback point before major milestones)
```

### Core Rules
1. **`main` is always deployable:** Code on `main` must pass type-check, lint, test, and build at all times.
2. **Short-lived feature branches:** For distinct tasks or prompts, work on a dedicated branch:
   ```bash
   git checkout -b feature/<descriptive-name>
   ```
3. **Small, descriptive commits:** Commit bounded, logical changes with descriptive messages:
   ```bash
   git commit -m "feat(auth): add login modal and session hook"
   ```
4. **Tagged rollback points:** Before executing any significant database migration or major architectural update, create an annotated Git tag:
   ```bash
   git tag -a checkpoint-<milestone> -m "Stable state before milestone X"
   git push origin checkpoint-<milestone>
   ```

---

## 2. Secrets Management & Environment Hygiene

Security is non-negotiable. Compromised credentials can expose reader data, admin accounts, or database infrastructure.

### Rules for Environment Variables
1. **Never commit `.env`:** Local `.env` files are excluded by `.gitignore`. Verify `.gitignore` before every commit.
2. **Use `.env.example` for documentation:** Only non-sensitive variable names and safe placeholder values are permitted in `.env.example`.
3. **Distinguish Client vs Server Secrets:**
   * **Client-Safe (Vite):** Variables prefixed with `VITE_` (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are baked into public browser bundles. They must only have access to resources protected by Row Level Security (RLS).
   * **Privileged Secrets:** Supabase `service_role` keys, database passwords, and SMTP secrets must **NEVER** be placed in Vite environment files, client code, or repository files.
4. **Pre-commit Secret Check:** Run a scan before staging files to ensure no keys or tokens were accidentally saved.

---

## 3. Verification & Definition of Done

Before merging any branch into `main` or tagging a release, run the standard verification suite:

```powershell
# Type verification
npm.cmd run typecheck

# Code quality & style
npm.cmd run lint

# Automated unit & integration tests
npm.cmd test

# Production compilation
npm.cmd run build
```

*Never bypass failed checks.* If a test fails, triage and resolve the root cause before committing.

---

## 4. Safe Rollback Procedures

If an issue or bug is identified in development or production, use safe forward recovery or explicit rollback:

### A. Local Rollback (Uncommitted Changes)
Discard uncommitted modifications in working directory safely:
```bash
git restore .
git clean -fd
```

### B. Commit Reversion (Preserving History)
Never force-push (`git push --force`) or rewrite public commit history. Use `git revert` to create a new forward commit that undoes unwanted changes:
```bash
# Revert a specific commit safely
git revert <commit-hash>
```

### C. Restoring from a Tagged Checkpoint
To inspect or restore the project state from a previous milestone tag:
```bash
git checkout checkpoint-<milestone>
```

---

## 5. Remote Repository Synchronisation

* **Remote Origin:** `https://github.com/everygyan/Everygyan-GPT`
* **Default Branch:** `main`

To push updates:
```bash
git push -u origin main
```
