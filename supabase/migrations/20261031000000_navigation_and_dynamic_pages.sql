-- =============================================================
-- Migration: Dynamic Navigation Menus & Dynamic Pages
-- Date: 2026-10-31
-- Description: Stores website navigation structure in Supabase
--   so admins can manage menus from the dashboard. Also adds
--   a dynamic_pages table for user-created category pages.
-- =============================================================

-- 1. navigation_menus — hierarchical menu items
CREATE TABLE IF NOT EXISTS public.navigation_menus (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  type        text        NOT NULL DEFAULT 'link'
                          CHECK (type IN ('link', 'dropdown')),
  path        text        NOT NULL,
  description text,
  badge       text,
  display_order integer   NOT NULL DEFAULT 0,
  visible     boolean     NOT NULL DEFAULT true,
  parent_id   uuid        REFERENCES public.navigation_menus(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;

-- Anyone can read visible menu items
CREATE POLICY "Public can read visible navigation"
  ON public.navigation_menus FOR SELECT
  USING (visible = true);

-- Editors & admins can manage navigation
CREATE POLICY "Editors and admins can insert navigation"
  ON public.navigation_menus FOR INSERT
  WITH CHECK (current_user_is_editor_or_admin());

CREATE POLICY "Editors and admins can update navigation"
  ON public.navigation_menus FOR UPDATE
  USING (current_user_is_editor_or_admin());

CREATE POLICY "Editors and admins can delete navigation"
  ON public.navigation_menus FOR DELETE
  USING (current_user_is_editor_or_admin());

-- 2. dynamic_pages — user-created category pages
CREATE TABLE IF NOT EXISTS public.dynamic_pages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  description text,
  icon        text        DEFAULT 'FileText',
  color       text        DEFAULT 'slate',
  page_type   text        NOT NULL DEFAULT 'category'
                          CHECK (page_type IN ('category', 'custom')),
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.dynamic_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active pages"
  ON public.dynamic_pages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Editors and admins can insert pages"
  ON public.dynamic_pages FOR INSERT
  WITH CHECK (current_user_is_editor_or_admin());

CREATE POLICY "Editors and admins can update pages"
  ON public.dynamic_pages FOR UPDATE
  USING (current_user_is_editor_or_admin());

CREATE POLICY "Editors and admins can delete pages"
  ON public.dynamic_pages FOR DELETE
  USING (current_user_is_editor_or_admin());

-- 3. Seed navigation items matching current Header.tsx
DO $$
DECLARE
  v_about    uuid;
  v_travel   uuid;
  v_news     uuid;
  v_learn    uuid;
  v_ent      uuid;
  v_deals    uuid;
BEGIN
  -- Top-level items
  INSERT INTO public.navigation_menus (name, type, path, display_order, visible)
    VALUES ('About us', 'link', '/about', 10, true) RETURNING id INTO v_about;

  INSERT INTO public.navigation_menus (name, type, path, display_order, visible)
    VALUES ('Travel', 'dropdown', '/category/travel', 20, true) RETURNING id INTO v_travel;

  INSERT INTO public.navigation_menus (name, type, path, display_order, visible)
    VALUES ('News', 'dropdown', '/category/news', 30, true) RETURNING id INTO v_news;

  INSERT INTO public.navigation_menus (name, type, path, display_order, visible)
    VALUES ('Learn', 'dropdown', '/category/learn', 40, true) RETURNING id INTO v_learn;

  INSERT INTO public.navigation_menus (name, type, path, display_order, visible)
    VALUES ('Entertainment', 'dropdown', '/category/entertainment', 50, true) RETURNING id INTO v_ent;

  INSERT INTO public.navigation_menus (name, type, path, badge, display_order, visible)
    VALUES ('Deals', 'link', '/deals', 'Hot', 60, true) RETURNING id INTO v_deals;

  -- Travel sub-items
  INSERT INTO public.navigation_menus (name, type, path, description, display_order, visible, parent_id) VALUES
    ('World',    'link', '/category/travel-world',    'Global routes & round-the-world trips',    1, true, v_travel),
    ('Asia',     'link', '/category/travel-asia',     'Temples, beaches & cultural journeys',     2, true, v_travel),
    ('Europe',   'link', '/category/travel-europe',   'Historic cities & scenic alpine rail',     3, true, v_travel),
    ('Americas', 'link', '/category/travel-americas', 'National parks & coastal road trips',      4, true, v_travel),
    ('Health',   'link', '/category/health',          'Wellness routines & longevity guides',     5, true, v_travel);

  -- News sub-items
  INSERT INTO public.navigation_menus (name, type, path, description, display_order, visible, parent_id) VALUES
    ('Latest News',   'link', '/category/latest-news',   'Breaking stories & key daily headlines',    1, true, v_news),
    ('World news',    'link', '/category/news-world',    'Geopolitics, climate accords & trade',      2, true, v_news),
    ('Asia news',     'link', '/category/news-asia',     'Regional development & championships',      3, true, v_news),
    ('Europe news',   'link', '/category/news-europe',   'European policy & energy transition',       4, true, v_news),
    ('Americas News', 'link', '/category/news-americas', 'Space exploration, tech & policy',          5, true, v_news);

  -- Learn sub-items
  INSERT INTO public.navigation_menus (name, type, path, description, display_order, visible, parent_id) VALUES
    ('AI',             'link', '/category/learn-ai',      'Multimodal AI & autonomous agents',         1, true, v_learn),
    ('SAP',            'link', '/category/learn-sap',     'S/4HANA, ABAP RAP & CDS tutorials',        2, true, v_learn),
    ('German',         'link', '/category/learn-german',  'Grammar rules & workplace communication',   3, true, v_learn),
    ('Latest Updates', 'link', '/category/learn-updates', 'Cloud certifications & tech roadmaps',      4, true, v_learn);

  -- Entertainment sub-items (includes new Games!)
  INSERT INTO public.navigation_menus (name, type, path, description, display_order, visible, parent_id) VALUES
    ('Movies',     'link', '/category/entertainment-movies',     'Cinema critiques, 70mm & IMAX',            1, true, v_ent),
    ('Series',     'link', '/category/entertainment-series',     'Prestige limited series & streaming',      2, true, v_ent),
    ('Celeb news', 'link', '/category/entertainment-celeb-news', 'Interviews, Cannes & red carpets',         3, true, v_ent),
    ('Photos',     'link', '/category/entertainment-photos',     'Wildlife photography & ancient marvels',   4, true, v_ent),
    ('Games',      'link', '/category/entertainment-games',      'Mobile, console & PC gaming news',         5, true, v_ent);
END $$;

-- 4. Seed the Games category in dynamic_pages
INSERT INTO public.dynamic_pages (title, slug, description, icon, color, page_type, is_active)
  VALUES ('Games', 'entertainment-games', 'Mobile, console & PC gaming news', 'Gamepad2', 'violet', 'category', true);
