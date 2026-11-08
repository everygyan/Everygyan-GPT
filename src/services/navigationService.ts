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

type NavigationOverrideMap = Record<string, { visible?: boolean; name?: string; display_order?: number; parent_id?: string | null }>;

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
      ...(updates.parent_id !== undefined ? { parent_id: updates.parent_id } : {}),
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

  const applyRecursive = (items: NavigationMenuItem[]): NavigationMenuItem[] => {
    return items.map((item) => {
      const itemOverride = overrides[item.id] ?? (item.path ? overrides[item.path] : undefined);
      const updated: NavigationMenuItem = {
        ...item,
        ...(itemOverride?.visible !== undefined ? { visible: itemOverride.visible } : {}),
        ...(itemOverride?.name !== undefined ? { name: itemOverride.name } : {}),
        ...(itemOverride?.display_order !== undefined ? { display_order: itemOverride.display_order } : {}),
      };

      if (item.children && item.children.length > 0) {
        updated.children = applyRecursive(item.children);
      }

      return updated;
    });
  };

  return applyRecursive(tree);
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
  const itemMap = new Map<string, NavigationMenuItem>();
  const pathToItemMap = new Map<string, NavigationMenuItem>();

  flatItems.forEach((item) => {
    const node: NavigationMenuItem = { ...item, children: [] };
    itemMap.set(item.id, node);
    if (item.path) {
      pathToItemMap.set(item.path, node);
      const normPath = item.path.toLowerCase().replace(/^\/+|\/+$/g, '');
      pathToItemMap.set(normPath, node);
    }
  });

  const roots: NavigationMenuItem[] = [];

  flatItems.forEach((item) => {
    const current = itemMap.get(item.id)!;
    let parent: NavigationMenuItem | undefined;

    if (item.parent_id) {
      parent = itemMap.get(item.parent_id);
      if (!parent) {
        parent = pathToItemMap.get(item.parent_id);
      }
      if (!parent && item.parent_id.startsWith('nav-')) {
        const slug = item.parent_id.replace(/^nav-/, '');
        parent = pathToItemMap.get(slug) || pathToItemMap.get(`category/${slug}`);
      }
    }

    if (parent) {
      parent.children = parent.children || [];
      if (!parent.children.some((c) => c.id === current.id || (c.path && c.path === current.path))) {
        parent.children.push(current);
      }
    } else {
      roots.push(current);
    }
  });

  const sortRecursive = (items: NavigationMenuItem[]): NavigationMenuItem[] => {
    items.sort((a, b) => a.display_order - b.display_order);
    items.forEach((child) => {
      if (child.children && child.children.length > 0) {
        sortRecursive(child.children);
      }
    });
    return items;
  };

  return sortRecursive(roots);
}

/**
 * Finds a node anywhere in the navigation tree by ID or path.
 */
export function findNodeInTree(nodes: NavigationMenuItem[], idOrPath: string): NavigationMenuItem | null {
  for (const node of nodes) {
    if (node.id === idOrPath || node.path === idOrPath) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeInTree(node.children, idOrPath);
      if (found) return found;
    }
  }
  return null;
}

export interface SelectableParentItem {
  id: string;
  name: string;
  path: string;
  lineage: string;
  depth: number;
}

/**
 * Returns all selectable parents across all levels with formatted lineage (e.g. Travel > Asia)
 */
export function getSelectableParents(tree: NavigationMenuItem[]): SelectableParentItem[] {
  const result: SelectableParentItem[] = [];

  const traverse = (items: NavigationMenuItem[], lineage: string[] = [], depth: number = 0) => {
    for (const item of items) {
      const currentLineage = [...lineage, item.name];
      result.push({
        id: item.id,
        name: item.name,
        path: item.path,
        lineage: currentLineage.join(' > '),
        depth,
      });

      if (item.children && item.children.length > 0) {
        traverse(item.children, currentLineage, depth + 1);
      }
    }
  };

  traverse(tree);
  return result;
}

export interface NavigationCategoryOption {
  id: string;
  name: string;
  slug: string;
  displayName: string;
  depth: number;
  path: string;
}

/**
 * Returns all categories and subcategories defined in navigation for ArticleEditor and filters.
 */
