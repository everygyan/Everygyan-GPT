import React, { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  fetchAboutPageData,
  updateAboutPageContent,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  DEFAULT_ABOUT_CONTENT,
} from '../../services/aboutService';
import { AboutPageContent, EditorialTeamMember } from '../../types';

export const DashboardAbout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'team'>('team');
  const [loading, setLoading] = useState(true);

  // Content state
  const [content, setContent] = useState<AboutPageContent>(DEFAULT_ABOUT_CONTENT);
  const [storyText, setStoryText] = useState('');
  const [contentStatus, setContentStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [contentMsg, setContentMsg] = useState('');

  // Team state
  const [team, setTeam] = useState<EditorialTeamMember[]>([]);
  const [teamStatus, setTeamStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [teamMsg, setTeamMsg] = useState('');

  // Team modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<EditorialTeamMember | null>(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formSpecialties, setFormSpecialties] = useState('');
  const [formOrder, setFormOrder] = useState(1);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAboutPageData();
      setContent(data.content);
      setStoryText(data.content.story_paragraphs.join('\n\n'));
      setTeam(data.team);
    } catch (err) {
      console.error('[DashboardAbout] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save content
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentStatus('saving');
    setContentMsg('');

    const paragraphs = storyText
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const updated: AboutPageContent = {
      ...content,
      story_paragraphs: paragraphs.length > 0 ? paragraphs : content.story_paragraphs,
    };

    const result = await updateAboutPageContent(updated);
    if (result.success) {
      setContent(updated);
      setContentStatus('success');
      setContentMsg('About Us page content successfully updated and saved to Supabase!');
      setTimeout(() => setContentStatus('idle'), 4000);
    } else {
      setContentStatus('error');
      setContentMsg(result.error || 'Failed to save content to Supabase.');
    }
  };

  // Open modal for add
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormName('');
    setFormRole('');
    setFormBio('');
    setFormAvatar(
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    );
    setFormSpecialties('Technology, Research');
    setFormOrder(team.length + 1);
    setModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (member: EditorialTeamMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormBio(member.bio);
    setFormAvatar(member.avatar);
    setFormSpecialties(member.specialties ? member.specialties.join(', ') : '');
    setFormOrder(member.display_order);
    setModalOpen(true);
  };

  // Save editor (create or update)
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamStatus('saving');
    setTeamMsg('');

    const specialtiesArray = formSpecialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingMember) {
      // Update
      const res = await updateTeamMember(editingMember.id, {
        name: formName,
        role: formRole,
        bio: formBio,
        avatar: formAvatar,
        specialties: specialtiesArray,
        display_order: Number(formOrder),
      });

      if (res.success) {
        setTeam((prev) =>
          prev
            .map((m) =>
              m.id === editingMember.id
                ? {
                    ...m,
                    name: formName,
                    role: formRole,
                    bio: formBio,
                    avatar: formAvatar,
                    specialties: specialtiesArray,
                    display_order: Number(formOrder),
                  }
                : m
            )
            .sort((a, b) => a.display_order - b.display_order)
        );
        setModalOpen(false);
        setTeamStatus('success');
        setTeamMsg(`Updated editor "${formName}" successfully!`);
        setTimeout(() => setTeamStatus('idle'), 3500);
      } else {
        setTeamStatus('error');
        setTeamMsg(res.error || 'Failed to update team member.');
      }
    } else {
      // Create
      const res = await createTeamMember({
        name: formName,
        role: formRole,
        bio: formBio,
        avatar: formAvatar,
        specialties: specialtiesArray,
        display_order: Number(formOrder),
      });

      if (res.member) {
        setTeam((prev) => [...prev, res.member!].sort((a, b) => a.display_order - b.display_order));
        setModalOpen(false);
        setTeamStatus('success');
        setTeamMsg(`Added new editor "${formName}" successfully!`);
        setTimeout(() => setTeamStatus('idle'), 3500);
      } else {
        setTeamStatus('error');
        setTeamMsg(res.error || 'Failed to create team member.');
      }
    }
  };

  // Delete editor
  const handleDeleteMember = async (id: string) => {
    setTeamStatus('saving');
    const res = await deleteTeamMember(id);
    if (res.success) {
      setTeam((prev) => prev.filter((m) => m.id !== id));
      setDeleteConfirmId(null);
      setTeamStatus('success');
      setTeamMsg('Editor removed successfully.');
      setTimeout(() => setTeamStatus('idle'), 3500);
    } else {
      setTeamStatus('error');
      setTeamMsg(res.error || 'Failed to delete team member.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading About Page and Team Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            About Us & Editorial Team Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Edit the public About page content, mission story, and manage the team of editors stored in Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh data from database"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Live Page
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'team'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Editorial Team Members ({team.length})
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'content'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          About Page Content & Mission
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EDITORIAL TEAM MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Status Message */}
          {teamMsg && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                teamStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {teamStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{teamMsg}</span>
            </div>
          )}

          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Editorial Specialists</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, update, or remove journalists and domain editors displayed on the public About page.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add New Editor
            </button>
          </div>

          {/* Team Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                        <p className="text-xs font-semibold text-red-600">{member.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      Order: {member.display_order}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{member.bio}</p>

                  {member.specialties && member.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {member.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Edit & Delete Controls */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(member)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(member.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ABOUT US PAGE CONTENT */}
      {/* ========================================================================= */}
      {activeTab === 'content' && (
        <form onSubmit={handleSaveContent} className="space-y-6">
          {/* Status Message */}
          {contentMsg && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                contentStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {contentStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{contentMsg}</span>
            </div>
          )}

          {/* Section 1: Hero Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              1. Hero Header Section
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tagline / Overline
                </label>
                <input
                  type="text"
                  value={content.hero_tagline}
                  onChange={(e) => setContent({ ...content, hero_tagline: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Highlighted Word(s) in Title (Red Accent)
                </label>
                <input
                  type="text"
                  value={content.hero_highlight}
                  onChange={(e) => setContent({ ...content, hero_highlight: e.target.value })}
                  placeholder="e.g. Everywhere"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Main Headline</label>
              <input
                type="text"
                value={content.hero_title}
                onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hero Description (Subheading)
              </label>
              <textarea
                rows={3}
                value={content.hero_description}
                onChange={(e) => setContent({ ...content, hero_description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          {/* Section 2: Story Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              2. The EveryGyan Story (Who We Are)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Story Badge</label>
                <input
                  type="text"
                  value={content.story_badge}
                  onChange={(e) => setContent({ ...content, story_badge: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Story Headline</label>
                <input
                  type="text"
                  value={content.story_title}
                  onChange={(e) => setContent({ ...content, story_title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Story Paragraphs (Separate paragraphs with a blank line / double enter)
              </label>
              <textarea
                rows={7}
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tip: Each double newline creates a separate readable paragraph on the public page.
              </p>
            </div>
          </div>

          {/* Section 3: Reader Commitment & Contact */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              3. Reader Commitment & Editorial Inquiries
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commitment Title</label>
                <input
                  type="text"
                  value={content.commitment_title}
                  onChange={(e) => setContent({ ...content, commitment_title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Editorial Contact Email
                </label>
                <input
                  type="email"
                  value={content.commitment_email}
                  onChange={(e) => setContent({ ...content, commitment_email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Commitment Text</label>
              <textarea
                rows={3}
                value={content.commitment_text}
                onChange={(e) => setContent({ ...content, commitment_text: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          {/* Save Button Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={contentStatus === 'saving'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {contentStatus === 'saving' ? 'Saving to Supabase...' : 'Save About Us Content'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT EDITORIAL TEAM MEMBER */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingMember ? 'Edit Editorial Specialist' : 'Add New Editorial Specialist'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Sandeep Reddy"
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Editorial Title / Role
                </label>
                <input
                  type="text"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="e.g. Lead Travel, Tech & Enterprise Editor"
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Profile</label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Short professional biography..."
                  required
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Avatar Image URL
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    placeholder="https://..."
                    required
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {formAvatar && (
                    <img
                      src={formAvatar}
                      alt="Avatar preview"
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specialties (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formSpecialties}
                    onChange={(e) => setFormSpecialties(e.target.value)}
                    placeholder="SAP, AI, European Rail"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={teamStatus === 'saving'}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                >
                  {teamStatus === 'saving' ? 'Saving...' : editingMember ? 'Update Editor' : 'Add Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Editor?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this editor from the editorial team? This will delete the record from Supabase.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMember(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAbout;
