-- Rollback: Remove admin SELECT policy and atomic RPC
DROP POLICY IF EXISTS "Editors and admins can view all navigation" ON public.navigation_menus;
DROP FUNCTION IF EXISTS public.set_navigation_menu_visibility(uuid, boolean);
