import { supabase, isSupabaseConfigured } from './supabase';
import { NavigationMenuItem, DynamicPage } from '../types';

// ── Default hardcoded navigation (fallback when Supabase is not configured) ──

export const DEFAULT_NAVIGATION: NavigationMenuItem[] = [
  {
    id: 'nav-about', name: 'About us', type: 'link', path: '/about',
    display_order: 10, visible: true,
  },
  {
    id: 'nav-travel', name: 'Travel', type: 'dropdown', path: '/category/travel',
    display_order: 20, visible: true,
    children: [
      { id: 'nav-travel-world', name: 'World', type: 'link', path: '/category/travel-world', description: 'Global routes & round-the-world trips', display_order: 1, visible: true },
      { id: 'nav-travel-asia', name: 'Asia', type: 'link', path: '/category/travel-asia', description: 'Temples, beaches & cultural journeys', display_order: 2, visible: true },
      { id: 'nav-travel-europe', name: 'Europe', type: 'link', path: '/category/travel-europe', description: 'Historic cities & scenic alpine rail', display_order: 3, visible: true },
      { id: 'nav-travel-americas', name: 'Americas', type: 'link', path: '/category/travel-americas', description: 'National parks & coastal road trips', display_order: 4, visible: true },
      { id: 'nav-travel-health', name: 'Health', type: 'link', path: '/category/health', description: 'Wellness routines & longevity guides', display_order: 5, visible: true },
    ],
  },
  {
    id: 'nav-news', name: 'News', type: 'dropdown', path: '/category/news',
    display_order: 30, visible: true,
    children: [
      { id: 'nav-news-latest', name: 'Latest News', type: 'link', path: '/category/latest-news', description: 'Breaking stories & key daily headlines', display_order: 1, visible: true },
      { id: 'nav-news-world', name: 'World news', type: 'link', path: '/category/news-world', description: 'Geopolitics, climate accords & trade', display_order: 2, visible: true },
      { id: 'nav-news-asia', name: 'Asia news', type: 'link', path: '/category/news-asia', description: 'Regional development & championships', display_order: 3, visible: true },
      { id: 'nav-news-europe', name: 'Europe news', type: 'link', path: '/category/news-europe', description: 'European policy & energy transition', display_order: 4, visible: true },
      { id: 'nav-news-americas', name: 'Americas News', type: 'link', path: '/category/news-americas', description: 'Space exploration, tech & policy', display_order: 5, visible: true },
    ],
  },
  {
    id: 'nav-learn', name: 'Learn', type: 'dropdown', path: '/category/learn',
    display_order: 40, visible: true,
    children: [
      { id: 'nav-learn-ai', name: 'AI', type: 'link', path: '/category/learn-ai', description: 'Multimodal AI & autonomous agents', display_order: 1, visible: true },
      { id: 'nav-learn-sap', name: 'SAP', type: 'link', path: '/category/learn-sap', description: 'S/4HANA, ABAP RAP & CDS tutorials', display_order: 2, visible: true },
      { id: 'nav-learn-german', name: 'German', type: 'link', path: '/category/learn-german', description: 'Grammar rules & workplace communication', display_order: 3, visible: true },
      { id: 'nav-learn-updates', name: 'Latest Updates', type: 'link', path: '/category/learn-updates', description: 'Cloud certifications & tech roadmaps', display_order: 4, visible: true },
    ],
  },
  {
    id: 'nav-entertainment', name: 'Entertainment', type: 'dropdown', path: '/category/entertainment',
    display_order: 50, visible: true,
    children: [
      { id: 'nav-ent-movies', name: 'Movies', type: 'link', path: '/category/entertainment-movies', description: 'Cinema critiques, 70mm & IMAX', display_order: 1, visible: true },
      { id: 'nav-ent-series', name: 'Series', type: 'link', path: '/category/entertainment-series', description: 'Prestige limited series & streaming', display_order: 2, visible: true },
      { id: 'nav-ent-celeb', name: 'Celeb news', type: 'link', path: '/category/entertainment-celeb-news', description: 'Interviews, Cannes & red carpets', display_order: 3, visible: true },
      { id: 'nav-ent-photos', name: 'Photos', type: 'link', path: '/category/entertainment-photos', description: 'Wildlife photography & ancient marvels', display_order: 4, visible: true },
      { id: 'nav-ent-games', name: 'Games', type: 'link', path: '/category/entertainment-games', description: 'Mobile, console & PC gaming news', display_order: 5, visible: true },
    ],
  },
  {
    id: 'nav-deals', name: 'Deals', type: 'link', path: '/deals', badge: 'Hot',
    display_order: 60, visible: true,
  },
];

// In-memory cache
let cachedNavigation: NavigationMenuItem[] = [...DEFAULT_NAVIGATION];

function mapRow(row: Record<string, unknown>): NavigationMenuItem {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    type: (row.type === 'dropdown' ? 'dropdown' : 'link') as 'link' | 'dropdown',
    path: String(row.path || ''),
    description: row.description ? String(row.description) : undefined,
    badge: row.badge ? String(row.badge) : undefined,
    display_order: Number(row.display_order ?? 0),
    visible: Boolean(row.visible ?? true),
    parent_id: row.parent_id ? String(row.parent_id) : null,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function buildTree(flatItems: NavigationMenuItem[]): NavigationMenuItem[] {
  const topLevel = flatItems
    .filter((item) => !item.parent_id)
    .sort((a, b) => a.display_order - b.display_order);

  return topLevel.map((parent) => ({
    ...parent,
    children: flatItems
      .filter((child) => child.parent_id === parent.id)
      .sort((a, b) => a.display_order - b.display_order),
  }));
}

/**
 * Fetch the full navigation menu tree.
 */
export async function fetchNavigationMenu(): Promise<NavigationMenuItem[]> {
  if (!isSupabaseConfigured) {
    return [...cachedNavigation];
  }

  try {
    const { data, error } = await supabase
      .from('navigation_menus')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('[navigationService] Supabase returned no data, using defaults');
      return [...cachedNavigation];
    }

    const flatItems = (data as Record<string, unknown>[]).map(mapRow);
    const tree = buildTree(flatItems);
    cachedNavigation = tree;
    return tree;
  } catch (err) {
    console.warn('[navigationService] Failed to fetch navigation:', err);
    return [...cachedNavigation];
  }
}

