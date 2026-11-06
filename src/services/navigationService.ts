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

// ── Local Storage & Cache Resilience ──
export const LOCAL_NAV_OVERRIDES_KEY = 'everygyan_navigation_overrides';
export const LOCAL_NAV_STORAGE_KEY = 'everygyan_navigation_tree';

type NavigationOverrideMap = Record<string, { visible?: boolean; name?: string; display_order?: number }>;

function getLocalOverrides(): NavigationOverrideMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_NAV_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalOverride(idOrPath: string, updates: Partial<NavigationMenuItem>, altKey?: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalOverrides();
    const existing = current[idOrPath] || {};
    const updated = {
      ...existing,
      ...(updates.visible !== undefined ? { visible: updates.visible } : {}),
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.display_order !== undefined ? { display_order: updates.display_order } : {}),
    };
    current[idOrPath] = updated;
    if (altKey) {
      current[altKey] = updated;
    }
    localStorage.setItem(LOCAL_NAV_OVERRIDES_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('[navigationService] Failed to save local override:', err);
  }
}

function getTreeFromStorage(): NavigationMenuItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_NAV_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveTreeToStorage(tree: NavigationMenuItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_NAV_STORAGE_KEY, JSON.stringify(tree));
  } catch (err) {
    console.warn('[navigationService] Failed to cache navigation tree:', err);
  }
}

export function broadcastNavUpdate(detail?: unknown) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('everygyan:navigation-updated', { detail }));
  }
}

function applyOverrides(tree: NavigationMenuItem[]): NavigationMenuItem[] {
  const overrides = getLocalOverrides();
  if (Object.keys(overrides).length === 0) return tree;

  return tree.map((parent) => {
    const parentOverride = overrides[parent.id] ?? (parent.path ? overrides[parent.path] : undefined);
    const updatedParent: NavigationMenuItem = {
      ...parent,
      ...(parentOverride?.visible !== undefined ? { visible: parentOverride.visible } : {}),
      ...(parentOverride?.name !== undefined ? { name: parentOverride.name } : {}),
      ...(parentOverride?.display_order !== undefined ? { display_order: parentOverride.display_order } : {}),
    };

    if (parent.children && parent.children.length > 0) {
      updatedParent.children = parent.children.map((child) => {
        const childOverride = overrides[child.id] ?? (child.path ? overrides[child.path] : undefined);
        return {
          ...child,
          ...(childOverride?.visible !== undefined ? { visible: childOverride.visible } : {}),
          ...(childOverride?.name !== undefined ? { name: childOverride.name } : {}),
          ...(childOverride?.display_order !== undefined ? { display_order: childOverride.display_order } : {}),
        };
      });
    }

    return updatedParent;
  });
}

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
    const saved = getTreeFromStorage();
    const base = saved && saved.length > 0 ? saved : cachedNavigation;
    const finalTree = applyOverrides(base);
    cachedNavigation = finalTree;
    return [...finalTree];
  }

  try {
    const { data, error } = await supabase
      .from('navigation_menus')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('[navigationService] Supabase returned no data, using local/defaults');
      const saved = getTreeFromStorage();
      const base = saved && saved.length > 0 ? saved : cachedNavigation;
      const finalTree = applyOverrides(base);
      cachedNavigation = finalTree;
      return [...finalTree];
    }

    const flatItems = (data as Record<string, unknown>[]).map(mapRow);
    const tree = buildTree(flatItems);
    const finalTree = applyOverrides(tree);
    cachedNavigation = finalTree;
    saveTreeToStorage(finalTree);
    return finalTree;
  } catch (err) {
    console.warn('[navigationService] Failed to fetch navigation:', err);
    const saved = getTreeFromStorage();
    const base = saved && saved.length > 0 ? saved : cachedNavigation;
    const finalTree = applyOverrides(base);
    cachedNavigation = finalTree;
    return [...finalTree];
  }
}

/**
 * Fetch ALL navigation items flat (for dashboard management). Includes hidden ones.
 */
