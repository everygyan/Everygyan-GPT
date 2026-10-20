# Content Templates Architecture & Editorial Guide

This document describes the template subsystem for **Travel Guides** and **Learning / SAP Tutorials** on EveryGyan.

---

## 1. Schema-Driven vs. Presentation-Only Breakdown

To keep the content architecture maintainable, authoritative, and clean without fragmenting into multiple database tables or auxiliary microservices, templates use a unified extension of the core `articles` model:

### A. Schema-Driven (Database Layer)
- **`template_type` (`text NOT NULL DEFAULT 'standard'`)**:
  - Enforced in Supabase via PostgreSQL check constraint: `CHECK (template_type IN ('standard', 'travel', 'tutorial'))`.
  - Determines which template renderer is invoked on the reader front end and CMS editor.
  - Indexed via `idx_articles_template_type` for high-performance query filtering.
- **`template_data` (`jsonb NOT NULL DEFAULT '{}'::jsonb`)**:
  - Persists all structured fields directly in PostgreSQL.
  - Guarantees backward compatibility: existing articles default to `'standard'` with empty `{}` JSONB without breaking existing schema or queries.
  - Fully protected by existing Supabase Row Level Security (RLS) policies on `public.articles` (only authorized authors can edit their own drafts; only editors/admins can publish).

### B. Presentation-Only (Front End / UI Layer)
- **Visual hierarchy & components**:
  - [`TravelGuideTemplate.tsx`](../src/components/article/TravelGuideTemplate.tsx): "At a Glance" destination briefing card, itinerary timeline with nodes, official portal links, safety alerts.
  - [`TutorialTemplate.tsx`](../src/components/article/TutorialTemplate.tsx): Version and difficulty badges, prerequisite checklist, learning targets, numbered implementation cards, dark code snippet blocks with one-click copy, and troubleshooting pairs.
- **Strict Disappearance of Empty Sections**:
  - If an editor does not supply optional attributes (e.g. no itinerary, no transit tips, or no code snippet), the corresponding UI block is completely removed from the DOM.
  - No empty boxes, placeholder dashes, or awkward spacing are rendered.

---

## 2. Travel Guide Template Specification

### Structured Fields
| Field | Type | Description & Policy |
| :--- | :--- | :--- |
| `destination` | `string` | Location name (e.g. *Central Europe: Austria & Switzerland*). |
| `best_time_to_visit` | `object` | `{ season, note, verified_date }`. Must include a date stamp when seasonal conditions or facts can change. |
| `transport` | `object` | `{ arrival, local_transit, tip }`. Real transit hubs, rail passes (e.g. Eurail/SBB). |
| `budget_ranges` | `object` | `{ currency, daily_budget, verified_date, notes }`. Real estimated ranges. **Never invent live hotel or flight prices.** |
| `family_accessibility` | `object` | `{ family_friendly, accessibility_notes }`. Step-free access, child stroller accommodations. |
| `itinerary` | `array` | `[{ day, title, activities: [] }]`. Chronological day-by-day suggested plan. |
| `maps_links` | `array` | `[{ title, url }]`. Verified official tourism boards and transport maps. |
| `safety_caveats` | `string` | Passport validity notices, Schengen rules, and health insurance recommendations. |

---

## 3. Learning & SAP Tutorial Template Specification

### Structured Fields
| Field | Type | Description & Policy |
| :--- | :--- | :--- |
| `version_applicability` | `string` | Specific enterprise releases (e.g. *SAP S/4HANA 2023, ABAP RAP*). |
| `difficulty_level` | `enum` | `'Beginner'`, `'Intermediate'`, or `'Advanced'`. |
| `prerequisites` | `string[]` | Specific developer authorizations, IDE tools, or background knowledge. |
| `learning_objectives` | `string[]` | Measurable skills gained upon completion. |
| `steps` | `array` | `[{ step_number, title, instructions, code_snippet, tip }]`. |
| `troubleshooting` | `array` | `[{ issue, resolution }]`. Common runtime errors, transport gotchas, or authorization failures. |
| `related_lessons` | `array` | `[{ title, url_or_slug }]`. Inter-article study paths. |

---

## 4. Editorial Integrity Rules
1. **No Invented Pricing**: Only publish editor-verified ranges stamped with the month/year checked.
2. **No Fabricated Visa Rules**: Direct readers to official embassies and government portals via the caveats section.
3. **Draft Safety**: Templates cannot bypass author/editor role boundaries.
