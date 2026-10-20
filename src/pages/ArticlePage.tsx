import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { fetchArticleBySlug, fetchFeaturedArticles } from '../services/articleService';
import { TableOfContents } from '../components/article/TableOfContents';
import { ShareBar } from '../components/article/ShareBar';
import { CommentSection } from '../components/article/CommentSection';
import { ArticleCard } from '../components/common/ArticleCard';
import { SeoHead, SITE_URL } from '../components/common/SeoHead';
import { TravelGuideTemplate } from '../components/article/TravelGuideTemplate';
import { TutorialTemplate } from '../components/article/TutorialTemplate';
import { Article, TravelTemplateData, TutorialTemplateData } from '../types';

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      if (!slug) return;
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const found = await fetchArticleBySlug(slug);
        setArticle(found);
        const relatedArticles = await fetchFeaturedArticles();
        setRelated(relatedArticles.filter((a) => a.slug !== slug).slice(0, 3));
      } catch (err) {
        console.error('[ArticlePage] Failed to fetch article:', err);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-pulse space-y-6">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-10 bg-slate-200 rounded w-4/5" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="aspect-[16/9] bg-slate-200 rounded-2xl" />
        <div className="space-y-3 pt-6">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Article Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">
          The requested publication could not be found or has not yet been published.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto py-6 sm:py-10">
      <SeoHead
        title={article.seo_title || article.title}
        description={article.seo_description || article.excerpt}
        canonicalUrl={`/article/${article.slug}`}
        ogImage={article.cover_image}
        ogType="article"
        publishedAt={article.published_at}
        authorName={article.author.name}
        category={article.category}
        tags={article.tags}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            description: article.excerpt,
            image: [article.cover_image],
            datePublished: article.published_at,
            dateModified: article.published_at,
            author: {
              '@type': 'Person',
              name: article.author.name,
            },
            publisher: {
              '@type': 'NewsMediaOrganization',
              name: 'EveryGyan',
              url: SITE_URL,
              logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/favicon.svg`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${SITE_URL}/article/${article.slug}`,
            },
            articleSection: article.category,
            keywords: article.tags?.join(', '),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: SITE_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: article.category,
                item: `${SITE_URL}/category/${article.category_slug}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: article.title,
                item: `${SITE_URL}/article/${article.slug}`,
              },
            ],
          },
        ]}
      />

      {/* Breadcrumb Trail */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-red-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          to={`/category/${article.category_slug}`}
          className="hover:text-red-600 transition-colors"
        >
          {article.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-xs">
          {article.title}
        </span>
      </nav>

      {/* Category Pill Tag */}
      <div className="mb-4">
        <Link
          to={`/category/${article.category_slug}`}
          className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          {article.category}
        </Link>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
        {article.title}
      </h1>

      {/* Subhead / Excerpt */}
      <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal mb-6">
        {article.excerpt}
      </p>

      {/* Byline & Share Bar */}
      <div className="py-4 border-y border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          {article.author.avatar ? (
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-11 h-11 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-red-600 text-white font-bold flex items-center justify-center">
              {article.author.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-slate-900">{article.author.name}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {article.published_at}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.read_time}
              </span>
            </div>
          </div>
        </div>

        <ShareBar title={article.title} />
      </div>

      {/* Cover Image */}
      <figure className="mb-10">
        <div className="rounded-3xl overflow-hidden shadow-md aspect-[16/10] bg-slate-100">
          <img
            src={article.cover_image}
            alt={article.title}
            {...({ fetchpriority: 'high' } as React.ImgHTMLAttributes<HTMLImageElement>)}
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
        {article.cover_caption && (
          <figcaption className="text-xs text-slate-500 mt-2.5 text-center italic">
            {article.cover_caption}
          </figcaption>
        )}
      </figure>

      {/* Content Templates (Travel Guide or Learning/Tutorial) */}
      {article.template_type === 'travel' && (
        <TravelGuideTemplate data={article.template_data as TravelTemplateData} />
      )}
      {article.template_type === 'tutorial' && (
        <TutorialTemplate data={article.template_data as TutorialTemplateData} />
      )}

      {/* Table of Contents */}
      {article.table_of_contents && article.table_of_contents.length > 0 && (
        <TableOfContents items={article.table_of_contents} />
      )}

      {/* Article Body Content */}
      <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-6 text-base sm:text-lg">
        {article.content.split('\n\n').map((paragraph, index) => {
          if (paragraph.startsWith('## ')) {
            const headingText = paragraph.replace('## ', '').trim();
            const headingId = headingText
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)+/g, '');
            return (
              <h2
                key={index}
                id={headingId}
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-6 pb-2"
              >
                {headingText}
              </h2>
            );
          }
          if (paragraph.trim()) {
            return (
              <p key={index} className="text-slate-700 leading-relaxed font-normal">
                {paragraph.trim()}
              </p>
            );
          }
          return null;
        })}
      </div>

      {/* References Block */}
      {article.references && article.references.length > 0 && (
        <div className="my-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
            Official References & Resources
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm">
            {article.references.map((ref, idx) => (
              <li key={idx}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-600 hover:text-red-700 font-medium underline flex items-center gap-1"
                >
                  <span>{ref.title}</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Article Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="my-8 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Tags:
          </span>
          {article.tags.map((tag) => {
            const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link
                key={tag}
                to={`/tag/${tagSlug}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                #{tag}
              </Link>
            );
          })}
        </div>
      )}

      {/* Safe Comments Section */}
      <CommentSection articleId={article.id} articleTitle={article.title} />

      {/* Related Articles Section */}
      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-200">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Related Stories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((rel) => (
              <ArticleCard key={rel.id} article={rel} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default ArticlePage;
