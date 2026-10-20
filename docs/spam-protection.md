# EveryGyan Anti-Spam Architecture & Moderation Controls

## Overview
EveryGyan implements a zero-cost, privacy-first, built-in anti-spam and moderation pipeline. This avoids reliance on paid third-party verification CAPTCHAs (such as reCAPTCHA Enterprise or hCaptcha Pro) while protecting readers and editors against automated comment abuse and script injections.

---

## 1. Multi-Layered Protection Mechanisms

### A. Invisible Honeypot Trap
- An input element (`name="hp_website"`) is included in the comment submission form.
- The input is hidden from human readers using CSS `display: none`, `tabIndex={-1}`, and `aria-hidden="true"`.
- Automated scrapers and bot scripts automatically fill every discovered form field.
- When `submitComment` detects a non-empty honeypot field, the submission is instantly categorized as `'spam'` and barred from review queues.

### B. Submission Velocity Check
- Human readers require several seconds to read an article, focus on the comment form, and type a coherent reaction.
- When the form mounts, a client timestamp (`formRenderedAt`) is initialized.
- Submissions occurring in under **2.5 seconds** from form rendering are flagged as automated bot scripts and routed to the `'spam'` queue.

### C. Client & Session Rate Limiting
- A cooldown threshold (20 seconds between consecutive comments) is enforced per browser session.
- Prevents rapid double-clicking and sequential script spamming.

### D. Keyword & Link Heuristics
- Submissions are evaluated against common spam signatures (e.g. `viagra`, `casino`, `crypto airdrop`, `buy followers`, high-volume suspicious URLs).
- Comments containing more than two URLs are automatically routed to the `'spam'` status.

### E. Database-Enforced Row Level Security (RLS)
- Regardless of frontend state or direct API requests, all submissions are forced to `status = 'pending'` or `'spam'` on insert.
- PostgreSQL RLS policy `"Public can view approved comments"` strictly restricts public SELECT queries to `status = 'approved'`.
- Only users with verified roles (`moderator`, `editor`, `admin`) can alter comment statuses or access the moderation queue.

---

## 2. Limitations of the Zero-Cost Architecture

While the built-in system stops the vast majority of naive automated scrapers and bots, editors should be aware of known limitations:

1. **Targeted Human Spammers**: Human spammers manually typing promotional text will bypass honeypot velocity checks. They remain caught by the manual moderation queue (`status = 'pending'`), ensuring they never appear publicly until an editor approves them.
2. **Headless Browser Bots with Sleep**: Advanced bots using headless Chromium and artificial delays can circumvent the 2.5-second velocity filter.
3. **Session-Level Rate Limiting**: The client-side rate limit operates per browser tab/session; distributed botnets using distinct IPs can only be throttled further by server-side Edge Functions or Cloudflare WAF rules at the domain level.

---

## 3. Moderation Lifecycle

```
[Reader / Guest] ──> Submits Comment ──> [Honeypot & Velocity Check]
                                                     │
                             ┌───────────────────────┴───────────────────────┐
                             ▼                                               ▼
                      [Clean Text]                                    [Bot / Spam Trigger]
                             │                                               │
                             ▼                                               ▼
                    Status: "pending"                                Status: "spam"
                             │                                               │
                             └───────────────────────┬───────────────────────┘
                                                     ▼
                                        [Moderator Queue in Dashboard]
                                                     │
                                   ┌─────────────────┼─────────────────┐
                                   ▼                 ▼                 ▼
                              [Approve]          [Reject]          [Delete]
                                   │                 │                 │
                                   ▼                 ▼                 ▼
                              Status:           Status:           Permanently
                             "approved"        "rejected"          Removed
                           (Public Live)     (Hidden Forever)
```
