-- Rollback: Drop navigation_menus and dynamic_pages tables
DROP TABLE IF EXISTS public.dynamic_pages CASCADE;
DROP TABLE IF EXISTS public.navigation_menus CASCADE;
