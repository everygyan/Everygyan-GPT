# Google Search Console Verification & Sitemap Submission Guide

This operational guide provides the exact steps required to verify site ownership of **EveryGyan** (`https://everygyan.com`) in Google Search Console (GSC) and submit the sitemap.

> [!IMPORTANT]
> **Verification Status**: Search Console verification has **not** been performed automatically. Google requires active ownership verification via DNS records on Hostinger or verification tags. The site administrator must follow the steps below to complete domain verification.

---

## 1. Choose Property Type in Google Search Console

1. Navigate to [Google Search Console](https://search.google.com/search-console/).
2. Log in with the official EveryGyan Google account.
3. In the property selector dropdown, click **Add property**.
4. You will see two options:
   - **Domain Property (Recommended)**: Covers all subdomains (`everygyan.com`, `www.everygyan.com`, `m.everygyan.com`) across `http` and `https`.
   - **URL Prefix Property**: Covers only exact prefix `https://everygyan.com`.

Select **Domain** and enter:
```
everygyan.com
```

---

## 2. Verification Method 1: DNS TXT Record via Hostinger (Recommended)

1. GSC will present a TXT record resembling:
   ```
   google-site-verification=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
2. Log in to your **Hostinger Control Panel (hPanel)**:
   - Navigate to **Domains** → select `everygyan.com`.
   - In the left sidebar, click **DNS / Nameservers**.
   - Under **Manage DNS records**, fill out the form:
     - **Type**: `TXT`
     - **Name**: `@` (or leave blank if hPanel defaults to root)
     - **TXT value**: Paste the exact string from Google (e.g. `google-site-verification=...`)
     - **TTL**: `3600` (or 14400)
   - Click **Add Record**.
3. Allow 5–15 minutes for DNS propagation.
4. Return to Google Search Console and click **Verify**.

---

## 3. Verification Method 2: HTML Tag (Fallback for URL-prefix)

If using URL-prefix (`https://everygyan.com`):
1. Copy the meta tag provided by GSC:
   ```html
   <meta name="google-site-verification" content="YOUR_UNIQUE_CODE" />
   ```
2. Add this meta tag into `index.html` inside the `<head>` block before building.
3. Deploy to Hostinger.
4. Return to Search Console and click **Verify**.

---

## 4. Submitting the XML Sitemap

Once verified in Google Search Console:
1. In the left navigation menu, click **Sitemaps** (under *Indexing*).
2. Under **Add a new sitemap**, enter the path:
   ```
   sitemap.xml
   ```
   (Full URL: `https://everygyan.com/sitemap.xml`)
3. Click **Submit**.
4. Verification checklist:
   - Status should change to **Success** within a few hours.
   - Discovered pages count should match the number of indexable URLs in the sitemap (articles, categories, tags, static pages).

---

## 5. Technical SEO Checklist & Inspection

- **URL Inspection Tool**: Test canonical URLs (e.g. `https://everygyan.com/article/10-amazing-places-to-visit-in-europe-with-family`).
  - Verify that the declared canonical URL matches Google's selected canonical URL.
  - Verify that Schema.org rich results test (`NewsArticle`, `BreadcrumbList`) passes without errors.
- **Robots.txt Tester**: Ensure Googlebot is permitted to crawl `/article/`, `/category/`, `/tag/` while strictly barred from crawling `/dashboard/`, `/search`, `/reset-password`, and `/unsubscribe`.
- **Core Web Vitals & Mobile Usability**: The responsive layout and compressed images ensure fast first contentful paint (FCP) and low layout shift (CLS).