export async function fetchAllNavigationItemsFlat(): Promise<NavigationMenuItem[]> {
  const tree = await fetchNavigationMenu();
  const flat: NavigationMenuItem[] = [];
  for (const item of tree) {
    flat.push({ ...item, children: undefined });
    if (item.children) {
      for (const child of item.children) {
        flat.push({ ...child, parent_id: item.id });
      }
    }
  }
  return flat;
}

/**
 * Create a new navigation menu item
 */
export async function createNavigationItem(
  item: Omit<NavigationMenuItem, 'id' | 'children' | 'created_at' | 'updated_at'>
): Promise<{ item: NavigationMenuItem | null; error?: string }> {
  const newItem: NavigationMenuItem = {
    ...item,
    id: `nav-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (newItem.parent_id) {
    cachedNavigation = cachedNavigation.map((parent) => {
      if (parent.id === newItem.parent_id) {
        return {
          ...parent,
          children: [...(parent.children || []), newItem],
        };
      }
      return parent;
    });
  } else {
    cachedNavigation.push(newItem);
  }

  saveTreeToStorage(cachedNavigation);
  broadcastNavUpdate({ item: newItem });

  if (!isSupabaseConfigured) {
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

    const isParentUuid = newItem.parent_id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newItem.parent_id) : true;
    if (!isParentUuid) {
      payload.parent_id = null;
    }

    const { data, error } = await supabase
      .from('navigation_menus')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.warn('[navigationService] Supabase insert warning:', error);
      return { item: newItem };
    }

    const created = mapRow(data as Record<string, unknown>);
    return { item: created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create navigation item';
    return { item: newItem, error: message };
  }
}

/**
 * Update an existing navigation menu item
 */
export async function updateNavigationItem(
  id: string,
  updates: Partial<NavigationMenuItem>,
  itemPath?: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Immediately persist to localStorage overrides (keyed by ID and path)
  saveLocalOverride(id, updates, itemPath);

  // 2. Immediately update in-memory cache
  cachedNavigation = cachedNavigation.map((parent) => {
    const matchesParent = parent.id === id || (itemPath && parent.path === itemPath);
    const updatedParent = matchesParent ? { ...parent, ...updates } : parent;

    if (updatedParent.children) {
      return {
        ...updatedParent,
        children: updatedParent.children.map((child) => {
          const matchesChild = child.id === id || (itemPath && child.path === itemPath);
          return matchesChild ? { ...child, ...updates } : child;
        }),
      };
    }
    return updatedParent;
  });

  saveTreeToStorage(cachedNavigation);

  // 3. Broadcast real-time event to all listening components
  broadcastNavUpdate({ id, updates, path: itemPath });

  // 4. Also persist to Supabase if configured
  if (isSupabaseConfigured) {
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

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('navigation_menus').update(payload).eq('id', id);
      } else {
        const pathToMatch = itemPath || updates.path;
        if (pathToMatch) {
          await supabase.from('navigation_menus').update(payload).eq('path', pathToMatch);
        }
      }
    } catch (err) {
      console.warn('[navigationService] Supabase update warning:', err);
    }
  }

  return { success: true };
}

/**
 * Delete a navigation menu item
 */
export async function deleteNavigationItem(
  id: string,
  itemPath?: string
): Promise<{ success: boolean; error?: string }> {
  // Mark as hidden & remove from local cache
  saveLocalOverride(id, { visible: false }, itemPath);

  cachedNavigation = cachedNavigation
    .filter((parent) => parent.id !== id && (!itemPath || parent.path !== itemPath))
    .map((parent) => ({
      ...parent,
      children: parent.children?.filter((child) => child.id !== id && (!itemPath || child.path !== itemPath)),
    }));

  saveTreeToStorage(cachedNavigation);
  broadcastNavUpdate({ id, deleted: true, path: itemPath });

  if (isSupabaseConfigured) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase.from('navigation_menus').delete().eq('id', id);
      } else if (itemPath) {
        await supabase.from('navigation_menus').delete().eq('path', itemPath);
      }
    } catch (err) {
      console.warn('[navigationService] Supabase delete warning:', err);
    }
  }

  return { success: true };
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
