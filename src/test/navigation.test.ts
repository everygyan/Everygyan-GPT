import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchNavigationMenu,
  updateNavigationItem,
  deleteNavigationItem,
  createNavigationItem,
  getSelectableParents,
  getAllNavigationCategories,
  findDescendantSlugs,
  LOCAL_NAV_OVERRIDES_KEY,
} from '../services/navigationService';
import { fetchArticlesByCategoryPaginated } from '../services/articleService';

describe('Navigation Menu Visibility & Persistence Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default navigation with all items visible initially', async () => {
    const menu = await fetchNavigationMenu();
    expect(menu.length).toBeGreaterThan(0);

    const aboutItem = menu.find((item) => item.name === 'About us');
    expect(aboutItem).toBeDefined();
    expect(aboutItem?.visible).toBe(true);

    const newsItem = menu.find((item) => item.name === 'News');
    expect(newsItem).toBeDefined();
    expect(newsItem?.visible).toBe(true);
    expect(newsItem?.children?.length).toBeGreaterThan(0);

    const worldNews = newsItem?.children?.find((c) => c.name === 'World news');
    expect(worldNews).toBeDefined();
    expect(worldNews?.visible).toBe(true);
  });

  it('hides top-level item and persists across repeated fetches', async () => {
    // Hide 'About us'
    await updateNavigationItem('nav-about', { visible: false }, '/about');

    const updatedMenu = await fetchNavigationMenu();
    const aboutItem = updatedMenu.find((item) => item.path === '/about');
    expect(aboutItem).toBeDefined();
    expect(aboutItem?.visible).toBe(false);

    // Verify localStorage has persisted the override
    const rawOverrides = localStorage.getItem(LOCAL_NAV_OVERRIDES_KEY);
    expect(rawOverrides).not.toBeNull();
    const parsed = JSON.parse(rawOverrides || '{}');
    expect(parsed['nav-about']?.visible).toBe(false);
    expect(parsed['/about']?.visible).toBe(false);
  });

  it('hides child navigation item (e.g. World news) and keeps parent visible', async () => {
    // Hide 'World news' by path and id
    await updateNavigationItem('nav-news-world', { visible: false }, '/category/news-world');

    const menu = await fetchNavigationMenu();
    const newsParent = menu.find((item) => item.name === 'News');
    expect(newsParent).toBeDefined();
    expect(newsParent?.visible).toBe(true);

    const worldNews = newsParent?.children?.find((c) => c.path === '/category/news-world');
    expect(worldNews).toBeDefined();
    expect(worldNews?.visible).toBe(false);

    // Other children like Latest News should remain visible
    const latestNews = newsParent?.children?.find((c) => c.path === '/category/latest-news');
    expect(latestNews).toBeDefined();
    expect(latestNews?.visible).toBe(true);
  });

  it('supports path-based overrides for UUID/custom IDs interchangeably', async () => {
    // Simulate Supabase UUID row for Asia news
    const fakeUuid = '0166c7fc-0e60-4542-8934-3e359640946c';
    await updateNavigationItem(fakeUuid, { visible: false }, '/category/news-asia');

    const menu = await fetchNavigationMenu();
    const newsParent = menu.find((item) => item.name === 'News');
    const asiaNews = newsParent?.children?.find((c) => c.path === '/category/news-asia');

    expect(asiaNews).toBeDefined();
    expect(asiaNews?.visible).toBe(false);
  });

  it('dispatches everygyan:navigation-updated event on visibility change', async () => {
    const listener = vi.fn();
    window.addEventListener('everygyan:navigation-updated', listener);

    await updateNavigationItem('nav-deals', { visible: false }, '/deals');

    expect(listener).toHaveBeenCalled();
    window.removeEventListener('everygyan:navigation-updated', listener);
  });

  it('restores visibility when unhidden', async () => {
    // First hide
    await updateNavigationItem('nav-about', { visible: false }, '/about');
    let menu = await fetchNavigationMenu();
    expect(menu.find((i) => i.path === '/about')?.visible).toBe(false);

    // Now unhide
    await updateNavigationItem('nav-about', { visible: true }, '/about');
    menu = await fetchNavigationMenu();
    expect(menu.find((i) => i.path === '/about')?.visible).toBe(true);
  });

  it('marks deleted items as hidden and persists deletion locally', async () => {
    await deleteNavigationItem('nav-travel-world', '/category/travel-world');

    const menu = await fetchNavigationMenu();
    const travelParent = menu.find((item) => item.name === 'Travel');
    const deletedChild = travelParent?.children?.find((c) => c.path === '/category/travel-world');

    // Item should either be excluded or marked hidden
    expect(deletedChild === undefined || deletedChild?.visible === false).toBe(true);
  });

  // ── Multi-Level Navigation & Sub-Page Hierarchy Tests ──

  it('supports adding a sub-page under an existing sub-page (e.g. Japan under Asia)', async () => {
    // 1. Add "Japan" with parent "nav-travel-asia" (Asia under Travel)
    const addResult = await createNavigationItem({
      name: 'Japan',
      type: 'link',
      path: '/category/travel-asia/japan',
      description: 'Ancient temples, Tokyo districts & bullet trains',
      display_order: 1,
      visible: true,
      parent_id: 'nav-travel-asia',
    });

    expect(addResult.item).toBeDefined();
    expect(addResult.item?.name).toBe('Japan');

    // 2. Fetch navigation menu and verify 3-level hierarchy
    const menu = await fetchNavigationMenu();
    const travel = menu.find((item) => item.name === 'Travel');
    expect(travel).toBeDefined();

    const asia = travel?.children?.find((child) => child.id === 'nav-travel-asia' || child.name === 'Asia');
    expect(asia).toBeDefined();
    expect(asia?.children).toBeDefined();

    const japan = asia?.children?.find((sub) => sub.name === 'Japan');
    expect(japan).toBeDefined();
    expect(japan?.path).toBe('/category/travel-asia/japan');
    expect(japan?.visible).toBe(true);
  });

  it('getSelectableParents lists multi-level hierarchy with depth and lineage', async () => {
    const menu = await fetchNavigationMenu();
    const selectable = getSelectableParents(menu);

    expect(selectable.length).toBeGreaterThan(0);

    const travelParent = selectable.find((p) => p.name === 'Travel');
    expect(travelParent).toBeDefined();
    expect(travelParent?.depth).toBe(0);

    const asiaSub = selectable.find((p) => p.lineage === 'Travel > Asia');
    expect(asiaSub).toBeDefined();
    expect(asiaSub?.depth).toBe(1);
  });

  it('findDescendantSlugs correctly finds all nested slugs under a parent category', async () => {
    await createNavigationItem({
      name: 'Japan',
      type: 'link',
      path: '/category/travel-asia/japan',
      display_order: 1,
      visible: true,
      parent_id: 'nav-travel-asia',
    });

    const menu = await fetchNavigationMenu();
    const descendants = findDescendantSlugs(menu, 'travel-asia');

    expect(descendants).toContain('travel-asia/japan');
    expect(descendants).toContain('japan');
  });

  it('getAllNavigationCategories extracts all categories with lineage for ArticleEditor', async () => {
    await createNavigationItem({
      name: 'Japan',
      type: 'link',
      path: '/category/travel-asia/japan',
      display_order: 1,
      visible: true,
      parent_id: 'nav-travel-asia',
    });

    const menu = await fetchNavigationMenu();
    const categories = getAllNavigationCategories(menu);

    const japanCat = categories.find((c) => c.name === 'Japan');
    expect(japanCat).toBeDefined();
    expect(japanCat?.displayName).toBe('Travel > Asia > Japan');
  });

  it('fetchArticlesByCategoryPaginated includes descendant sub-page articles when viewing parent (Asia)', async () => {
    // There is an article about Kyoto and Tokyo with tag "Japan" and category "Asia Travel"
    const asiaResult = await fetchArticlesByCategoryPaginated('travel-asia', 1, 10);
    expect(asiaResult.total).toBeGreaterThan(0);

    const hasJapanArticle = asiaResult.items.some(
      (a) => a.title.includes('Kyoto') || a.tags.includes('Japan')
    );
    expect(hasJapanArticle).toBe(true);

    // Also querying directly for 'japan' or 'travel-asia/japan' returns the Japan articles
    const japanResult = await fetchArticlesByCategoryPaginated('travel-asia/japan', 1, 10);
    expect(japanResult.total).toBeGreaterThan(0);
    const hasJapanArticleDirect = japanResult.items.some(
      (a) =>
        a.title.toLowerCase().includes('japan') ||
        a.category.toLowerCase().includes('japan') ||
        (a.tags && a.tags.includes('Japan'))
    );
    expect(hasJapanArticleDirect).toBe(true);
  });
});
