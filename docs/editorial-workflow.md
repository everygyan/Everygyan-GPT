# EveryGyan — Editorial Workflow & Publishing Guide

**Publication:** EveryGyan — Knowledge for Everyone, Everywhere  
**Target Audience:** Editors, Authors, Moderators, and Content Curators  
**Document Purpose:** Standard operating procedure for content authoring, travel and tutorial template structuring, draft review, comments moderation, newsletter issuance, and AI draft oversight.

---

## Table of Contents
1. [Editorial Roles & Access Matrix](#1-editorial-roles--access-matrix)
2. [Article Lifecycle & Status Progression](#2-article-lifecycle--status-progression)
3. [Content Templates & Authoring Standards](#3-content-templates--authoring-standards)
4. [Draft Review & Fact-Checking Protocol](#4-draft-review--fact-checking-protocol)
5. [Reviewing n8n AI-Generated Drafts](#5-reviewing-n8n-ai-generated-drafts)
6. [Comments Moderation & Spam Handling](#6-comments-moderation--spam-handling)
7. [Newsletter Issue Authoring & Campaign Dispatch](#7-newsletter-issue-authoring--campaign-dispatch)

---

## 1. Editorial Roles & Access Matrix

EveryGyan enforces role-based access control via Supabase Row-Level Security (RLS) and client routing guards:

| Role | Reading | Comments | Article Drafts | Article Publishing | Comment Moderation | Newsletter Broadcast | Role Administration |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Reader** | Published only | Post pending | No | No | No | Subscribe/Unsub | No |
| **Author** | Published only | Post pending | Create/Edit own | Submit for review | No | No | No |
| **Moderator** | Published only | Post pending | No | No | Approve/Reject/Spam | No | No |
| **Editor** | Published & Drafts | Post approved | Create/Edit all | Publish & Schedule | Approve/Reject/Spam | Draft & Test-Send | No |
| **Admin** | Published & Drafts | Post approved | Create/Edit all | Publish & Schedule | Approve/Reject/Spam | Full Dispatch & Export | Manage user roles |

---

## 2. Article Lifecycle & Status Progression

Every piece of content moves through a strict 5-stage lifecycle. Articles never publish automatically:

```text
       [Author creates]
              │
              ▼
          ┌───────┐
          │ draft │ ◄────── (Initial creation; n8n ingest strictly lands here)
          └───┬───┘
              │ [Author submits for editorial review]
              ▼
        ┌───────────┐
        │ in_review │ ◄──── (Locked for editor review; author cannot publish)
        └───┬───┬───┘
            │   │ [Editor approves & schedules]
            │   └───────────────► ┌───────────┐
            │                     │ scheduled │ ◄── (Auto-visible once published_at <= now())
            │                     └─────┬─────┘
            │ [Editor publishes]        │
            ▼                           ▼
        ┌───────────┐
        │ published │ ◄─────────────────┘ (Publicly indexable, included in sitemap.xml)
        └───┬───────┘
            │ [Editor de-lists or retires]
            ▼
        ┌──────────┐
        │ archived │ (Hidden from public view and search engine indexes)
        └──────────┘
```

### Invariants:
1. **Anonymous Isolation:** Anonymous visitors and readers can **never** see articles in `draft`, `in_review`, or `archived` states.
2. **Draft Deletion:** Authors may only delete their own articles while in `draft` status. Once submitted to `in_review` or `published`, only an `admin` may delete.

---

## 3. Content Templates & Authoring Standards

### 3.0 Publication Taxonomy & Category Hierarchy

EveryGyan organizes all editorial content across 4 core departments plus Deals & About Us:

1. **Travel (`/category/travel`):**
   - **World Travel** (`travel-world`): Round-the-world itineraries, multi-continent expeditions.
   - **Asia Travel** (`travel-asia`): Temples, tropical beaches, culinary journeys, Shinkansen guides.
   - **Europe Travel** (`travel-europe`): Historic capitals, alpine rail, family-friendly European guides.
   - **Americas Travel** (`travel-americas`): National parks, Pacific Coast Highway, Patagonia.
   - **Health & Wellness** (`health`): Evidence-based wellness, circadian sleep rhythms, longevity.
2. **News (`/category/news`):**
   - **Latest News** (`latest-news`): Breaking reports, \$2T clean energy milestones, battery breakthroughs.
   - **World News** (`news-world`): Geopolitics, climate accords, international shipping corridors.
   - **Asia News** (`news-asia`): High-speed rail integration, T20 cricket analytics, regional growth.
   - **Europe News** (`news-europe`): EU AI Act enforcement, cross-border sleeper train revival.
   - **Americas News** (`news-americas`): NASA Artemis lunar missions, decentralized solar microgrids.
3. **Learn (`/category/learn`):**
   - **AI & Modern Tech** (`learn-ai`): Multimodal foundation models, autonomous agents, tool calling.
   - **SAP Tutorials** (`learn-sap`): SAP S/4HANA, ABAP RAP, CDS views, BTP Event Mesh.
   - **German Language** (`learn-german`): Der/Die/Das memory rules, workplace German etiquette.
   - **Learning Updates** (`learn-updates`): Top cloud certifications (AWS/GCP/Azure), React 19 roadmap.
4. **Entertainment (`/category/entertainment`):**
   - **Movies** (`entertainment-movies`): Cinema critiques, 70mm & IMAX, sci-fi masterpieces.
   - **Web Series & TV** (`entertainment-series`): Prestige limited series, international crime thrillers.
   - **Celebrity News** (`entertainment-celeb-news`): Cannes Film Festival, actor method transformations.
   - **Photos & Visuals** (`entertainment-photos`): Wildlife photography awards, ancient monuments.
5. **Deals & Gear (`/deals` & `/category/deals`):**
   - Tested student laptops, noise-canceling headphones, universal GaN chargers, and tech courses.

### 3.1 Standard Editorial Article
Used for Technology, Health, Geopolitics, and Sports reporting.
- **Required Fields:** Title (5–120 characters), Excerpt (100–250 characters), Cover Image URL, Category, Tags (at least 1), Content body.
- **Tone:** Objective, informative, clear, engaging. Avoid hyperbolic clickbait headlines.
- **Read Time:** Automatically calculated or editor-adjusted (typically 4–8 minutes).

---

### 3.2 Travel Guide Template (`template_type: 'travel'`)
Used for family-friendly, well-researched travel recommendations.

#### Field Specifications:
- **Destination:** Clear geographic region or city name (e.g. `Central Europe: Austria & Switzerland`).
- **Best Time to Visit:**
  - `season`: Recommended travel window (e.g. `May to September & December`).
  - `note`: Seasonal specifics (e.g. alpine hiking vs. holiday markets).
  - `verified_date`: Fact-check date stamp (e.g. `October 2026`).
- **Transport:**
  - `arrival`: Primary airport/train hubs.
  - `local_transit`: Public transit passes (e.g. Eurail, SBB, regional cards).
  - `tip`: Insider logistics advice (e.g. booking mountain trains in advance).
- **Budget Ranges:**
  - `currency`: Local currencies (e.g. `EUR / CHF`).
  - `daily_budget`: Realistic estimated spend per family or per person (e.g. `€85 - €160 / day`).
  - `verified_date`: Price verification date stamp.
- **Family & Accessibility:**
  - `family_friendly`: Boolean toggle.
  - `accessibility_notes`: Step-free access, stroller suitability, elevator availability.
- **Structured Daily Itinerary:** Numbered day-by-day suggested activities with clear highlights.
- **Official Links & Maps:** Links strictly to official tourism boards or rail operators.
- **Safety Caveats:** Altitude precautions, weather considerations, emergency contacts.

> [!IMPORTANT]
> **Factual Integrity Rule:** Never invent prices, visa requirements, or operating hours. If exact pricing is volatile, provide estimated ranges and always include a `verified_date` stamp. Any section with empty fields automatically disappears on the front end.

---

### 3.3 Learning / SAP Tutorial Template (`template_type: 'tutorial'`)
Used for enterprise technology, software engineering, and SAP workflow guides.

#### Field Specifications:
- **Course Metadata:**
  - `difficulty_level`: `Beginner`, `Intermediate`, or `Advanced`.
  - `version_applicability`: Supported release versions (e.g. `SAP S/4HANA 2023+`, `Node.js 20+`).
- **Prerequisites:** Bulleted list of system authorizations, required modules, or background concepts.
- **Learning Objectives:** Clear bullet points detailing what the student will achieve upon completion.
- **Numbered Step-by-Step Instructions:**
  - Step title, detailed narrative instructions, optional code/ABAP snippet, and an expert tip box.
- **Troubleshooting Matrix:**
  - Problem scenario / error code (e.g. `RFC_COMMUNICATION_FAILURE`).
  - Actionable resolution.
- **Related Lessons:** Clickable links to follow-up tutorials in the learning track.

---

## 4. Draft Review & Fact-Checking Protocol

Before an Editor promotes an article from `in_review` to `published`, complete this 6-point checklist:

```text
[ ] 1. Headline & Excerpt
       - Headline is accurate, informative, and grammatically sound.
       - Excerpt accurately summarizes the core premise in 140–160 characters.

[ ] 2. Sourcing & References
       - Every factual assertion, statistical figure, or quote has an authoritative citation.
       - Source links in the 'References' section are live, secure (HTTPS), and non-spam.

[ ] 3. Media & Accessibility
       - Cover image is high-resolution (min 1200x675px) and properly credited.
       - Image alt text describes the image contextually for screen readers.

[ ] 4. Visual Structure
       - Headings follow logical order (H2 for main sections, H3 for sub-sections).
       - Paragraphs are concise (3–4 sentences maximum) for mobile readability.

[ ] 5. Template Verification
       - For travel articles: Budget and seasonal tips include a verified date stamp.
       - For tutorials: Version applicability is stated; code snippets are syntactically valid.

[ ] 6. Category & Canonical Slug
       - URL slug is clean, lowercased, and hyphen-separated (e.g. /article/clean-core-sap-guide).
       - Assigned to one primary topic category.
```

---

## 5. Reviewing n8n AI-Generated Drafts

EveryGyan supports an automated drafting integration with n8n. Automated workflows **never** publish directly.

### 5.1 Ingestion Identification
- AI-generated articles land strictly with `status = 'draft'` and are tagged with `actor = 'n8n_integration'` in the database.
- Drafts appear in the CMS article table at `/dashboard/articles` with a "Draft" badge.

### 5.2 Mandatory Editor Actions on n8n Drafts
1. **Verify Source URLs:** Open the draft in the CMS Editor. Verify that all URLs listed in `references` or `source_urls` exist, are reputable, and support the content claims.
2. **Fact-Checking & Tone Pass:** Strip out hallucinated dates, unverified product prices, or overly generic AI filler language. Ensure tone aligns with EveryGyan editorial standards.
3. **Format Code & Quotes:** Ensure code blocks, tables, and lists render cleanly.
4. **Attach Cover Media:** If the AI draft did not provide a verified Unsplash cover image, upload a high-quality, properly attributed cover.
5. **Manual Promotion:** Change status to `in_review` or click **Publish**.

---

## 6. Comments Moderation & Spam Handling

Reader engagement is welcome, but comments must pass editorial review to maintain high community trust.

### 6.1 Comment Lifecycle
- All new comments submitted by unverified readers enter `status = 'pending'`.
- Comments do **not** appear publicly until approved by an editor or moderator.

### 6.2 Moderation Queue (`/dashboard/comments`)
1. Log in with a `moderator`, `editor`, or `admin` account.
2. Navigate to **Comments** in the dashboard sidebar.
3. Filter by **Pending**.
4. Actions:
   - **Approve:** Publishes the comment beneath the article immediately.
   - **Reject:** Removes comment from public visibility while keeping record.
   - **Mark Spam:** Rejects comment and flags author email/IP for rate limiting.

### 6.3 Automated Spam Heuristics (Pre-Filtering)
The system automatically flags or blocks comments that:
- Contain more than 2 hyperlinks.
- Contain blacklisted spam keywords (pharmaceutical, gambling, SEO link schemes).
- Exceed 1,000 characters or are submitted more than once per 30 seconds.
- Attempt script injection (all HTML tags are escaped and rendered as plain text).

---

## 7. Newsletter Issue Authoring & Campaign Dispatch

EveryGyan publishes a weekly editorial digest. All marketing emails require verified double opt-in consent.

### 7.1 Authoring a Weekly Campaign (`/dashboard/newsletter`)
1. Navigate to **Newsletter** &rarr; click **Create Campaign**.
2. **Campaign Subject:** Clear, compelling subject line (e.g. *EveryGyan Weekly: Clean Core SAP & European Family Escapes*).
3. **Preheader:** Short teaser visible in email clients (max 90 characters).
4. **Issue Content:** Markdown formatted digest featuring 3–4 highlights from the week's published articles.
5. Click **Save Draft**.

### 7.2 Mandatory Test-Send Step
Before scheduling or sending a campaign to the live audience:
1. In the campaign editor, locate the **Test Send** panel.
2. Enter an editor's verified email address (e.g. `editor@everygyan.com`).
3. Click **Send Test Email**.
4. Open the test email in desktop and mobile inboxes:
   - Verify layout, headings, and font sizes.
   - Click every article link to ensure URLs point to live `https://everygyan.com` pages.
   - Verify that the footer includes an unsubscribe link placeholder.

### 7.3 Audience Dispatch & Hostinger Send Limits
1. When ready, click **Send Broadcast**.
2. The campaign engine processes recipients in conservative batches of **25 subscribers**:
   - Only subscribers with `status = 'confirmed'` receive the broadcast.
   - Subscribers in `pending_confirmation` or `unsubscribed` are **strictly excluded**.
3. **Hostinger Limits:** Hostinger Business mail accounts enforce an hourly threshold (typically 200–500 emails/hour). If your audience exceeds 200 subscribers, space campaign batches across multiple hours.
4. The campaign status will update from `draft` &rarr; `sending` &rarr; `sent` (or `partial_failure` if transport errors occur).

---

*This guide is maintained as part of the EveryGyan operational suite.*
