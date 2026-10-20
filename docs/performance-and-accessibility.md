# Accessibility, Responsive Design & Performance Audit

**Publication:** EveryGyan — Knowledge for Everyone, Everywhere  
**Standard Compliance:** WCAG 2.1 Level AA, Core Web Vitals (Google CrUX Targets)  
**Date of Audit:** October 2026  
**Status:** Completed & Tested

---

## 1. Executive Summary

As part of **Prompt 16**, EveryGyan underwent a full accessibility and front-end performance audit. All optimizations were performed without modifying business logic or relying on paid third-party monitoring services.

### Key Achievements:
- **Code-Splitting & Bundle Reduction**: Segregated CMS editor and admin dashboard routes via `React.lazy()` and Vite manual chunking. Main client reader bundle dropped from ~650 kB to **179 kB (44.6 kB gzip)**.
- **Above-The-Fold LCP Optimization**: Hero and article cover images now use `fetchpriority="high"` and `decoding="async"`, removing lazy loading delays from the Critical Rendering Path.
- **Accessible Touch Targets**: All interactive controls (mobile navigation toggle, search triggers, modal close icons, social links) adhere to WCAG 2.5.5 / 2.5.8 (minimum 44x44px bounding box).
- **Keyboard Navigation & Dialog Management**: Added "Skip to main content" link, `role="dialog"`, `aria-modal="true"`, document body scroll-locking, and global `Escape` key dismiss handlers on all modals.
- **Reduced Motion Support**: Introduced `motion-reduce:transform-none` and `motion-safe:` utility variants to respect user `prefers-reduced-motion` settings.

---

## 2. Responsive Breakpoint Audit

Testing and visual layout verification were conducted across 5 standard viewport tiers:

| Breakpoint Tier | Viewport Width | Tested Devices / Emulations | Layout Behavior & Verifications |
| :--- | :--- | :--- | :--- |
| **Narrow Mobile** | `320px` | iPhone SE (1st gen), small Androids | Single-column stack, font sizes scale cleanly via `sm:`, no horizontal overflow, category pills scroll horizontally without breaking layout. |
| **Standard Mobile** | `375px - 414px` | iPhone 12/13/14, Pixel 7 | Hamburger menu drawer with 44px tap targets; search bar and modal fit within viewport; newsletter banner stacks neatly. |
| **Tablet** | `768px - 834px` | iPad Air, Galaxy Tab | 2-column featured article grid, sidebar moves into natural reading flow, header displays core navigation links. |
| **Laptop** | `1024px - 1280px` | 13" MacBook, Surface Laptop | Hero story alongside Latest News sidebar (12-column grid: 8 cols hero, 4 cols news). Top navigation completely visible. |
| **Wide Desktop** | `1440px+` | 27" Desktop Monitors, 4K Displays | Container capped cleanly at `max-w-7xl` (`1280px`) with centered auto margins, preventing excessive line lengths for comfortable readability (65-75 characters per line). |

---

## 3. Accessibility Improvements (WCAG 2.1 AA)

### 3.1 Skip Navigation Link
- **Implementation**: In [`src/App.tsx`](../src/App.tsx), a skip link is rendered as the first focusable element on every page:
  ```html
  <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 ...">
    Skip to main content
  </a>
  ```
- **Landmark Target**: `<main id="main-content" tabIndex={-1}>` enables screen readers and keyboard users (Tab + Enter) to bypass repeating header nav directly to the page content.

### 3.2 Modal Focus & Keyboard Dismissal
- **Components**: [`SearchModal`](../src/components/common/SearchModal.tsx) and [`AuthModal`](../src/components/common/AuthModal.tsx).
- **Attributes**: `role="dialog"`, `aria-modal="true"`, `aria-label="..."`.
- **Keyboard Behavior**: Global event listener intercepts the `Escape` key to immediately close the open modal and restore focus.
- **Scroll Lock**: Body overflow is set to `hidden` while modals are active to prevent background document scrolling.

### 3.3 Touch Target Sizing (WCAG 2.5.5 / 2.5.8)
- Target sizes for interactive elements on touch screens must be at least 44x44px:
  - Header mobile toggle button: `min-w-[44px] min-h-[44px]`
  - Header search button: `min-w-[44px] min-h-[44px]`
  - SearchModal & AuthModal close buttons: `min-w-[44px] min-h-[44px]`
  - Footer social icon links: `min-w-[44px] min-h-[44px]`

### 3.4 Reduced-Motion Preferences
- For users with vestibular motion sensitivities (`prefers-reduced-motion: reduce`):
  - Image hover transforms disabled using `motion-reduce:transform-none`.
  - Animations guarded with `motion-safe:` (e.g. `motion-safe:animate-bounce`).

### 3.5 Form Accessibility & Validation Error Announcements
- Inputs utilize explicit `aria-label` or `<label>` associations.
- Error alerts use `role="alert"` and are connected via `aria-describedby`:
  ```html
  <input aria-describedby={errorMessage ? "newsletter-banner-error" : undefined} ... />
  <div id="newsletter-banner-error" role="alert">...</div>
  ```

---

## 4. Performance Audit & Optimization

### 4.1 Bundle Splitting & Measurements
By leveraging dynamic imports (`React.lazy()`) for internal CMS routes and manual chunk splitting in `vite.config.ts`, the bundle size was reduced dramatically:

