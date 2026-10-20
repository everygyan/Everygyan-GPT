-- ==============================================================================
-- EveryGyan Rollback Migration for 20261020000000_schema_and_rls.sql
-- WARNING: Executing this will drop the custom application tables.
-- Core auth.users records are left untouched.
-- ==============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_profile_role_protection();

DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.current_user_is_moderator_or_higher();
DROP FUNCTION IF EXISTS public.current_user_is_editor_or_admin();
DROP FUNCTION IF EXISTS public.current_user_has_role(text);
