-- ==============================================================================
-- Migration: 20261030000000_about_page_and_editorial_team.sql
-- Description: Dynamic About Us page content & editable Editorial Team management
-- Database: Supabase PostgreSQL
-- ==============================================================================

-- 1. Table: about_page_content
CREATE TABLE IF NOT EXISTS public.about_page_content (
  id text PRIMARY KEY DEFAULT 'main',
  hero_tagline text NOT NULL DEFAULT 'Who We Are & What We Do',
  hero_title text NOT NULL DEFAULT 'Knowledge for Everyone, Everywhere',
  hero_highlight text NOT NULL DEFAULT 'Everywhere',
  hero_description text NOT NULL DEFAULT 'EveryGyan was created on the core conviction that practical enterprise learning, independent world news, and culturally rich travel discovery belong in the public square — accessible to all readers without paywalls, pop-up traps, or algorithmic clickbait.',
  story_badge text NOT NULL DEFAULT 'The EveryGyan Story',
  story_title text NOT NULL DEFAULT 'Bridging Deep Technical Skills, Global Awareness, and Everyday Life',
  story_paragraphs jsonb NOT NULL DEFAULT '[]'::jsonb,
  pillars jsonb NOT NULL DEFAULT '[]'::jsonb,
  standards_badge text NOT NULL DEFAULT 'Integrity By Design',
  standards_title text NOT NULL DEFAULT 'Our Editorial Standards & Verification Process',
  standards_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  commitment_title text NOT NULL DEFAULT 'Our Reader Commitment',
  commitment_text text NOT NULL DEFAULT 'We exist to serve our audience. Your trust is our most valuable asset. If you ever spot an error, have feedback on an itinerary, or wish to suggest a technical tutorial, reach out directly to our editorial team.',
  commitment_email text NOT NULL DEFAULT 'editorial@everygyan.com',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_page_content ENABLE ROW LEVEL SECURITY;

-- 2. Table: editorial_team
CREATE TABLE IF NOT EXISTS public.editorial_team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text NOT NULL,
  avatar text NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}'::text[],
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.editorial_team ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies
-- about_page_content: Public can read
DROP POLICY IF EXISTS "Public can view about page content" ON public.about_page_content;
CREATE POLICY "Public can view about page content"
  ON public.about_page_content FOR SELECT
  USING (true);

-- about_page_content: Editors and Admins can update
DROP POLICY IF EXISTS "Editors and Admins can update about page content" ON public.about_page_content;
CREATE POLICY "Editors and Admins can update about page content"
  ON public.about_page_content FOR UPDATE
  USING (public.current_user_is_editor_or_admin())
  WITH CHECK (public.current_user_is_editor_or_admin());

-- about_page_content: Editors and Admins can insert
DROP POLICY IF EXISTS "Editors and Admins can insert about page content" ON public.about_page_content;
CREATE POLICY "Editors and Admins can insert about page content"
  ON public.about_page_content FOR INSERT
  WITH CHECK (public.current_user_is_editor_or_admin());

-- editorial_team: Public can read
DROP POLICY IF EXISTS "Public can view editorial team" ON public.editorial_team;
CREATE POLICY "Public can view editorial team"
  ON public.editorial_team FOR SELECT
  USING (true);

-- editorial_team: Editors and Admins can insert
DROP POLICY IF EXISTS "Editors and Admins can insert editorial team" ON public.editorial_team;
CREATE POLICY "Editors and Admins can insert editorial team"
  ON public.editorial_team FOR INSERT
  WITH CHECK (public.current_user_is_editor_or_admin());

-- editorial_team: Editors and Admins can update
DROP POLICY IF EXISTS "Editors and Admins can update editorial team" ON public.editorial_team;
CREATE POLICY "Editors and Admins can update editorial team"
  ON public.editorial_team FOR UPDATE
  USING (public.current_user_is_editor_or_admin())
  WITH CHECK (public.current_user_is_editor_or_admin());

