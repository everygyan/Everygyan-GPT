-- ==============================================================================
-- EveryGyan Hardened Forward-Only Schema & Row Level Security (RLS) Migration
-- Database: Supabase PostgreSQL
-- Timestamp: 20261020000000
-- ==============================================================================

-- Enable pgcrypto if available (safe / idempotent)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ==============================================================================
-- 1. Helper Functions for Role Checking (Security Definer)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.current_user_has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_user_is_editor_or_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('editor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_user_is_moderator_or_higher()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'editor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 2. Profiles Table (Extends Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT 'Reader',
  avatar_url text,
  bio text,
  role text NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'author', 'editor', 'moderator', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public can view public profiles" ON public.profiles;
CREATE POLICY "Public can view public profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own non-role profile fields" ON public.profiles;
CREATE POLICY "Users can update their own non-role profile fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Prevent unauthorized role escalation trigger
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

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
CREATE TRIGGER tr_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_role_protection();

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Reader'),
    NEW.raw_user_meta_data->>'avatar_url',
    'reader' -- Always defaults strictly to reader
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping auth.users trigger setup due to permission restriction: %', SQLERRM;
END $$;

-- ==============================================================================
-- 3. Categories Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text NOT NULL DEFAULT 'Globe',
  color text NOT NULL DEFAULT '#dc2626',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only editors and admins can manage categories" ON public.categories;
CREATE POLICY "Only editors and admins can manage categories"
  ON public.categories FOR ALL
  USING (public.current_user_is_editor_or_admin());

-- ==============================================================================
-- 4. Tags Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read tags" ON public.tags;
CREATE POLICY "Public can read tags"
  ON public.tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authors and above can manage tags" ON public.tags;
CREATE POLICY "Authors and above can manage tags"
  ON public.tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('author', 'editor', 'admin')
    )
  );

-- ==============================================================================
-- 5. Articles Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  category text NOT NULL,
  category_slug text NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  cover_image text,
  cover_caption text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'scheduled', 'published', 'archived')),
  published_at timestamptz,
  read_time text NOT NULL DEFAULT '5 min read',
  is_lead_story boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  views_count integer NOT NULL DEFAULT 0,
  tags text[] NOT NULL DEFAULT '{}',
  table_of_contents jsonb NOT NULL DEFAULT '[]'::jsonb,
  "references" jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON public.articles(status, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_slug);
CREATE INDEX IF NOT EXISTS idx_articles_author ON public.articles(author_id);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Articles Policies:
-- 1. SELECT: Public can see published articles that are already released
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
CREATE POLICY "Public can view published articles"
  ON public.articles FOR SELECT
  USING (
    (status = 'published' AND published_at <= now())
    OR (auth.uid() = author_id)
    OR public.current_user_is_editor_or_admin()
  );

-- 2. INSERT: Authors, editors, admins can insert
DROP POLICY IF EXISTS "Authors and editors can insert articles" ON public.articles;
CREATE POLICY "Authors and editors can insert articles"
  ON public.articles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('author', 'editor', 'admin')
    )
    AND auth.uid() = author_id
  );

-- 3. UPDATE: Authors can update own drafts; Editors & Admins can update any article
DROP POLICY IF EXISTS "Authors can update own articles; editors can update all" ON public.articles;
CREATE POLICY "Authors can update own articles; editors can update all"
  ON public.articles FOR UPDATE
  USING (
    (auth.uid() = author_id AND status IN ('draft', 'in_review'))
    OR public.current_user_is_editor_or_admin()
  );

-- 4. DELETE: Only admins or authors of their own draft
DROP POLICY IF EXISTS "Admins can delete articles; authors can delete own draft" ON public.articles;
CREATE POLICY "Admins can delete articles; authors can delete own draft"
  ON public.articles FOR DELETE
  USING (
    (auth.uid() = author_id AND status = 'draft')
    OR public.current_user_has_role('admin')
  );

-- ==============================================================================
-- 6. Comments Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  content text NOT NULL CHECK (char_length(content) <= 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_article_status ON public.comments(article_id, status);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments Policies:
-- 1. Public can only see approved comments
DROP POLICY IF EXISTS "Public can view approved comments" ON public.comments;
CREATE POLICY "Public can view approved comments"
  ON public.comments FOR SELECT
  USING (
    status = 'approved'
    OR public.current_user_is_moderator_or_higher()
  );

-- 2. Anyone can submit a comment, strictly forced to pending
DROP POLICY IF EXISTS "Anyone can submit comments as pending" ON public.comments;
CREATE POLICY "Anyone can submit comments as pending"
  ON public.comments FOR INSERT
  WITH CHECK (status = 'pending');

-- 3. Only moderators, editors, and admins can update comment status
DROP POLICY IF EXISTS "Moderators can update comment status" ON public.comments;
CREATE POLICY "Moderators can update comment status"
  ON public.comments FOR UPDATE
  USING (public.current_user_is_moderator_or_higher());

-- 4. Only moderators and admins can delete comments
DROP POLICY IF EXISTS "Moderators and admins can delete comments" ON public.comments;
CREATE POLICY "Moderators and admins can delete comments"
  ON public.comments FOR DELETE
  USING (public.current_user_is_moderator_or_higher());

-- ==============================================================================
-- 7. Newsletter Subscribers Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending_confirmation' CHECK (status IN ('pending_confirmation', 'confirmed', 'unsubscribed')),
  unsubscribe_token text NOT NULL UNIQUE DEFAULT md5(random()::text || clock_timestamp()::text),
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Newsletter Policies:
-- 1. SELECT: Strictly forbidden for public and readers. Only editors and admins can view subscriber lists.
DROP POLICY IF EXISTS "Only editors and admins can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Only editors and admins can view subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (public.current_user_is_editor_or_admin());

-- 2. INSERT: Anyone can sign up, strictly defaulting to pending_confirmation
DROP POLICY IF EXISTS "Public can sign up for newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can sign up for newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (status = 'pending_confirmation');

-- 3. UPDATE: Unsubscribe via token or editor/admin
DROP POLICY IF EXISTS "Subscribers can unsubscribe via token" ON public.newsletter_subscribers;
CREATE POLICY "Subscribers can unsubscribe via token"
  ON public.newsletter_subscribers FOR UPDATE
  USING (
    public.current_user_is_editor_or_admin()
    OR (
      NULLIF(current_setting('request.headers', true), '') IS NOT NULL
      AND (current_setting('request.headers', true)::json->>'x-unsubscribe-token') IS NOT NULL
      AND unsubscribe_token = (current_setting('request.headers', true)::json->>'x-unsubscribe-token')
    )
  );

-- ==============================================================================
-- 8. Supabase Storage Buckets & Policies (article-media)
-- ==============================================================================
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('article-media', 'article-media', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Storage bucket creation handled via Supabase dashboard: %', SQLERRM;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can read article media" ON storage.objects;
  CREATE POLICY "Public can read article media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'article-media');

  DROP POLICY IF EXISTS "Authors and editors can upload media" ON storage.objects;
  CREATE POLICY "Authors and editors can upload media"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'article-media'
      AND auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('author', 'editor', 'admin')
      )
    );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Storage object policy handled via Supabase dashboard: %', SQLERRM;
END $$;
