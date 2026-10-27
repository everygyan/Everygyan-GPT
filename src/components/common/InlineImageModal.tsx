import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  compressImageToWebP,
  uploadInlineImageToStorage,
  type CompressionResult,
} from '../../utils/imageCompressor';

interface InlineImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (markdown: string) => void;
}

export const InlineImageModal: React.FC<InlineImageModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setImageUrl('');
    setAltText('');
    setCaption('');
    setCompressionStats(null);
    setErrorMsg(null);
    setIsCompressing(false);
    setIsUploading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsCompressing(true);
    setCompressionStats(null);

    // Default alt text to clean file name
    const defaultAlt = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (!altText) {
      setAltText(defaultAlt);
    }

    try {
      // 1. Client-Side WebP Compression
      const result = await compressImageToWebP(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      });
      setCompressionStats(result);
      setIsCompressing(false);

      // 2. Upload to Storage article-media bucket
      setIsUploading(true);
      const uploadRes = await uploadInlineImageToStorage(result.file, 'article-media', 'inline');
      setIsUploading(false);

      if (uploadRes.error) {
        setErrorMsg(uploadRes.error);
        // Still provide the local preview so user can test offline
        setImageUrl(result.previewUrl);
      } else {
        setImageUrl(uploadRes.url);
      }
    } catch (err: unknown) {
      setIsCompressing(false);
      setIsUploading(false);
      setErrorMsg((err as Error).message || 'Failed to process and compress image.');
    }
  };

  const handleInsert = () => {
    if (!imageUrl.trim()) {
      setErrorMsg('Please select an image file or provide an image URL.');
      return;
    }

    const cleanAlt = altText.trim() || 'Article visual';
    let markdown = `\n![${cleanAlt}](${imageUrl.trim()})\n`;
    if (caption.trim()) {
      markdown += `*${caption.trim()}*\n\n`;
    } else {
      markdown += `\n`;
    }

    onInsert(markdown);
    handleClose();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Insert image into article"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Insert Image into Article</h3>
              <p className="text-xs text-slate-500">Auto-WebP compression & Supabase Storage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload File (Auto-WebP)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'url'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Image by URL</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tab 1: Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-red-500 hover:bg-red-50/20 transition-all cursor-pointer bg-slate-50/50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/jpg, image/gif, image/avif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isCompressing ? (
                  <div className="py-4 text-center">
                    <RefreshCw className="mx-auto w-7 h-7 text-red-500 animate-spin" />
                    <p className="mt-2 text-xs font-bold text-slate-900">
                      Compressing with Canvas to WebP...
                    </p>
                    <p className="text-[11px] text-slate-500">Optimizing size under 150KB</p>
                  </div>
                ) : isUploading ? (
                  <div className="py-4 text-center">
                    <RefreshCw className="mx-auto w-7 h-7 text-emerald-500 animate-spin" />
                    <p className="mt-2 text-xs font-bold text-slate-900">
                      Uploading to Supabase Storage...
                    </p>
                  </div>
                ) : imageUrl ? (
                  <div className="w-full space-y-2">
                    <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img
                        src={imageUrl}
                        alt="Uploaded preview"
                        className="h-full w-full object-contain"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Click to change image
                      </div>
                    </div>
                    <p className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Image ready for insertion
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="mx-auto w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-900">
                      Click to choose or drop image file here
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Supports JPG, PNG, WebP, GIF. Auto-compressed to WebP &lt; 150KB.
                    </p>
                  </div>
                )}
              </div>

              {/* Compression Stats */}
              {compressionStats && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    WebP Saved {compressionStats.reductionPercentage}%
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {formatBytes(compressionStats.originalSize)} &rarr;{' '}
                    <strong className="text-slate-800">{formatBytes(compressionStats.compressedSize)}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Image Web URL (HTTPS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  {imageUrl && (
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800"
                      title="Open image"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {imageUrl && (
                <div className="relative h-36 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-contain"
                    onError={() => setErrorMsg('Failed to load image from URL. Please check the address.')}
                  />
                </div>
              )}
            </div>
          )}

          {/* Common Fields: Alt Text & Caption */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alt Text / Description (SEO & Accessibility)
              </label>
              <input
                type="text"
                placeholder="e.g. Distributed database cluster architecture"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Caption (Optional — displayed below image)
              </label>
              <input
                type="text"
                placeholder="e.g. Figure 1: Event streaming replication pipeline"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 p-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!imageUrl || isCompressing || isUploading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>Insert into Article</span>
          </button>
        </div>
      </div>
    </div>
  );
};
