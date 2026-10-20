# EveryGyan project-folder setup checklist

1. Create/open the local project folder that contains the existing EveryGyan repository; do not create a second app from scratch.
2. Put `GEMINI.md` in the repository root. Antigravity discovers `GEMINI.md`/`AGENTS.md` workspace rules automatically; this file has no YAML frontmatter.
3. Place the updated promptbook at `docs/EveryGyan_Antigravity_Promptbook.md` (or keep it at the root until `docs/` exists).
4. Open the repository in Antigravity and start with Prompt 1 (read-only audit). Do not ask it to implement before the audit is reviewed.
5. Ensure GitHub is connected and inspect `git status`; commit/stash existing changes deliberately, never discard them.
6. Verify `.env` is ignored and `.env.example` contains placeholders only. Never paste Supabase service-role keys or other secrets into prompts.
7. Confirm the production host is Hostinger Business, the public brand is EveryGyan, and Supabase Free remains the sole authoritative data backend.
8. Follow one prompt per small task/branch. Review diffs, run tests, commit and smoke-test each phase before proceeding.
9. Keep production deployment, DNS changes, schema-destructive changes and secret rotation as explicit owner-approved actions.
