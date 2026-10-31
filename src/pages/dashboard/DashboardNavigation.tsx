import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Eye, EyeOff, Save, ChevronDown, ChevronRight,
  GripVertical, AlertCircle, Check, FolderPlus, Link2, Layers,
} from 'lucide-react';
import { NavigationMenuItem, DynamicPage } from '../../types';
import {
  fetchNavigationMenu,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  fetchDynamicPages,
  createDynamicPage,
  deleteDynamicPage,
} from '../../services/navigationService';

type ActiveTab = 'menu' | 'pages';

// ── Shared tiny components ──

const Badge: React.FC<{ text: string; color?: string }> = ({ text, color = 'slate' }) => {
  const colors: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    slate: 'bg-slate-100 text-slate-600',
    amber: 'bg-amber-100 text-amber-700',
    violet: 'bg-violet-100 text-violet-700',
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${colors[color] || colors.slate}`}>
      {text}
    </span>
  );
};

const StatusDot: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
);

// ── Main component ──

export const DashboardNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('menu');
  const [menuItems, setMenuItems] = useState<NavigationMenuItem[]>([]);
  const [pages, setPages] = useState<DynamicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Expand state for parent items
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  // New item form
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'link' as 'link' | 'dropdown',
    path: '',
    description: '',
    badge: '',
    parent_id: '' as string,
    visible: true,
  });

  // New page form
  const [showNewPageForm, setShowNewPageForm] = useState(false);
  const [newPage, setNewPage] = useState({
    title: '',
    slug: '',
    description: '',
    icon: 'FileText',
    color: 'slate',
    parentMenuId: '',
    addToMenu: true,
  });

  const flash = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  // ── Load data ──
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [nav, pg] = await Promise.all([
          fetchNavigationMenu(),
          fetchDynamicPages(),
        ]);
        setMenuItems(nav);
        setPages(pg);
      } catch {
        flash('error', 'Failed to load navigation data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [flash]);

  // ── Toggle visibility ──
  const handleToggleVisibility = async (item: NavigationMenuItem) => {
    const newVisible = !item.visible;
    // Optimistic update
    setMenuItems((prev) =>
      prev.map((parent) => {
        if (parent.id === item.id) return { ...parent, visible: newVisible };
        if (parent.children) {
          return {
            ...parent,
            children: parent.children.map((child) =>
              child.id === item.id ? { ...child, visible: newVisible } : child
            ),
          };
        }
        return parent;
      })
    );

    const result = await updateNavigationItem(item.id, { visible: newVisible });
    if (!result.success) {
      flash('error', result.error || 'Failed to toggle visibility');
    }
  };

  // ── Delete menu item ──
  const handleDeleteMenuItem = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its sub-items?`)) return;

    setSaving(true);
    const result = await deleteNavigationItem(id);
    if (result.success) {
      setMenuItems((prev) =>
        prev
          .filter((item) => item.id !== id)
          .map((item) => ({
            ...item,
            children: item.children?.filter((child) => child.id !== id),
          }))
      );
      flash('success', `"${name}" deleted`);
    } else {
      flash('error', result.error || 'Failed to delete item');
    }
    setSaving(false);
  };

  // ── Add new menu item ──
  const handleAddMenuItem = async () => {
    if (!newItem.name.trim() || !newItem.path.trim()) {
      flash('error', 'Name and path are required');
      return;
    }

    setSaving(true);

    // Calculate display_order
    let displayOrder = 10;
    if (newItem.parent_id) {
      const parent = menuItems.find((m) => m.id === newItem.parent_id);
      displayOrder = (parent?.children?.length || 0) + 1;
    } else {
      displayOrder = (menuItems.length + 1) * 10;
    }

    const result = await createNavigationItem({
      name: newItem.name.trim(),
      type: newItem.type,
      path: newItem.path.trim(),
      description: newItem.description.trim() || undefined,
      badge: newItem.badge.trim() || undefined,
      display_order: displayOrder,
      visible: newItem.visible,
      parent_id: newItem.parent_id || null,
    });

    if (result.item) {
      // Reload menu
      const nav = await fetchNavigationMenu();
      setMenuItems(nav);
      setShowNewItemForm(false);
      setNewItem({ name: '', type: 'link', path: '', description: '', badge: '', parent_id: '', visible: true });
      flash('success', `"${result.item.name}" added to navigation`);
    } else {
      flash('error', result.error || 'Failed to add menu item');
    }
    setSaving(false);
  };

  // ── Create new page + menu item ──
  const handleCreatePage = async () => {
    if (!newPage.title.trim() || !newPage.slug.trim()) {
      flash('error', 'Title and slug are required');
      return;
    }

    setSaving(true);

    // Create the page
    const pageResult = await createDynamicPage({
      title: newPage.title.trim(),
      slug: newPage.slug.trim(),
      description: newPage.description.trim() || undefined,
      icon: newPage.icon,
      color: newPage.color,
      page_type: 'category',
      is_active: true,
    });

    if (!pageResult.page) {
      flash('error', pageResult.error || 'Failed to create page');
      setSaving(false);
      return;
    }

    // Add to menu if requested
    if (newPage.addToMenu) {
      let displayOrder = 10;
      if (newPage.parentMenuId) {
        const parent = menuItems.find((m) => m.id === newPage.parentMenuId);
        displayOrder = (parent?.children?.length || 0) + 1;
      } else {
        displayOrder = (menuItems.length + 1) * 10;
      }

      await createNavigationItem({
        name: newPage.title.trim(),
        type: 'link',
        path: `/category/${newPage.slug.trim()}`,
        description: newPage.description.trim() || undefined,
        display_order: displayOrder,
        visible: true,
        parent_id: newPage.parentMenuId || null,
      });

      const nav = await fetchNavigationMenu();
      setMenuItems(nav);
    }

    const pg = await fetchDynamicPages();
    setPages(pg);

    setShowNewPageForm(false);
    setNewPage({ title: '', slug: '', description: '', icon: 'FileText', color: 'slate', parentMenuId: '', addToMenu: true });
    flash('success', `Page "${pageResult.page.title}" created${newPage.addToMenu ? ' and added to menu' : ''}`);
    setSaving(false);
  };

  // ── Delete page ──
  const handleDeletePage = async (page: DynamicPage) => {
    if (!confirm(`Delete page "${page.title}"? This won't delete articles in this category.`)) return;

    setSaving(true);
    const result = await deleteDynamicPage(page.id);
    if (result.success) {
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      flash('success', `"${page.title}" deleted`);
    } else {
      flash('error', result.error || 'Failed to delete page');
    }
    setSaving(false);
  };

  // ── Inline edit save ──
  const handleInlineUpdate = async (id: string, field: string, value: string) => {
    const updates: Partial<NavigationMenuItem> = { [field]: value };
    const result = await updateNavigationItem(id, updates);
    if (result.success) {
      const nav = await fetchNavigationMenu();
      setMenuItems(nav);
    } else {
      flash('error', result.error || 'Failed to update');
    }
  };

  // ── Render ──
  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Loading navigation…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Navigation & Pages</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your website menu structure and create new pages
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'menu'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Menu Structure
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'pages'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FolderPlus className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Create Pages
        </button>
      </div>

      {/* ── TAB: Menu Structure ── */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {menuItems.length} top-level items · Toggle visibility to show/hide on website
            </p>
            <button
              onClick={() => setShowNewItemForm(!showNewItemForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Menu Item
            </button>
          </div>

          {/* New item form */}
          {showNewItemForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Add New Menu Item</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g. Sports"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Path *</label>
                  <input
                    type="text"
                    value={newItem.path}
                    onChange={(e) => setNewItem((p) => ({ ...p, path: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="/category/sports"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem((p) => ({ ...p, type: e.target.value as 'link' | 'dropdown' }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="link">Direct Link</option>
                    <option value="dropdown">Dropdown Parent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Parent</label>
                  <select
                    value={newItem.parent_id}
                    onChange={(e) => setNewItem((p) => ({ ...p, parent_id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">— Top Level —</option>
                    {menuItems
                      .filter((m) => m.type === 'dropdown')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={newItem.description}
                    onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Short description for dropdown"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Badge</label>
                  <input
                    type="text"
                    value={newItem.badge}
                    onChange={(e) => setNewItem((p) => ({ ...p, badge: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g. New, Hot"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleAddMenuItem}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving…' : 'Add Item'}
                </button>
                <button
                  onClick={() => setShowNewItemForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Menu tree */}
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            {menuItems.map((item) => {
              const isExpanded = Boolean(expandedParents[item.id]);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item.id}>
                  {/* Parent row */}
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0 cursor-grab" />

                    {/* Expand toggle */}
                    {hasChildren ? (
                      <button
                        onClick={() =>
                          setExpandedParents((p) => ({ ...p, [item.id]: !p[item.id] }))
                        }
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <div className="w-4" />
                    )}

                    <StatusDot active={item.visible} />

                    {/* Name (editable on blur) */}
                    <input
                      defaultValue={item.name}
                      onBlur={(e) => {
                        if (e.target.value !== item.name) {
                          handleInlineUpdate(item.id, 'name', e.target.value);
                        }
                      }}
                      className="text-sm font-semibold text-slate-800 bg-transparent border-none focus:ring-1 focus:ring-red-400 rounded px-1 min-w-0 flex-1"
                    />

                    {/* Type badge */}
                    <Badge
                      text={item.type}
                      color={item.type === 'dropdown' ? 'blue' : 'slate'}
                    />

                    {item.badge && <Badge text={item.badge} color="red" />}

                    {/* Path */}
                    <span className="hidden lg:inline text-xs text-slate-400 font-mono truncate max-w-[180px]">
                      {item.path}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => handleToggleVisibility(item)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.visible
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={item.visible ? 'Visible — click to hide' : 'Hidden — click to show'}
                      >
                        {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Children rows */}
                  {isExpanded && hasChildren && (
                    <div className="bg-slate-50/50">
                      {item.children!.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-3 px-4 py-2.5 pl-16 hover:bg-slate-100/80 transition-colors border-t border-slate-100"
                        >
                          <Link2 className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                          <StatusDot active={child.visible} />

                          <input
                            defaultValue={child.name}
                            onBlur={(e) => {
                              if (e.target.value !== child.name) {
                                handleInlineUpdate(child.id, 'name', e.target.value);
                              }
                            }}
                            className="text-xs font-medium text-slate-700 bg-transparent border-none focus:ring-1 focus:ring-red-400 rounded px-1 min-w-0 w-28"
                          />

                          <span className="hidden md:inline text-[11px] text-slate-400 truncate max-w-[200px]">
                            {child.description}
                          </span>

                          <span className="hidden lg:inline text-[11px] text-slate-400 font-mono truncate max-w-[160px] ml-auto">
                            {child.path}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleVisibility(child)}
                              className={`p-1 rounded-lg transition-colors ${
                                child.visible
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              {child.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteMenuItem(child.id, child.name)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {menuItems.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-slate-400">
                No menu items found. Add one above to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Create Pages ── */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Create new category pages and optionally add them to the navigation menu
            </p>
            <button
              onClick={() => setShowNewPageForm(!showNewPageForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Create New Page
            </button>
          </div>

          {/* New page form */}
          {showNewPageForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Create a New Category Page</h3>
              <p className="text-xs text-slate-500">
                This creates a new page where you can write articles. The page will appear at <code>/category/your-slug</code>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Page Title *</label>
                  <input
                    type="text"
                    value={newPage.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      setNewPage((p) => ({ ...p, title, slug }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g. Games"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">URL Slug *</label>
                  <div className="flex items-center">
                    <span className="text-xs text-slate-400 mr-1">/category/</span>
                    <input
                      type="text"
                      value={newPage.slug}
                      onChange={(e) => setNewPage((p) => ({ ...p, slug: e.target.value }))}
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="entertainment-games"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={newPage.description}
                    onChange={(e) => setNewPage((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Short description for this page"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Color Theme</label>
                  <select
                    value={newPage.color}
                    onChange={(e) => setNewPage((p) => ({ ...p, color: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="slate">Slate</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="amber">Amber</option>
                    <option value="violet">Violet</option>
                    <option value="rose">Rose</option>
                    <option value="indigo">Indigo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Add under menu</label>
                  <select
                    value={newPage.parentMenuId}
                    onChange={(e) => setNewPage((p) => ({ ...p, parentMenuId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">— Top Level —</option>
                    {menuItems
                      .filter((m) => m.type === 'dropdown')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          Under: {m.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPage.addToMenu}
                    onChange={(e) => setNewPage((p) => ({ ...p, addToMenu: e.target.checked }))}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  Also add to navigation menu
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCreatePage}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  {saving ? 'Creating…' : 'Create Page'}
                </button>
                <button
                  onClick={() => setShowNewPageForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing pages */}
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Created Pages ({pages.length})
              </h3>
            </div>

            {pages.map((page) => (
              <div key={page.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                <StatusDot active={page.is_active} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{page.title}</p>
                  <p className="text-xs text-slate-400 font-mono">/category/{page.slug}</p>
                </div>
                <Badge text={page.page_type} color={page.color} />
                {page.description && (
                  <span className="hidden lg:inline text-xs text-slate-400 truncate max-w-[200px]">
                    {page.description}
                  </span>
                )}
                <button
                  onClick={() => handleDeletePage(page)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {pages.length === 0 && (
              <div className="px-4 py-12 text-center text-sm text-slate-400">
                No custom pages created yet. Click "Create New Page" to add one.
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="text-sm font-bold text-blue-800 mb-1">💡 How it works</h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Creating a page registers a new category at <code>/category/your-slug</code></li>
              <li>Go to <strong>My Articles → New Article</strong> and select this category to add content</li>
              <li>If you checked "Add to navigation menu", it will appear in the website header</li>
              <li>Use the <strong>Menu Structure</strong> tab to toggle visibility or reorder items</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardNavigation;