export function getAllNavigationCategories(tree: NavigationMenuItem[]): NavigationCategoryOption[] {
  const categories: NavigationCategoryOption[] = [];

  const traverse = (items: NavigationMenuItem[], parents: string[] = [], depth: number = 0) => {
    for (const item of items) {
      let slug = '';
      if (item.path.startsWith('/category/')) {
        slug = item.path.replace('/category/', '').trim();
      } else {
        slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      const fullLineage = [...parents, item.name];

      if (item.path.startsWith('/category/') || depth > 0) {
        categories.push({
          id: item.id,
          name: item.name,
          slug,
          displayName: fullLineage.join(' > '),
          depth,
          path: item.path,
        });
      }

      if (item.children && item.children.length > 0) {
        traverse(item.children, fullLineage, depth + 1);
      }
    }
  };

  traverse(tree);
  return categories;
}

/**
 * Returns all descendant slugs/names for a given category slug.
 * Useful for rolled-up article archives (e.g. clicking Asia shows Japan articles).
 */
export function findDescendantSlugs(tree: NavigationMenuItem[], categorySlug: string): string[] {
  const normalized = categorySlug.toLowerCase().trim();
  const normalizedLast = normalized.split('/').pop() || normalized;
  const descendants: string[] = [];

  const traverse = (items: NavigationMenuItem[], underTarget: boolean) => {
    for (const item of items) {
      let itemSlug = '';
      if (item.path.startsWith('/category/')) {
        itemSlug = item.path.replace('/category/', '').toLowerCase().trim();
      } else {
        itemSlug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      const itemLast = itemSlug.split('/').pop() || itemSlug;

      const isMatch =
        itemSlug === normalized ||
        itemLast === normalizedLast ||
        item.name.toLowerCase() === normalized ||
        item.name.toLowerCase() === normalizedLast ||
        item.path.toLowerCase() === `/category/${normalized}`;

      const currentlyUnder = underTarget || isMatch;

      if (underTarget) {
        descendants.push(itemSlug);
        if (itemSlug.includes('/')) {
          descendants.push(itemSlug.split('/').pop()!);
        }
        descendants.push(item.name.toLowerCase());
      }

      if (item.children && item.children.length > 0) {
        traverse(item.children, currentlyUnder);
      }
    }
  };

  traverse(tree, false);
  return [...new Set(descendants)];
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
    const overrides = getLocalOverrides();

    // 1. Apply local overrides (visible, name, display_order, parent_id)
    flatItems.forEach((item) => {
      const override = overrides[item.id] ?? (item.path ? overrides[item.path] : undefined);
      if (override) {
        if (override.visible !== undefined) item.visible = override.visible;
        if (override.name !== undefined) item.name = override.name;
        if (override.display_order !== undefined) item.display_order = override.display_order;
        if (override.parent_id !== undefined) item.parent_id = override.parent_id;
      }
    });

    // 2. Merge locally created/updated items from storage/cache
    const savedTree = getTreeFromStorage();
    const sourceTree = savedTree && savedTree.length > 0 ? savedTree : cachedNavigation;
    if (sourceTree && sourceTree.length > 0) {
      const localFlat: NavigationMenuItem[] = [];
      const collectFlat = (nodes: NavigationMenuItem[], parentId: string | null = null) => {
        for (const n of nodes) {
          localFlat.push({ ...n, parent_id: n.parent_id || parentId, children: undefined });
          if (n.children && n.children.length > 0) {
            collectFlat(n.children, n.id);
          }
        }
      };
      collectFlat(sourceTree);

      for (const localItem of localFlat) {
        const existingIdx = flatItems.findIndex(
          (dbItem) => dbItem.id === localItem.id || (dbItem.path && dbItem.path === localItem.path)
        );
        if (existingIdx === -1) {
          flatItems.push(localItem);
        } else if (localItem.parent_id && localItem.parent_id !== flatItems[existingIdx].parent_id) {
          flatItems[existingIdx].parent_id = localItem.parent_id;
        }
      }
    }

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

  const flattenRecursive = (nodes: NavigationMenuItem[], parentId: string | null = null) => {
    for (const node of nodes) {
      flat.push({ ...node, parent_id: parentId, children: undefined });
      if (node.children && node.children.length > 0) {
        flattenRecursive(node.children, node.id);
      }
    }
  };

  flattenRecursive(tree);
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
    children: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Helper to insert into tree at any depth
  const insertRecursive = (nodes: NavigationMenuItem[]): boolean => {
    for (const node of nodes) {
      if (node.id === newItem.parent_id || (newItem.parent_id && node.path === newItem.parent_id)) {
        node.children = [...(node.children || []), newItem];
        return true;
      }
      if (node.children && node.children.length > 0) {
        if (insertRecursive(node.children)) return true;
      }
    }
    return false;
  };

  if (newItem.parent_id) {
    const inserted = insertRecursive(cachedNavigation);
    if (!inserted) {
      cachedNavigation.push(newItem);
    }
  } else {
    cachedNavigation.push(newItem);
  }

  saveLocalOverride(
    newItem.id,
    {
      visible: newItem.visible,
      name: newItem.name,
      parent_id: newItem.parent_id,
      display_order: newItem.display_order,
    },
    newItem.path
  );

  saveTreeToStorage(cachedNavigation);
  broadcastNavUpdate({ item: newItem });

  if (!isSupabaseConfigured) {
    return { item: newItem };
  }

  try {
    let resolvedParentUuid: string | null = null;
    if (newItem.parent_id) {
      const isParentUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newItem.parent_id);
      if (isParentUuid) {
        resolvedParentUuid = newItem.parent_id;
      } else {
        const parentNode = findNodeInTree(cachedNavigation, newItem.parent_id);
        if (parentNode) {
          const { data: parentRow } = await supabase
            .from('navigation_menus')
            .select('id')
            .eq('path', parentNode.path)
            .maybeSingle();

          if (parentRow?.id) {
            resolvedParentUuid = parentRow.id;
          }
        }
      }
    }

    const payload: Record<string, unknown> = {
      name: item.name,
      type: item.type,
      path: item.path,
      description: item.description || null,
      badge: item.badge || null,
      display_order: item.display_order,
      visible: item.visible,
      parent_id: resolvedParentUuid,
    };

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

  // 2. Immediately update in-memory cache recursively at any depth
  const updateRecursive = (nodes: NavigationMenuItem[]): NavigationMenuItem[] => {
    return nodes.map((node) => {
      const matches = node.id === id || (itemPath && node.path === itemPath);
      const updatedNode = matches ? { ...node, ...updates } : node;
      if (updatedNode.children && updatedNode.children.length > 0) {
        updatedNode.children = updateRecursive(updatedNode.children);
      }
      return updatedNode;
    });
  };

  cachedNavigation = updateRecursive(cachedNavigation);
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
  // Mark as hidden & remove from local cache recursively
  saveLocalOverride(id, { visible: false }, itemPath);

  const deleteRecursive = (nodes: NavigationMenuItem[]): NavigationMenuItem[] => {
    return nodes
      .filter((node) => node.id !== id && (!itemPath || node.path !== itemPath))
      .map((node) => ({
        ...node,
        children: node.children ? deleteRecursive(node.children) : undefined,
      }));
  };

  cachedNavigation = deleteRecursive(cachedNavigation);
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