-- editorial_team: Editors and Admins can delete
DROP POLICY IF EXISTS "Editors and Admins can delete editorial team" ON public.editorial_team;
CREATE POLICY "Editors and Admins can delete editorial team"
  ON public.editorial_team FOR DELETE
  USING (public.current_user_is_editor_or_admin());

-- 4. Initial Seed Content for about_page_content
INSERT INTO public.about_page_content (
  id,
  hero_tagline,
  hero_title,
  hero_highlight,
  hero_description,
  story_badge,
  story_title,
  story_paragraphs,
  pillars,
  standards_badge,
  standards_title,
  standards_items,
  commitment_title,
  commitment_text,
  commitment_email
)
VALUES (
  'main',
  'Who We Are & What We Do',
  'Knowledge for Everyone, Everywhere',
  'Everywhere',
  'EveryGyan was created on the core conviction that practical enterprise learning, independent world news, and culturally rich travel discovery belong in the public square — accessible to all readers without paywalls, pop-up traps, or algorithmic clickbait.',
  'The EveryGyan Story',
  'Bridging Deep Technical Skills, Global Awareness, and Everyday Life',
  '[
    "The internet today is increasingly bifurcated: on one side stand walled gardens and expensive paywalls locking away essential knowledge; on the other lies sensationalized, AI-generated spam engineered solely for clicks.",
    "EveryGyan occupies a different space. We are an independent, digital-native publication built on meticulous research, verifiable citations, and real-world domain expertise. Whether decoding modern SAP S/4HANA CDS views for an aspiring developer, analyzing clean energy transitions for a policy researcher, or charting child-friendly hiking routes across the Swiss Alps, our work is produced to be actionable, truthful, and inspiring.",
    "We take pride in our name: Gyan represents wisdom, clarity, and lifelong learning. Our goal is to make that wisdom accessible to every curious mind, regardless of geographic location or economic background."
  ]'::jsonb,
  '[
    {
      "icon": "BookOpen",
      "color": "purple",
      "title": "Enterprise Tech & Skills Learning",
      "description": "We author detailed, code-backed guides for modern developers and enterprise architects: SAP S/4HANA migrations, ABAP RESTful Application Programming Model (RAP), multimodal AI agents with tool use, German language proficiency for expatriates, and cloud architecture certifications.",
      "bullets": [
        "Hands-on code snippets tested against real cloud tenants",
        "Zero theoretical fluff — focused on production enterprise patterns"
      ]
    },
    {
      "icon": "Globe",
      "color": "blue",
      "title": "Independent World & Regional News",
      "description": "Fact-checked reporting covering geopolitics, international trade corridors, high-speed rail integration across Asia, European climate legislation, space exploration, and macroeconomic policy shifts across the Americas.",
      "bullets": [
        "Verified against official treaty documents and statistical authorities",
        "Contextual analysis beyond superficial 24-hour news cycles"
      ]
    },
    {
      "icon": "Compass",
      "color": "rose",
      "title": "Cultural & Family Travel",
      "description": "Real-world itineraries crafted for families and independent travelers: vetted transit links, step-free station access, daily budget ranges, safety caveats, and local cultural etiquette from Kyoto to the Norwegian fjords.",
      "bullets": [
        "Verified transit cards and timetable schedules",
        "Strictly no invented prices, opening hours, or fake reviews"
      ]
    },
    {
      "icon": "Tag",
      "color": "amber",
      "title": "Curated Deals & Gear Reviews",
      "description": "We test consumer tech, developer ultrabooks, noise-canceling headphones, and travel accessories. Every deal featured in our showcase is verified against price tracking tools to ensure genuine reader value.",
      "bullets": [
        "Transparent affiliate disclosures on every commercial link",
        "No sponsored placements; reviews reflect honest editorial testing"
      ]
    }
  ]'::jsonb,
  'Integrity By Design',
  'Our Editorial Standards & Verification Process',
  '[
    {
      "title": "Primary Sources First",
      "description": "We link directly to official national tourism portals, open peer-reviewed studies, government gazettes, and software API references. We do not recycle secondary blog hearsay."
    },
    {
      "title": "Transparent AI Policy",
      "description": "When automated workflows assist in synthesizing research or drafting outlines, every piece of content undergoes comprehensive human editorial review and code execution before publication."
    },
    {
      "title": "Clear Corrections",
      "description": "When factual details require correction or regulatory policies change, we update articles promptly with transparent notes documenting what was modified and when."
    }
  ]'::jsonb,
  'Our Reader Commitment',
  'We exist to serve our audience. Your trust is our most valuable asset. If you ever spot an error, have feedback on an itinerary, or wish to suggest a technical tutorial, reach out directly to our editorial team at editorial@everygyan.com.',
  'editorial@everygyan.com'
)
ON CONFLICT (id) DO UPDATE SET
  hero_tagline = EXCLUDED.hero_tagline,
  hero_title = EXCLUDED.hero_title,
  hero_highlight = EXCLUDED.hero_highlight,
  hero_description = EXCLUDED.hero_description,
  story_badge = EXCLUDED.story_badge,
  story_title = EXCLUDED.story_title,
  story_paragraphs = EXCLUDED.story_paragraphs,
  pillars = EXCLUDED.pillars,
  standards_badge = EXCLUDED.standards_badge,
  standards_title = EXCLUDED.standards_title,
  standards_items = EXCLUDED.standards_items,
  commitment_title = EXCLUDED.commitment_title,
  commitment_text = EXCLUDED.commitment_text,
  commitment_email = EXCLUDED.commitment_email,
  updated_at = now();

