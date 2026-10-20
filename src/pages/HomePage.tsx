import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HeroLeadStory } from '../components/home/HeroLeadStory';
import { LatestNewsSidebar } from '../components/home/LatestNewsSidebar';
import { CategoryPills } from '../components/common/CategoryPills';
import { ArticleCard } from '../components/common/ArticleCard';
import { NewsletterBanner } from '../components/common/NewsletterBanner';
import { HeroSkeleton, SidebarSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import {
  fetchLeadStory,
  fetchLatestNews,
  fetchFeaturedArticles,
} from '../services/articleService';
import { Article } from '../types';
import { SeoHead, SITE_URL } from '../components/common/SeoHead';

export const HomePage: React.FC = () => {
  const [leadStory, setLeadStory] = useState<Article | null>(null);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [lead, news, featured] = await Promise.all([
          fetchLeadStory(),
          fetchLatestNews(4),
          fetchFeaturedArticles(),
        ]);
        setLeadStory(lead);
        setLatestNews(news);
        setFeaturedArticles(featured);
      } catch (err) {
        console.error('[HomePage] Error loading articles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 sm:space-y-12">
      <SeoHead
        title="EveryGyan — Knowledge for Everyone, Everywhere"
        description="Editorial learning tutorials, technology news, health insights, geopolitics analysis, sports coverage, and family-friendly travel guides."
        canonicalUrl="/"
        ogType="website"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'EveryGyan',
            url: SITE_URL,
            description: 'Knowledge for Everyone, Everywhere',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${SITE_URL}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'NewsMediaOrganization',
            name: 'EveryGyan',
            url: SITE_URL,
            logo: `${SITE_URL}/favicon.svg`,
            slogan: 'Knowledge for Everyone, Everywhere',
          },
        ]}
      />

      {/* Top Hero Grid: Lead Story + Latest News Column */}
      <section aria-label="Lead Story and Latest News">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8">
              <HeroSkeleton />
            </div>
            <div className="lg:col-span-4">
              <SidebarSkeleton />
            </div>
          </div>
        ) : leadStory ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 flex flex-col">
              <HeroLeadStory articles={[leadStory]} />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <LatestNewsSidebar articles={latestNews} />
            </div>
          </div>
        ) : (
          <EmptyState
            title="Welcome to EveryGyan"
            description="Our publication is getting ready. Connect your Supabase database or seed initial articles to preview."
            actionLabel="Refresh Articles"
            onAction={() => window.location.reload()}
          />
        )}
      </section>

      {/* Category Icons Row */}
      <section aria-label="Explore Topics">
        <CategoryPills />
      </section>

      {/* Featured Articles 3-Column Grid */}
      <section aria-label="Featured Articles">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Featured Articles
          </h2>
          <Link
            to="/category/tech"
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : featuredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No featured articles available.</p>
        )}
      </section>

      {/* Scenic Newsletter Banner */}
      <NewsletterBanner />
    </div>
  );
};

export default HomePage;
