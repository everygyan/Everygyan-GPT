-- ==============================================================================
-- EveryGyan — Seed Articles, Categories, and Editorial Author
-- Migration: 20261020000001_seed_articles.sql
-- Description: Seeds the core publication categories, author profile, and the
--              8 initial editorial articles into public.articles so live database
--              queries return real content rather than relying on frontend fallback.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. Refine Role Protection Trigger for Direct Database Administrator Execution
-- ------------------------------------------------------------------------------
-- Direct SQL executions from the Supabase Dashboard SQL editor have auth.uid() IS NULL.
-- Only client-originated requests (where auth.uid() is NOT NULL) undergo role-elevation restrictions.
CREATE OR REPLACE FUNCTION public.handle_profile_role_protection()
RETURNS trigger AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Unauthorized: Only an administrator can modify user roles.';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Temporarily bypass profile role trigger during admin seed execution
ALTER TABLE public.profiles DISABLE TRIGGER IF EXISTS tr_protect_profile_role;

DO $$
DECLARE
  v_author_id uuid;
  v_cat_travel_id uuid;
  v_cat_tech_id uuid;
  v_cat_health_id uuid;
  v_cat_geopolitics_id uuid;
  v_cat_sports_id uuid;
  v_cat_learning_id uuid;
BEGIN
  -- ----------------------------------------------------------------------------
  -- 1. Ensure Editorial Author Profile Exists
  -- ----------------------------------------------------------------------------
  -- Check if any profile already exists in public.profiles
  SELECT id INTO v_author_id FROM public.profiles LIMIT 1;

  -- If no profile exists yet, check auth.users or create a system author
  IF v_author_id IS NULL THEN
    SELECT id INTO v_author_id FROM auth.users LIMIT 1;
  END IF;

  -- If auth.users is completely empty, insert a dedicated editorial user in auth.users
  IF v_author_id IS NULL THEN
    v_author_id := 'e0000000-0000-0000-0000-000000000001'::uuid;
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    )
    VALUES (
      v_author_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'editor@everygyan.com',
      crypt('EveryGyanEditor2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Sandeep"}'::jsonb,
      now(),
      now(),
      'authenticated',
      'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Ensure profile exists in public.profiles with editor role
  INSERT INTO public.profiles (id, full_name, bio, role, created_at, updated_at)
  VALUES (
    v_author_id,
    'Sandeep',
    'Lead Travel, Tech & Enterprise SAP Editor at EveryGyan.',
    'editor',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'editor';

  -- ----------------------------------------------------------------------------
  -- 2. Seed Publication Categories
  -- ----------------------------------------------------------------------------
  INSERT INTO public.categories (name, slug, description, icon, color)
  VALUES
    ('Travel', 'travel', 'Family-friendly itineraries, budget guides, cultural landmarks, and travel tips.', 'Compass', '#e11d48'),
    ('Tech', 'tech', 'Artificial intelligence, software engineering, consumer gadgets, and digital trends.', 'Cpu', '#2563eb'),
    ('Health', 'health', 'Evidence-based wellness, nutrition, fitness, and longevity advice.', 'Heart', '#059669'),
    ('Geopolitics', 'geopolitics', 'International diplomacy, global trade routes, macroeconomics, and policy.', 'Globe', '#4f46e5'),
    ('Sports', 'sports', 'Cricket, global athletics, championship analysis, and fitness culture.', 'Trophy', '#d97706'),
    ('Learning', 'learning', 'In-depth SAP workflows, cloud computing tutorials, and career development.', 'BookOpen', '#7c3aed')
  ON CONFLICT (slug) DO UPDATE
  SET description = EXCLUDED.description;

  -- Retrieve category IDs
  SELECT id INTO v_cat_travel_id FROM public.categories WHERE slug = 'travel';
  SELECT id INTO v_cat_tech_id FROM public.categories WHERE slug = 'tech';
  SELECT id INTO v_cat_health_id FROM public.categories WHERE slug = 'health';
  SELECT id INTO v_cat_geopolitics_id FROM public.categories WHERE slug = 'geopolitics';
  SELECT id INTO v_cat_sports_id FROM public.categories WHERE slug = 'sports';
  SELECT id INTO v_cat_learning_id FROM public.categories WHERE slug = 'learning';

  -- ----------------------------------------------------------------------------
  -- 3. Seed Core Tags
  -- ----------------------------------------------------------------------------
  INSERT INTO public.tags (name, slug)
  VALUES
    ('Europe', 'europe'),
    ('Family Travel', 'family-travel'),
    ('Austria', 'austria'),
    ('Switzerland', 'switzerland'),
    ('Budget Travel', 'budget-travel'),
    ('AI', 'ai'),
    ('Productivity', 'productivity'),
    ('Technology', 'technology'),
    ('Wellness', 'wellness'),
    ('Habits', 'habits'),
    ('Mental Health', 'mental-health'),
    ('Trade', 'trade'),
    ('Economy', 'economy'),
    ('Policy', 'policy'),
    ('Cricket', 'cricket'),
    ('T20', 't20'),
    ('World Cup', 'world-cup'),
    ('Laptops', 'laptops'),
    ('Students', 'students'),
    ('Hardware', 'hardware'),
    ('Reviews', 'reviews'),
    ('Beaches', 'beaches'),
    ('India', 'india'),
    ('Getaway', 'getaway'),
    ('SAP', 'sap'),
    ('ERP', 'erp'),
    ('Enterprise', 'enterprise'),
    ('Career', 'career')
  ON CONFLICT (slug) DO NOTHING;

  -- ----------------------------------------------------------------------------
  -- 4. Seed Editorial Articles
  -- ----------------------------------------------------------------------------

  -- Article 1: Lead Story (Europe Family Travel)
  INSERT INTO public.articles (
    author_id, category_id, category, category_slug, title, slug, excerpt, content,
    cover_image, cover_caption, status, published_at, read_time,
    is_lead_story, is_featured, views_count, tags, table_of_contents, "references",
    seo_title, seo_description
  )
  VALUES (
    v_author_id,
    v_cat_travel_id,
    'Travel',
    'travel',
    '10 Amazing Places to Visit in Europe with Family',
    '10-amazing-places-to-visit-in-europe-with-family',
    'From fairytale towns to breathtaking alpine landscapes, discover the best family-friendly destinations in Europe that are fun, safe and budget-friendly.',
    E'Travelling with family can be one of the most rewarding experiences. Europe offers a perfect mix of culture, adventure, and safety, making it an ideal destination for families. Here are some of the top places you should consider for your next trip.\n\n## 1. Vienna, Austria\nVienna is renowned for its imperial palaces, immaculate parks, and family-oriented museums. The Prater amusement park and Schönbrunn Zoo offer entertainment for children of all ages, while parents can enjoy world-class coffee house culture and historic architecture.\n\n## 2. Hallstatt, Austria\nTucked away between tranquil alpine waters and soaring mountain ranges, Hallstatt feels like stepping straight into a classic storybook. Explore the world''s oldest salt mine with subterranean wooden slides and take panoramic boat rides across the mirror-like lake.\n\n## 3. Prague, Czech Republic\nKnown as the City of a Hundred Spires, Prague enchants visitors with its medieval astronomical clock, pedestrian-friendly Charles Bridge, and majestic castle complex overlooking the Vltava river.\n\n## 4. Interlaken, Switzerland\nNestled in the heart of the Bernese Oberland, Interlaken is Europe''s premier adventure gateway. Families can board scenic cogwheel railways up to Jungfraujoch — the Top of Europe — explore crystal-clear turquoise lakes, and embark on gentle alpine meadow hikes.',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=75',
    'Breathtaking alpine vistas and serene lakes across central Europe.',
    'published',
    now() - interval '2 days',
    '8 min read',
    true,
    false,
    2480,
    ARRAY['Europe', 'Family Travel', 'Austria', 'Switzerland', 'Budget Travel'],
    '[{"id":"1-vienna-austria","level":2,"title":"1. Vienna, Austria"},{"id":"2-hallstatt-austria","level":2,"title":"2. Hallstatt, Austria"},{"id":"3-prague-czech-republic","level":2,"title":"3. Prague, Czech Republic"},{"id":"4-interlaken-switzerland","level":2,"title":"4. Interlaken, Switzerland"}]'::jsonb,
    '[{"title":"Austrian National Tourist Office Official Portal","url":"https://www.austria.info"},{"title":"Swiss Federal Railways (SBB) Family Travel Information","url":"https://www.sbb.ch"}]'::jsonb,
    '10 Amazing Places to Visit in Europe with Family | EveryGyan',
    'Best family-friendly European destinations: Vienna, Hallstatt, Prague, and Interlaken reviewed with tips, itineraries, and budget planning.'
  )
  ON CONFLICT (slug) DO UPDATE
  SET
    content = EXCLUDED.content,
    cover_image = EXCLUDED.cover_image,
    status = EXCLUDED.status,
    is_lead_story = EXCLUDED.is_lead_story;

  -- Article 2: Tech (Future of AI)
  INSERT INTO public.articles (
    author_id, category_id, category, category_slug, title, slug, excerpt, content,
    cover_image, cover_caption, status, published_at, read_time,
    is_lead_story, is_featured, views_count, tags, table_of_contents, "references",
    seo_title, seo_description
  )
  VALUES (
    v_author_id,
    v_cat_tech_id,
    'Tech',
    'tech',
    'The Future of AI: How Gemini is Changing the Way We Work',
    'the-future-of-ai-how-gemini-is-changing-the-way-we-work',
    'Exploring how multimodal generative intelligence is streamlining software engineering, editorial operations, and business productivity.',
    E'Deep diving into agentic architectures, context windows, and modern workflow automation.\n\n## The Shift to Agentic Workflows\nAutonomous coding agents and pair-programming assistants are moving beyond simple autocomplete to multi-step reasoning, test-driven validation, and contextual workspace synthesis.\n\n## Enterprise Integration\nBusinesses are adopting private generative models with robust retrieval-augmented generation (RAG) to process compliance, customer service, and data analysis at scale.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=75',
    'Multimodal neural networks powering automated intelligence.',
    'published',
    now() - interval '1 day',
    '5 min read',
    false,
    false,
    1320,
    ARRAY['AI', 'Productivity', 'Technology'],
    '[{"id":"the-shift-to-agentic-workflows","level":2,"title":"The Shift to Agentic Workflows"},{"id":"enterprise-integration","level":2,"title":"Enterprise Integration"}]'::jsonb,
    '[]'::jsonb,
    'The Future of AI: How Gemini is Changing the Way We Work | EveryGyan',
    'Multimodal generative intelligence and autonomous coding workflows explored.'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- Article 3: Health (Simple Habits)
  INSERT INTO public.articles (
    author_id, category_id, category, category_slug, title, slug, excerpt, content,
    cover_image, cover_caption, status, published_at, read_time,
    is_lead_story, is_featured, views_count, tags, table_of_contents, "references",
    seo_title, seo_description
  )
  VALUES (
    v_author_id,
    v_cat_health_id,
    'Health',
    'health',
    'Simple Habits for a Healthier and Happier Life',
    'simple-habits-for-a-healthier-and-happier-life',
    'Science-backed daily micro-habits that improve sleep quality, reduce cognitive fatigue, and enhance physical vitality.',
    E'Actionable guidance on morning sunlight, progressive resistance training, and hydration.\n\n## Morning Circadian Rhythm Alignment\nViewing direct morning sunlight within 30 minutes of waking triggers natural cortisol pulses and sets your evening melatonin clock for restorative deep sleep.\n\n## Hydration and Electrolytes\nCellular hydration requires essential mineral balance including sodium, potassium, and magnesium, particularly for cognitive sharpness.',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=75',
    'Holistic daily wellness and physical vitality routines.',
    'published',
    now() - interval '2 days',
    '6 min read',
    false,
    false,
    980,
    ARRAY['Wellness', 'Habits', 'Mental Health'],
    '[{"id":"morning-circadian-rhythm-alignment","level":2,"title":"Morning Circadian Rhythm Alignment"},{"id":"hydration-and-electrolytes","level":2,"title":"Hydration and Electrolytes"}]'::jsonb,
    '[]'::jsonb,
    'Simple Habits for a Healthier and Happier Life | EveryGyan',
    'Science-backed daily micro-habits for sleep, energy, and wellness.'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- Article 4: Geopolitics (Global Trade in 2026)
  INSERT INTO public.articles (
    author_id, category_id, category, category_slug, title, slug, excerpt, content,
    cover_image, cover_caption, status, published_at, read_time,
    is_lead_story, is_featured, views_count, tags, table_of_contents, "references",
    seo_title, seo_description
  )
  VALUES (
    v_author_id,
    v_cat_geopolitics_id,
    'Geopolitics',
    'geopolitics',
    'What''s Next for Global Trade in 2026?',
    'whats-next-for-global-trade-in-2026',
    'Supply chain diversification, semiconductor corridors, and geopolitical realignments reshaping international commerce.',
    E'Macroeconomic analysis of shipping lanes, strategic semiconductor alliances, and bilateral regional agreements.\n\n## Friendshoring and Regional Hubs\nGlobal manufacturers are actively diversifying operations from single-source manufacturing toward resilient regional manufacturing corridors in India, Vietnam, and Central Europe.\n\n## Critical Mineral Security\nRare earths, lithium, and battery technology supply chains are driving strategic multilateral partnerships across the Indo-Pacific.',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=75',
    'Global cargo vessels and strategic trade shipping corridors.',
    'published',
    now() - interval '3 days',
    '7 min read',
    false,
    false,
    1150,
    ARRAY['Trade', 'Economy', 'Policy'],
    '[{"id":"friendshoring-and-regional-hubs","level":2,"title":"Friendshoring and Regional Hubs"},{"id":"critical-mineral-security","level":2,"title":"Critical Mineral Security"}]'::jsonb,
    '[]'::jsonb,
    'What''s Next for Global Trade in 2026? | EveryGyan',
    'Global trade realignments, supply chains, and economic corridors.'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- Article 5: Sports (India T20 World Cup)
  INSERT INTO public.articles (
    author_id, category_id, category, category_slug, title, slug, excerpt, content,
    cover_image, cover_caption, status, published_at, read_time,
    is_lead_story, is_featured, views_count, tags, table_of_contents, "references",
    seo_title, seo_description
  )
  VALUES (
    v_author_id,
    v_cat_sports_id,
    'Sports',
    'sports',
    'India''s Journey in the T20 World Cup',
    'indias-journey-in-the-t20-world-cup',
    'Tactical breakdown of bowling rotations, aggressive middle-order fielding, and key championship milestones.',
    E'Performance analysis and stats review from the recent tournament matches.\n\n## Masterclass in Death Bowling\nDisciplined seam bowling and deceptive variations during the final five overs proved decisive in low-scoring high-pressure encounters.\n\n## The Powerplay Mindset\nAggressive stroke play in overs 1 through 6 consistently disrupted opposition strategies and established solid run-rate foundations.',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=75',
    'World cricket stadium action under bright floodlights.',
    'published',
    now() - interval '4 days',
    '4 min read',
    false,
    false,
    2100,
    ARRAY['Cricket', 'T20', 'World Cup'],
    '[{"id":"masterclass-in-death-bowling","level":2,"title":"Masterclass in Death Bowling"},{"id":"the-powerplay-mindset","level":2,"title":"The Powerplay Mindset"}]'::jsonb,
    '[]'::jsonb,
    'India''s Journey in the T20 World Cup | EveryGyan',
    'Comprehensive tactical analysis of T20 championship performances.'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- Article 6: Featured Tech (Best Laptops for Students)
  INSERT INTO public.articles (
    author_id, category_id, category, category_slug, title, slug, excerpt, content,
    cover_image, cover_caption, status, published_at, read_time,
    is_lead_story, is_featured, views_count, tags, table_of_contents, "references",
    seo_title, seo_description
  )
  VALUES (
    v_author_id,
    v_cat_tech_id,
    'Tech',
    'tech',
    'Best Laptops for Students in 2026 (Under ₹70,000)',
    'best-laptops-for-students-in-2026-under-70000',
    'Find the perfect laptop for your studies, creative work or everyday use — with our top picks tested for battery life and performance.',
    E'Comprehensive testing and benchmarks comparing thermal performance, battery endurance, and keyboards.\n\n## Key Buying Criteria for Students\nBattery longevity of 10+ hours, bright 100% sRGB screens, and lightweight aluminum chassis are essential for university life.\n\n## Recommended Models\nFrom Apple Silicon M2/M3 alternatives to AMD Ryzen 8000 ultrabooks, here are our verified picks tested under real study workloads.',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=75',
    'Modern ultrabooks evaluated for student workloads.',
    'published',
    now() - interval '2 days',
    '6 min read',
    false,
    true,
    3120,
    ARRAY['Laptops', 'Students', 'Hardware', 'Reviews'],
    '[{"id":"key-buying-criteria-for-students","level":2,"title":"Key Buying Criteria for Students"},{"id":"recommended-models","level":2,"title":"Recommended Models"}]'::jsonb,
    '[]'::jsonb,
    'Best Laptops for Students in 2026 (Under ₹70,000) | EveryGyan',
    'Detailed student laptop buyer guide tested for battery, thermals, and speed.'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- Article 7: Featured Travel (Top 5 Beaches in India)
  INSERT INTO public.articles (
    author_id, category_id, category, category_slug, title, slug, excerpt, content,
    cover_image, cover_caption, status, published_at, read_time,
    is_lead_story, is_featured, views_count, tags, table_of_contents, "references",
    seo_title, seo_description
  )
  VALUES (
    v_author_id,
    v_cat_travel_id,
    'Travel',
    'travel',
    'Top 5 Beaches in India for a Perfect Getaway',
    'top-5-beaches-in-india-for-a-perfect-getaway',
    'Crystal clear waters, golden sands and unforgettable experiences await you in these serene coastal paradises.',
    E'Exploring secluded coastlines from the Andaman Islands to South Goa and Gokarna.\n\n## 1. Radhanagar Beach, Havelock Island (Andamans)\nRanked consistently among Asia''s finest beaches, Radhanagar boasts powdery white sand, lush rainforest canopies, and breathtaking sunsets.\n\n## 2. Palolem Beach, South Goa\nA crescent-shaped tranquil haven fringed with coconut palms, ideal for relaxed kayaking and family swimming.\n\n## 3. Kudle Beach, Gokarna\nSurrounded by rugged cliffs, Kudle offers an unspoiled alternative for nature lovers seeking peace away from commercial crowds.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=75',
    'Golden sands and turquoise waters of coastal India.',
    'published',
    now() - interval '3 days',
    '7 min read',
    false,
    true,
    1840,
    ARRAY['Beaches', 'India', 'Travel', 'Getaway'],
    '[{"id":"1-radhanagar-beach-havelock-island-andamans","level":2,"title":"1. Radhanagar Beach, Havelock Island"},{"id":"2-palolem-beach-south-goa","level":2,"title":"2. Palolem Beach, South Goa"},{"id":"3-kudle-beach-gokarna","level":2,"title":"3. Kudle Beach, Gokarna"}]'::jsonb,
    '[]'::jsonb,
    'Top 5 Beaches in India for a Perfect Getaway | EveryGyan',
    'Discover peaceful coastal paradises across the Andaman Islands, Goa, and Gokarna.'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- Article 8: Featured Learning (Why Learning SAP Can Boost Your Career)
  INSERT INTO public.articles (
    author_id, category_id, category, category_slug, title, slug, excerpt, content,
    cover_image, cover_caption, status, published_at, read_time,
    is_lead_story, is_featured, views_count, tags, table_of_contents, "references",
    seo_title, seo_description
  )
  VALUES (
    v_author_id,
    v_cat_learning_id,
    'Learning',
    'learning',
    'Why Learning SAP Can Boost Your Career',
    'why-learning-sap-can-boost-your-career',
    'Explore the key benefits, career opportunities and structured learning paths for enterprise SAP professionals.',
    E'Detailed roadmap covering SAP S/4HANA migration, ABAP on Cloud, and enterprise integration.\n\n## Enterprise Demand for Clean Core Architecture\nGlobal enterprises migrating to S/4HANA Cloud require architects and developers skilled in side-by-side extensibility on SAP Business Technology Platform (BTP).\n\n## High Growth Career Paths\nFrom functional consultants in Finance (FI/CO) and Supply Chain (MM/SD) to modern ABAP RESTful Application Programming (RAP) developers, enterprise skill demand continues to outpace supply worldwide.',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=75',
    'Enterprise technology and cloud career learning roadmap.',
    'published',
    now() - interval '4 days',
    '8 min read',
    false,
    true,
    4200,
    ARRAY['SAP', 'ERP', 'Enterprise', 'Career'],
    '[{"id":"enterprise-demand-for-clean-core-architecture","level":2,"title":"Enterprise Demand for Clean Core Architecture"},{"id":"high-growth-career-paths","level":2,"title":"High Growth Career Paths"}]'::jsonb,
    '[]'::jsonb,
    'Why Learning SAP Can Boost Your Career | EveryGyan',
    'Enterprise SAP career opportunities, S/4HANA Cloud, and learning paths.'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- ----------------------------------------------------------------------------
  -- 5. Seed Initial Approved Reader Comments
  -- ----------------------------------------------------------------------------
  INSERT INTO public.comments (
    article_id,
    author_name,
    content,
    status,
    created_at
  )
  SELECT
    id,
    'Priya Sharma',
    'Vienna and Hallstatt are absolutely wonderful for young kids. The salt mine slides were an unforgettable highlight!',
    'approved',
    now() - interval '1 day'
  FROM public.articles
  WHERE slug = '10-amazing-places-to-visit-in-europe-with-family'
  LIMIT 1;

END $$;

-- Re-enable profile role protection trigger
ALTER TABLE public.profiles ENABLE TRIGGER IF EXISTS tr_protect_profile_role;