| Chunk Name | Purpose | Size (Minified) | Gzip Size | Cache Strategy |
| :--- | :--- | :--- | :--- | :--- |
| `index-*.js` | Core Public Application Code | 179.02 kB | 44.67 kB | Hash-cached |
| `vendor-react-*.js` | React, React-DOM, React Router | 163.57 kB | 53.54 kB | Long-term immutable |
| `vendor-supabase-*.js` | Supabase JS Client & Auth | 227.13 kB | 59.02 kB | Long-term immutable |
| `index-*.css` | Compiled Tailwind CSS | 48.46 kB | 8.57 kB | Long-term immutable |
| `ArticleEditor-*.js` | CMS Rich Editor (Lazy) | 27.36 kB | 6.40 kB | Loaded on author visit |
| `DashboardNewsletter-*.js` | Campaign Manager (Lazy) | 14.42 kB | 4.06 kB | Loaded on editor visit |
| `DashboardArticles-*.js` | Article Table (Lazy) | 9.34 kB | 2.95 kB | Loaded on author visit |
| `DashboardComments-*.js` | Moderation Queue (Lazy) | 9.13 kB | 2.79 kB | Loaded on mod visit |
| `DashboardSubscribers-*.js`| Subscriber Table (Lazy) | 8.63 kB | 2.59 kB | Loaded on admin visit |
| `DashboardSettings-*.js` | Profile & Settings (Lazy) | 6.28 kB | 1.82 kB | Loaded on user visit |
| `DashboardHome-*.js` | Analytics Overview (Lazy) | 4.33 kB | 1.50 kB | Loaded on author visit |

> **Total initial public client payload:** ~106 kB gzipped JS + 8.5 kB gzipped CSS. Public readers download zero lines of administrative dashboard code.

### 4.2 Critical Rendering Path & Core Web Vitals Strategy

1. **Largest Contentful Paint (LCP)**:
   - *Problem*: Applying `loading="lazy"` to hero or article lead images delays browser image discovery until layout calculation is complete, causing severe LCP degradation.
   - *Optimization*: Above-the-fold images (`HeroLeadStory` and `ArticlePage`) explicitly omit `loading="lazy"` and specify `fetchpriority="high"` and `decoding="async"`.
2. **Cumulative Layout Shift (CLS)**:
   - Image containers specify explicit CSS aspect ratios (`aspect-[16/10]`, `aspect-[16/11]`, `aspect-[16/9]`) and skeleton loaders (`HeroSkeleton`, `CardSkeleton`) to reserve layout geometry before media loads.
3. **Interaction to Next Paint (INP) / First Input Delay (FID)**:
   - Main thread is free of expensive blocking scripts; route transitions wrapped cleanly with React Suspense.

---

## 5. Performance Budget

Based on measured production builds, EveryGyan enforces the following budgets:

| Metric | Budget Target | Current Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **Initial Client JS (Gzip)** | < 125 kB | ~106 kB (index + vendor-react) | Passed |
| **Initial CSS (Gzip)** | < 15 kB | 8.57 kB | Passed |
| **Largest CMS Chunk (Gzip)** | < 15 kB | 6.40 kB (`ArticleEditor`) | Passed |
| **Above-The-Fold Lazy Images** | 0 images | 0 images (High priority used) | Passed |
| **Touch Target Size** | >= 44x44px | >= 44x44px for all mobile targets | Passed |
| **Automated A11y & Perf Tests** | 100% pass | 13/13 passing in test suite | Passed |

---

## 6. Local Lighthouse vs. Real User Data (RUM)

When evaluating EveryGyan's performance, the team distinguishes between synthetic local benchmarks and production real-user metrics:

- **Local Simulated Benchmarks (Lighthouse / DevTools)**:
  - Synthetic simulation using 4x CPU slowdown and 3G/4G network throttling.
  - Useful for catching regressions in bundle size, missing alt attributes, or unoptimized fonts during development.
  - Scores fluctuate depending on machine CPU temperature and background processes.
- **Production Real User Monitoring (CrUX / RUM)**:
  - Measures 75th percentile (P75) experiences of real visitors across diverse physical devices, 4G/5G/Wi-Fi connections, and geographic locations.
  - True assessment of Core Web Vitals for Google Search rankings.
  - Requires live traffic data accumulated over a rolling 28-day window on the production domain.

---

## 7. Automated Test Coverage

The accessibility and performance test suite is located in [`src/test/accessibility.test.tsx`](../src/test/accessibility.test.tsx). Run anytime with:
```bash
npm test -- --run src/test/accessibility.test.tsx
```

The suite automatically asserts:
1. "Skip to main content" link and target `#main-content`.
2. `SearchModal` and `AuthModal` dialog roles, aria labels, and `Escape` dismiss handlers.
3. Minimum 44px touch targets on mobile header toggles, modal close buttons, and footer social links.
4. Hero lead image has `fetchpriority="high"` and is NOT lazy loaded.
5. Below-the-fold cards have `loading="lazy"` and `decoding="async"`.
6. Form inputs connect with error alerts via `aria-describedby` and `role="alert"`.
7. Motion-reduce CSS classes are in place for animation comfort.
