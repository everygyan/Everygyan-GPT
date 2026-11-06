-- =============================================================
-- Migration: Fix Navigation Menus RLS & Admin Visibility Management
-- Date: 2026-11-06
-- Description:
--   1. Allows editors and admins to SELECT all navigation rows (even when hidden).
--   2. Ensures editors and admins can UPDATE hidden navigation items back to visible.
--   3. Adds set_navigation_menu_visibility RPC for atomic toggle.
-- =============================================================

-- 1. Add policy for editors and admins to read ALL navigation menu items (including hidden)
DROP POLICY IF EXISTS "Editors and admins can view all navigation" ON public.navigation_menus;
CREATE POLICY "Editors and admins can view all navigation"
  ON public.navigation_menus FOR SELECT
  USING (current_user_is_editor_or_admin());

-- 2. Ensure update policy allows updates for both visible and hidden rows
DROP POLICY IF EXISTS "Editors and admins can update navigation" ON public.navigation_menus;
CREATE POLICY "Editors and admins can update navigation"
  ON public.navigation_menus FOR UPDATE
  USING (current_user_is_editor_or_admin())
  WITH CHECK (current_user_is_editor_or_admin());

-- 3. Atomic RPC to set menu visibility
CREATE OR REPLACE FUNCTION public.set_navigation_menu_visibility(
  menu_id uuid,
  is_visible boolean
)
RETURNS boolean AS $$
BEGIN
  IF NOT current_user_is_editor_or_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only editors and administrators can update navigation visibility.';
  END IF;

  UPDATE public.navigation_menus
  SET
    visible = is_visible,
    updated_at = now()
  WHERE id = menu_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
