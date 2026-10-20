# EveryGyan Email Delivery & Newsletter Transport Guide

## 1. Hostinger Email Limits & Compliance

EveryGyan's production domain is hosted on **Hostinger Business**. The exact sending constraints and parameters for Hostinger standard mailboxes are:

| Parameter | Hostinger Limit | EveryGyan Application Design |
| :--- | :--- | :--- |
| **Daily Send Limit** | 500 – 1,000 emails / day per mailbox | Max 1 weekly broadcast per week; queue limits daily dispatch |
| **Hourly Send Limit** | ~100 – 200 emails / hour | **Batch size of 25 emails** with throttled dispatch delays |
| **Single Email Size** | 25 MB max (including attachments) | Pure responsive HTML/text emails (~30 KB), zero heavy attachments |
| **Simultaneous Connections** | Max 10 concurrent SMTP connections | Sequential single-connection batches; no parallel flood workers |

> [!CAUTION]
> **Never treat standard host SMTP as an unlimited bulk mailing service.**
> Exceeding Hostinger's hourly limits will trigger automatic mailbox suspension or temporary IP blacklisting. As the subscriber base grows past 500 active confirmed members, a dedicated transactional relay (e.g., Amazon SES or Brevo Free Tier) should be reviewed and approved by the owner.

---

## 2. DNS Authentication Operational Checklist (SPF / DKIM / DMARC)

Proper email deliverability requires verified DNS records configured at your domain registrar / Hostinger DNS Zone. 

> [!NOTE]
> Do NOT assume DNS authentication is active until verified via an external mail-tester or `dig` lookup.

### Step 1: SPF (Sender Policy Framework)
Verifies that Hostinger's mail servers are authorized to send email on behalf of `@everygyan.com`.
- **Type**: `TXT`
- **Host / Name**: `@` (or `everygyan.com`)
- **TTL**: `3600`
- **Value**:
  ```text
  v=spf1 include:_spf.hostinger.com ~all
  ```

### Step 2: DKIM (DomainKeys Identified Mail)
Cryptographically signs outbound headers with a private key, verified against your public DNS key.
- **Type**: `TXT` or `CNAME` (assigned in Hostinger Control Panel under *Emails -> Email Settings -> DKIM*)
- **Host / Name**: Hostinger selector (e.g., `hostingermail._domainkey`)
- **Value**: Public DKIM key provided by Hostinger

### Step 3: DMARC (Domain-based Message Authentication, Reporting & Conformance)
Specifies policy for messages that fail SPF or DKIM alignment.
- **Type**: `TXT`
- **Host / Name**: `_dmarc`
- **TTL**: `3600`
- **Recommended initial policy (Monitoring / Quarantine)**:
  ```text
  v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@everygyan.com; fo=1
  ```

---

## 3. Subscription Lifecycle & Double Opt-in

```
[Reader Enters Email] ──> Validated (RFC 5322)
                               │
                               ▼
               Status: 'pending_confirmation'
               Generates confirmation_token & unsubscribe_token
               Records consent_source ('homepage_banner') & timestamp
                               │
                               ▼
               Dispatches Double Opt-In Email
               Link: /newsletter/confirm?token=...
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    [Reader Clicks Confirm]          [Link Unclicked / Ignored]
               │                               │
               ▼                               ▼
      Status: 'confirmed'              Status: 'pending_confirmation'
      confirmed_at: now()              Strictly EXCLUDED from
      ELIGIBLE for Broadcasts          all newsletter sends
```

---

## 4. Test Plan & Failure Scenarios

| Test Case | Scenario | Expected Outcome |
| :--- | :--- | :--- |
| **Double Opt-in** | Visitor signs up on homepage | Created as `pending_confirmation`; confirmation link dispatched; not sent marketing emails until confirmed. |
| **Duplicate Signup** | Already confirmed user signs up again | Idempotent; returns polite *"You are already subscribed"* message; no duplicate records created. |
| **Unconfirmed Resend** | User in `pending_confirmation` signs up again | Refreshes and re-sends confirmation email without creating a duplicate record. |
| **Unsubscribe Flow** | User clicks 1-click unsubscribe or visits `/unsubscribe` | Status updated to `unsubscribed` without requiring login; immediately excluded from all future campaigns. |
| **Test Send** | Editor sends test issue from Dashboard | Dispatched strictly to the specified test address; not sent to the wider subscriber audience. |
| **Partial Batch Failure** | Network timeout occurs after 10 of 25 emails | Log entries reflect 10 `sent` and 15 `failed`; campaign status marked as `sending` or `failed` (never marked `sent`). |
| **Retry Idempotency** | Campaign batch is retried | Existing logs with status `sent` are skipped; only previously failed recipients are re-attempted. |