/**
 * Fetch ALL navigation items flat (for dashboard management). Includes hidden ones.
 */
export async function fetchAllNavigationItemsFlat(): Promise<NavigationMenuItem[]> {
  if (!isSupabaseConfigured) {
    const flat: NavigationMenuItem[] = [];
    for (const item of DEFAULT_NAVIGATION) {
      flat.push({ ...item, children: undefined });
      if (item.children) {
        for (const child of item.children) {
          flat.push({ ...child, parent_id: item.id });
        }
      }
    }
    return flat;
  }

  try {
    // Use RPC or direct query that bypasses the visible=true RLS
    // Since the dashboard user is editor/admin, they can see all rows
    // but the RLS policy only allows visible=true for SELECT.
    // We need a separate policy or use the service role.
    // For now, fetch all and let RLS handle it — admins need a policy to see hidden items too.
    // We'll add an "admin can read all" policy.
    const { data, error } = await supabase
      .from('navigation_menus')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data) {
      console.warn('[navigationService] fetchAllFlat error:', error);
      return [];
    }

    return (data as Record<string, unknown>[]).map(mapRow);
  } catch (err) {
    console.warn('[navigationService] fetchAllFlat failed:', err);
    return [];
  }
}

/**
 * Create a new navigation menu item
 */
export async function createNavigationItem(
  item: Omit<NavigationMenuItem, 'id' | 'children' | 'created_at' | 'updated_at'>
): Promise<{ item: NavigationMenuItem | null; error?: string }> {
  if (!isSupabaseConfigured) {
    const newItem: NavigationMenuItem = {
      ...item,
      id: `nav-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { item: newItem };
  }

  try {
    const payload: Record<string, unknown> = {
      name: item.name,
      type: item.type,
      path: item.path,
      description: item.description || null,
      badge: item.badge || null,
      display_order: item.display_order,
      visible: item.visible,
      parent_id: item.parent_id || null,
    };

    const { data, error } = await supabase
      .from('navigation_menus')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return { item: null, error: error.message };
    }

    return { item: mapRow(data as Record<string, unknown>) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create navigation item';
    return { item: null, error: message };
  }
}

/**
 * Update an existing navigation menu item
 */
export async function updateNavigationItem(
  id: string,
  updates: Partial<NavigationMenuItem>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.path !== undefined) payload.path = updates.path;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.badge !== undefined) payload.badge = updates.badge;
    if (updates.display_order !== undefined) payload.display_order = updates.display_order;
    if (updates.visible !== undefined) payload.visible = updates.visible;
    if (updates.parent_id !== undefined) payload.parent_id = updates.parent_id;

    const { error } = await supabase
      .from('navigation_menus')
      .update(payload)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update navigation item';
    return { success: false, error: message };
  }
}

/**
 * Delete a navigation menu item
 */
export async function deleteNavigationItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('navigation_menus')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete navigation item';
    return { success: false, error: message };
  }
}

// ── Dynamic Pages ──

let localPages: DynamicPage[] = [];

function mapPageRow(row: Record<string, unknown>): DynamicPage {
  return {
    id: String(row.id),
    title: String(row.title || ''),
    slug: String(row.slug || ''),
    description: row.description ? String(row.description) : undefined,
    icon: String(row.icon || 'FileText'),
    color: String(row.color || 'slate'),
    page_type: (row.page_type === 'custom' ? 'custom' : 'category') as 'category' | 'custom',
    is_active: Boolean(row.is_active ?? true),
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function fetchDynamicPages(): Promise<DynamicPage[]> {
  if (!isSupabaseConfigured) {
    return [...localPages];
  }

  try {
    const { data, error } = await supabase
      .from('dynamic_pages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [...localPages];
    }

    const pages = (data as Record<string, unknown>[]).map(mapPageRow);
    localPages = pages;
    return pages;
  } catch (err) {
    console.warn('[navigationService] fetchDynamicPages failed:', err);
    return [...localPages];
  }
}

export async function createDynamicPage(
  page: Omit<DynamicPage, 'id' | 'created_at' | 'updated_at'>
): Promise<{ page: DynamicPage | null; error?: string }> {
  if (!isSupabaseConfigured) {
    const newPage: DynamicPage = {
      ...page,
      id: `page-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localPages.push(newPage);
    return { page: newPage };
  }

  try {
    const { data, error } = await supabase
      .from('dynamic_pages')
      .insert({
        title: page.title,
        slug: page.slug,
        description: page.description || null,
        icon: page.icon,
        color: page.color,
        page_type: page.page_type,
        is_active: page.is_active,
      })
      .select('*')
      .single();

    if (error) {
      return { page: null, error: error.message };
    }

    const created = mapPageRow(data as Record<string, unknown>);
    localPages.push(created);
    return { page: created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create page';
    return { page: null, error: message };
  }
}

export async function deleteDynamicPage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  localPages = localPages.filter((p) => p.id !== id);

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('dynamic_pages').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete page';
    return { success: false, error: message };
  }
}
