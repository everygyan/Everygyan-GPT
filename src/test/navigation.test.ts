import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchNavigationMenu,
  updateNavigationItem,
  deleteNavigationItem,
  LOCAL_NAV_OVERRIDES_KEY,
} from '../services/navigationService';

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
});