-- 5. Seed initial team members
INSERT INTO public.editorial_team (name, role, bio, avatar, specialties, display_order)
VALUES
  (
    'Sandeep',
    'Lead Travel, Tech & Enterprise Editor',
    'Enterprise architect and tech journalist specializing in SAP S/4HANA, cloud infrastructure, and family-friendly European rail expeditions.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    ARRAY['SAP & ABAP RAP', 'Multimodal AI', 'European Rail', 'Gear Reviews'],
    1
  ),
  (
    'Dr. Neha Verma',
    'Health & Wellness Editor',
    'Clinical researcher and wellness writer covering circadian biology, nutritional biochemistry, and sustainable lifestyle micro-habits.',
    'https://images.unsplash.com/photo-1594824813572-c28f7478052f?auto=format&fit=crop&w=300&q=80',
    ARRAY['Circadian Rhythms', 'Evidence-Based Nutrition', 'Sleep Optimization'],
    2
  ),
  (
    'Vikram Mehta',
    'Global Affairs & Trade Analyst',
    'International macroeconomist analyzing multilateral treaties, clean energy finance, maritime trade corridors, and supply chain shifts.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    ARRAY['Global Trade', 'Energy Policy', 'International Accords'],
    3
  ),
  (
    'Rahul Sharma',
    'Sports & Regional News Correspondent',
    'Cricket analyst and South Asian affairs correspondent with focus on tactical match analytics, sports science, and regional transit.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    ARRAY['Cricket Tactics', 'High-Speed Rail', 'Regional Development'],
    4
  ),
  (
    'Ananya Rao',
    'Culture & Travel Editor',
    'Photojournalist documenting cultural heritage, eco-sanctuaries, Himalayan trails, and sustainable travel initiatives worldwide.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    ARRAY['Asia Travel', 'Wildlife Photography', 'Ecotourism'],
    5
  ),
  (
    'Priya Patel',
    'Entertainment & Film Critic',
    'Film historian and cultural critic tracking international cinema festivals, prestige television narratives, and theatrical innovations.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    ARRAY['70mm & IMAX Cinema', 'Prestige Series', 'Cannes Coverage'],
    6
  )
ON CONFLICT DO NOTHING;
