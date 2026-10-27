import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Edit3,
  Upload,
  CheckCircle2,
  AlertCircle,
  Tag,
  Link2,
  Calendar,
  Sparkles,
  Loader2,
  Globe,
  Plus,
  Trash2,
  Compass,
  BookOpen,
  Image as ImageIcon,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CATEGORIES } from '../../data/seedData';
import { ArticleStatus, TemplateType, TravelTemplateData, TutorialTemplateData } from '../../types';
import { TravelGuideTemplate } from '../../components/article/TravelGuideTemplate';
import { TutorialTemplate } from '../../components/article/TutorialTemplate';
import { InlineImageModal } from '../../components/common/InlineImageModal';
import {
  fetchArticleForEditing,
  saveArticle,
  uploadArticleCoverImage,
  SaveArticleInput,
} from '../../services/cmsService';
import { generateSlug } from '../../utils/slug';
import { calculateReadingTime } from '../../utils/readingTime';
import { compressImageToWebP, uploadInlineImageToStorage } from '../../utils/imageCompressor';
import { renderMarkdownBlocks } from '../../utils/markdownRenderer';

export const ArticleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, role } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [categorySlug, setCategorySlug] = useState(CATEGORIES[0].slug);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverCaption, setCoverCaption] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isLeadStory, setIsLeadStory] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isCarousel, setIsCarousel] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [references, setReferences] = useState<{ title: string; url: string }[]>([]);
  const [newRefTitle, setNewRefTitle] = useState('');
  const [newRefUrl, setNewRefUrl] = useState('');

  // Template State
  const [templateType, setTemplateType] = useState<TemplateType>('standard');
  const [travelData, setTravelData] = useState<TravelTemplateData>({});
  const [tutorialData, setTutorialData] = useState<TutorialTemplateData>({});

  // UI State
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [autosaveText, setAutosaveText] = useState('Draft saved locally');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [savedSelection, setSavedSelection] = useState<{ start: number; end: number } | null>(null);
  const [isDraggingOverEditor, setIsDraggingOverEditor] = useState(false);
  const [editorToast, setEditorToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing article if editing
  useEffect(() => {
    async function loadData() {
      if (!id || id === 'new') return;
      setLoading(true);
      const article = await fetchArticleForEditing(id);
      if (article) {
        setTitle(article.title);
        setSlug(article.slug);
        setSlugEdited(true);
        setExcerpt(article.excerpt || '');
        setContent(article.content || '');
        setCategory(article.category);
        setCategorySlug(article.category_slug);
        setTags(article.tags || []);
        setCoverImage(article.cover_image || '');
        setCoverCaption(article.cover_caption || '');
        setStatus(article.status);
        setIsLeadStory(Boolean(article.is_lead_story));
        setIsFeatured(Boolean(article.is_featured));
        setIsCarousel(Boolean(article.is_carousel));
        setSeoTitle(article.seo_title || '');
        setSeoDescription(article.seo_description || '');
        setReferences(article.references || []);
        if (article.template_type) {
          setTemplateType(article.template_type);
        }
        if (article.template_type === 'travel' && article.template_data) {
          setTravelData(article.template_data as TravelTemplateData);
        }
        if (article.template_type === 'tutorial' && article.template_data) {
          setTutorialData(article.template_data as TutorialTemplateData);
        }
        if (article.published_at) {
          setScheduledDate(article.published_at.slice(0, 16));
        }
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  // Handle Title change -> auto slug if not manually customized
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) {
      setSlug(generateSlug(val));
    }
  };

  // Category select change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = CATEGORIES.find((c) => c.slug === e.target.value);
    if (selected) {
      setCategory(selected.name);
      setCategorySlug(selected.slug);
      if (templateType === 'standard') {
        if (selected.slug.includes('travel')) {
          setTemplateType('travel');
        } else if (selected.slug.includes('learn') || selected.slug.includes('sap')) {
          setTemplateType('tutorial');
        }
      }
    }
  };

  // Tag addition
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // References management
  const handleAddReference = () => {
    if (newRefTitle.trim() && newRefUrl.trim()) {
      setReferences([...references, { title: newRefTitle.trim(), url: newRefUrl.trim() }]);
      setNewRefTitle('');
      setNewRefUrl('');
    }
  };

  const handleRemoveReference = (idx: number) => {
    setReferences(references.filter((_, i) => i !== idx));
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorBanner(null);
    const { data: publicUrl, error } = await uploadArticleCoverImage(file);
    if (error) {
      setErrorBanner(error);
    } else if (publicUrl) {
      setCoverImage(publicUrl);
      setAutosaveText('Cover image updated');
    }
    setUploadingImage(false);
  };

  const insertTextAtCursor = (textToInsert: string, customStart?: number, customEnd?: number) => {
    const textarea = textareaRef.current;
    const start = customStart ?? textarea?.selectionStart ?? content.length;
    const end = customEnd ?? textarea?.selectionEnd ?? content.length;

    const updated = content.substring(0, start) + textToInsert + content.substring(end);
    setContent(updated);

    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        const newPos = start + textToInsert.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 10);
    }
  };

  const handleOpenImageModal = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      setSavedSelection({
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      });
    } else {
      setSavedSelection(null);
    }
    setIsImageModalOpen(true);
  };

  const handleInsertImageFromModal = (imageMarkdown: string) => {
    if (savedSelection) {
      insertTextAtCursor(imageMarkdown, savedSelection.start, savedSelection.end);
    } else {
      insertTextAtCursor(imageMarkdown);
    }
    setEditorToast('✓ Inline image added to article');
    setTimeout(() => setEditorToast(null), 3500);
  };

  const handleLinkButton = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    const url = window.prompt('Enter destination URL (e.g. https://...):', 'https://');
    if (!url) return;

    const label = selected.trim() || 'Link text';
    insertTextAtCursor(`[${label}](${url})`, start, end);
  };

  const handlePasteOnEditor = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let imageFile: File | null = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        imageFile = items[i].getAsFile();
        break;
      }
    }

    if (!imageFile) return; // Allow normal text paste

    e.preventDefault();

    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const placeholder = `\n![Uploading image (${imageFile.name || 'clipboard'})...]()\n`;

    const before = content.substring(0, start);
    const after = content.substring(end);
    setContent(before + placeholder + after);
    setEditorToast('Compressing & uploading pasted image to WebP...');

    try {
      const compressed = await compressImageToWebP(imageFile, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      });

      const uploadRes = await uploadInlineImageToStorage(compressed.file, 'article-media', 'inline');
      if (uploadRes.error) {
        throw new Error(uploadRes.error);
      }

      const markdownSnippet = `\n![Image](${uploadRes.url})\n\n`;
      setContent((prev) => prev.replace(placeholder, markdownSnippet));
      setEditorToast(`✓ Image pasted and converted to WebP (${Math.round(compressed.compressedSize / 1024)} KB)`);
      setTimeout(() => setEditorToast(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Paste upload failed';
      setContent((prev) => prev.replace(placeholder, `\n<!-- Image paste failed: ${msg} -->\n`));
      setErrorBanner(`Image paste error: ${msg}`);
      setEditorToast(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDraggingOverEditor(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDraggingOverEditor(false);
  };

  const handleDropOnEditor = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDraggingOverEditor(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const imageFile = Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!imageFile) return;

    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const placeholder = `\n![Uploading dropped image (${imageFile.name})...]()\n`;

    const before = content.substring(0, start);
    const after = content.substring(end);
    setContent(before + placeholder + after);
    setEditorToast('Optimizing & uploading dropped image...');

    try {
      const compressed = await compressImageToWebP(imageFile, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      });

      const uploadRes = await uploadInlineImageToStorage(compressed.file, 'article-media', 'inline');
      if (uploadRes.error) {
        throw new Error(uploadRes.error);
      }

      const cleanAlt = imageFile.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const markdownSnippet = `\n![${cleanAlt}](${uploadRes.url})\n\n`;
      setContent((prev) => prev.replace(placeholder, markdownSnippet));
      setEditorToast(`✓ Dropped image added (${Math.round(compressed.compressedSize / 1024)} KB WebP)`);
      setTimeout(() => setEditorToast(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Drop upload failed';
      setContent((prev) => prev.replace(placeholder, `\n<!-- Image drop failed: ${msg} -->\n`));
      setErrorBanner(`Image drop error: ${msg}`);
      setEditorToast(null);
    }
  };

  // Save / Publish submit handler
  const handleSave = async (targetStatus?: ArticleStatus) => {
    setSaving(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    const desiredStatus = targetStatus || status;

    const payload: SaveArticleInput = {
      id: id === 'new' ? undefined : id,
      title,
      slug,
      excerpt,
      content,
      category,
      category_slug: categorySlug,
      cover_image: coverImage,
      cover_caption: coverCaption,
      tags,
      status: desiredStatus,
      published_at: desiredStatus === 'scheduled' ? scheduledDate : undefined,
      is_lead_story: isLeadStory,
      is_featured: isFeatured,
      is_carousel: isCarousel,
      seo_title: seoTitle,
      seo_description: seoDescription,
      references,
      template_type: templateType,
      template_data: templateType === 'travel' ? (travelData as Record<string, unknown>) : templateType === 'tutorial' ? (tutorialData as Record<string, unknown>) : {},
    };

    const userAuthor = {
      id: user?.id || 'mock-author',
      name: profile?.full_name || user?.email?.split('@')[0] || 'Editor',
      role,
    };

    const { data: saved, error } = await saveArticle(payload, userAuthor);

    setSaving(false);

    if (error) {
      setErrorBanner(error);
      return;
    }

    if (saved) {
      setStatus(saved.status);
      setSuccessBanner(
        desiredStatus === 'published'
          ? 'Article published successfully!'
          : desiredStatus === 'in_review'
          ? 'Article submitted for review.'
          : 'Article draft saved successfully.'
      );
      setAutosaveText(`Saved at ${new Date().toLocaleTimeString()}`);
      setTimeout(() => {
        navigate('/dashboard/articles');
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/articles"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
            aria-label="Back to Articles"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {id === 'new' ? 'Create New Article' : 'Edit Article'}
            </h1>
            <p className="text-xs text-slate-400">{autosaveText}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'Back to Editor' : 'Preview'}</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          {role === 'author' ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('in_review')}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
            >
              <span>Submit for Review</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
            >
              <span>Publish Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Error & Success Feedback Banners */}
      {errorBanner && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{errorBanner}</span>
        </div>
      )}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Editor or Preview Mode */}
      {isPreview ? (
        /* Live Article Preview */
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600">
            {category}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            {title || 'Untitled Article'}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">{excerpt}</p>
          {coverImage && (
            <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100">
              <img src={coverImage} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Template Live Preview */}
          {templateType === 'travel' && <TravelGuideTemplate data={travelData} />}
          {templateType === 'tutorial' && <TutorialTemplate data={tutorialData} />}

          <div className="prose prose-slate max-w-none text-slate-800 space-y-4 pt-4">
            {renderMarkdownBlocks(content)}
          </div>
        </div>
      ) : (
        /* Dual Column Editor */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Column (Content & Inputs) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Article Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter a compelling publication title..."
                  className="w-full text-xl sm:text-2xl font-bold text-slate-900 placeholder-slate-300 border-0 border-b border-slate-200 pb-2 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* URL Slug Field */}
              <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-400">Slug:</span>
                <span className="text-slate-400">/article/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                  className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSlug(generateSlug(title));
                    setSlugEdited(true);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  Regenerate
                </button>
              </div>

              {/* Excerpt */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Summary / Excerpt
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise 1-2 sentence overview for home cards, previews, and RSS..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Template Format Selector & Custom Structured Fields */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Content Template & Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTemplateType('standard')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      templateType === 'standard'
                        ? 'border-red-500 bg-red-50/50 text-red-900 shadow-xs ring-1 ring-red-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="block text-xs font-bold">Standard Editorial</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">Classic prose article</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateType('travel')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      templateType === 'travel'
                        ? 'border-rose-500 bg-rose-50/50 text-rose-900 shadow-xs ring-1 ring-rose-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-rose-600" />
                      <span className="block text-xs font-bold">Travel Guide</span>
                    </div>
                    <span className="block text-[11px] text-slate-500 mt-0.5">Destinations & itineraries</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateType('tutorial')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      templateType === 'tutorial'
                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span className="block text-xs font-bold">Learning / Tutorial</span>
                    </div>
                    <span className="block text-[11px] text-slate-500 mt-0.5">SAP & step-by-step guides</span>
                  </button>
                </div>
              </div>

              {/* Travel Guide Fields */}
              {templateType === 'travel' && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
                    <Compass className="w-4 h-4" />
                    <span>Travel Guide Structured Attributes</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Name</label>
                      <input
                        type="text"
                        value={travelData.destination || ''}
                        onChange={(e) => setTravelData({ ...travelData, destination: e.target.value })}
                        placeholder="e.g. Kyoto, Japan or Vienna & Hallstatt"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Best Time to Visit (Season)</label>
                      <input
                        type="text"
                        value={travelData.best_time_to_visit?.season || ''}
                        onChange={(e) =>
                          setTravelData({
                            ...travelData,
                            best_time_to_visit: {
                              ...travelData.best_time_to_visit,
                              season: e.target.value,
                              verified_date: travelData.best_time_to_visit?.verified_date || 'October 2026',
                            },
                          })
                        }
                        placeholder="e.g. May to September"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Arrival / Transit Tip</label>
                      <input
                        type="text"
                        value={travelData.transport?.arrival || ''}
                        onChange={(e) =>
                          setTravelData({
                            ...travelData,
                            transport: { ...travelData.transport, arrival: e.target.value },
                          })
                        }
                        placeholder="e.g. International flight to VIE or Kansai (KIX)"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Budget Range (with date stamp)</label>
                      <input
                        type="text"
                        value={travelData.budget_ranges?.daily_budget || ''}
                        onChange={(e) =>
                          setTravelData({
                            ...travelData,
                            budget_ranges: {
                              ...travelData.budget_ranges,
                              daily_budget: e.target.value,
                              verified_date: 'October 2026',
                            },
                          })
                        }
                        placeholder="e.g. €80 - €150 / day"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Safety & Travel Document Caveats</label>
                    <textarea
                      value={travelData.safety_caveats || ''}
                      onChange={(e) => setTravelData({ ...travelData, safety_caveats: e.target.value })}
                      placeholder="e.g. Verify Schengen passport validity and visa requirements prior to departure..."
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              )}

              {/* Tutorial Fields */}
              {templateType === 'tutorial' && (
                <div className="space-y-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    <span>Learning & Tutorial Structured Attributes</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Version Applicability</label>
                      <input
                        type="text"
                        value={tutorialData.version_applicability || ''}
                        onChange={(e) => setTutorialData({ ...tutorialData, version_applicability: e.target.value })}
                        placeholder="e.g. SAP S/4HANA 2023 / Cloud 2402, ABAP RAP"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
                      <select
                        value={tutorialData.difficulty_level || 'Beginner'}
                        onChange={(e) => setTutorialData({ ...tutorialData, difficulty_level: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prerequisites (One per line)</label>
                    <textarea
                      value={(tutorialData.prerequisites || []).join('\n')}
                      onChange={(e) =>
                        setTutorialData({
                          ...tutorialData,
                          prerequisites: e.target.value.split('\n').filter((l) => l.trim()),
                        })
                      }
                      placeholder="e.g.&#10;Basic SQL and relational database concepts&#10;Access to SAP BTP trial tenant"
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Learning Objectives (One per line)</label>
                    <textarea
                      value={(tutorialData.learning_objectives || []).join('\n')}
                      onChange={(e) =>
                        setTutorialData({
                          ...tutorialData,
                          learning_objectives: e.target.value.split('\n').filter((l) => l.trim()),
                        })
                      }
                      placeholder="e.g.&#10;Create CDS data definition&#10;Publish OData V4 service binding"
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Markdown Body Editor */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Article Body (Markdown Supported)
                  </label>
                  {editorToast && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 animate-fade-in">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {editorToast}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span>•</span>
                  <span>{calculateReadingTime(content)}</span>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2 text-xs text-slate-600">
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('\n\n## Section Heading\n')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                  title="Section Heading (H2)"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('\n\n### Sub-heading\n')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                  title="Sub-heading (H3)"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sel = textareaRef.current ? content.substring(textareaRef.current.selectionStart, textareaRef.current.selectionEnd) : '';
                    insertTextAtCursor(`**${sel || 'bold text'}**`);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold"
                  title="Bold text"
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('\n\n> Quote or key highlight\n\n')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded"
                  title="Blockquote"
                >
                  Quote
                </button>
                <button
                  type="button"
                  onClick={handleLinkButton}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1"
                  title="Insert Link"
                >
                  <Link2 className="w-3 h-3" />
                  <span>Link</span>
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                {/* Insert Inline Image Button */}
                <button
                  type="button"
                  onClick={handleOpenImageModal}
                  className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Insert Inline Image (Upload WebP or Link URL)"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                  <span>Image</span>
                </button>
              </div>

              {/* Textarea with Drag & Drop Overlay */}
              <div className="relative">
                {isDraggingOverEditor && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-500 bg-red-50/95 backdrop-blur-xs transition-all pointer-events-none">
                    <UploadCloud className="w-10 h-10 text-red-600 animate-bounce" />
                    <p className="mt-2 text-sm font-bold text-red-900">
                      Drop image to insert into article body
                    </p>
                    <p className="text-xs text-red-700">
                      Auto-compressed to WebP &lt; 150KB and uploaded to Supabase Storage
                    </p>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePasteOnEditor}
                  onDrop={handleDropOnEditor}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  placeholder="Write your article content using standard Markdown (## for headings, - for lists)... You can paste screenshots (Ctrl+V) or drop image files directly here!"
                  rows={16}
                  className={`w-full p-4 font-mono text-sm leading-relaxed border rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                    isDraggingOverEditor ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200'
                  }`}
                />

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1 mt-1.5 gap-2">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-red-500 shrink-0" />
                    <span>
                      Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px] border">Ctrl+V</kbd> to paste screenshots directly from clipboard or drag image files onto the editor.
                    </span>
                  </span>
                  <span>{content.length} characters</span>
                </div>
              </div>
            </div>

            {/* References & Sources Block */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-bold text-slate-900">Official Citations & Sources</h3>
                </div>
                <span className="text-[11px] text-slate-400">Strictly no invented references</span>
              </div>

              {references.map((ref, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                  <div className="truncate pr-3">
                    <p className="font-semibold text-slate-800">{ref.title}</p>
                    <p className="text-slate-400 truncate">{ref.url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveReference(idx)}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <input
                  type="text"
                  value={newRefTitle}
                  onChange={(e) => setNewRefTitle(e.target.value)}
                  placeholder="Reference Title (e.g. Austrian Tourism)"
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newRefUrl}
                    onChange={(e) => setNewRefUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddReference}
                    className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar (Metadata & Settings) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Status & Publication Control */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Publication Status
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Workflow State
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="draft">Draft (Work in Progress)</option>
                  <option value="in_review">In Review (Ready for Approval)</option>
                  <option value="scheduled" disabled={role === 'author'}>
                    Scheduled {role === 'author' ? '(Editor only)' : ''}
                  </option>
                  <option value="published" disabled={role === 'author'}>
                    Published {role === 'author' ? '(Editor only)' : ''}
                  </option>
                  <option value="archived" disabled={role === 'author'}>
                    Archived {role === 'author' ? '(Editor only)' : ''}
                  </option>
                </select>
              </div>

              {status === 'scheduled' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Release Date & Time
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Promotion Toggles */}
              <div className="pt-2 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLeadStory}
                    onChange={(e) => setIsLeadStory(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-slate-700">Set as Hero Lead Story</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-slate-700">Display in Featured Articles Grid</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCarousel}
                    onChange={(e) => setIsCarousel(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-slate-700">Display in Homepage Carousel</span>
                </label>
              </div>
            </div>

            {/* Category Selector */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Category
              </h3>
              <select
                value={categorySlug}
                onChange={handleCategoryChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Manager */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Article Tags
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="e.g. Europe, Travel..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700"
                  >
                    <Tag className="w-3 h-3 text-red-500" />
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="ml-1 text-slate-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Cover Media</h3>
                <span className="text-[10px] text-slate-400">Max 5MB (WebP/JPEG)</span>
              </div>

              {coverImage ? (
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 relative group">
                    <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-lg transition-colors"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={coverCaption}
                    onChange={(e) => setCoverCaption(e.target.value)}
                    placeholder="Cover caption / image credit..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-slate-200 hover:border-red-400 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-red-600 transition-colors bg-slate-50/50"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                    <span className="text-xs font-semibold">
                      {uploadingImage ? 'Uploading...' : 'Upload Cover Photo'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Inline Story Images */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-red-600" />
                  <span>Inline Story Images</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Auto-WebP
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add photos, diagrams, or screenshots anywhere in your story. You can also paste screenshots directly into the editor (<kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] font-mono border">Ctrl+V</kbd>).
              </p>
              <button
                type="button"
                onClick={handleOpenImageModal}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>Insert Inline Image...</span>
              </button>
            </div>

            {/* SEO Metadata */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">Search Engine Metadata</h3>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to article title"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Meta Description</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description for search engine result snippets (150-160 chars)"
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Image Modal */}
      <InlineImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleInsertImageFromModal}
      />
    </div>
  );
};

export default ArticleEditor;
