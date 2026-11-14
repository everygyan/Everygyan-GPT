import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HeroLeadStory } from '../components/home/HeroLeadStory';
import { LatestNewsSidebar } from '../components/home/LatestNewsSidebar';
import { DailyPulseTicker } from '../components/home/DailyPulseTicker';
import { TopicCompass } from '../components/home/TopicCompass';
import { KnowledgeCapsules } from '../components/home/KnowledgeCapsules';
import { BrainLoungeSpotlight } from '../components/home/BrainLoungeSpotlight';
import { ArticleCard } from '../components/common/ArticleCard';
import { NewsletterBanner } from '../components/common/NewsletterBanner';
import { HeroSkeleton, SidebarSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Game2048Modal } from '../components/games/Game2048Modal';
import { ChessGameModal } from '../components/games/ChessGameModal';
import {
  fetchCarouselArticles,
  fetchLatestNews,
  fetchFeaturedArticles,
} from '../services/articleService';
import { Article } from '../types';
import { SeoHead, SITE_URL } from '../components/common/SeoHead';

export const HomePage: React.FC = () => {
  const [carouselArticles, setCarouselArticles] = useState<Article[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive Game Modals launched right from the homepage
  const [is2048Open, setIs2048Open] = useState(false);
  const [isChessOpen, setIsChessOpen] = useState(false);

  // Featured Articles Category Filter
  const [activeTab, setActiveTab] = useState<'all' | 'travel' | 'tech' | 'health'>('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [carousel, news, featured] = await Promise.all([
          fetchCarouselArticles(),
          fetchLatestNews(6),
          fetchFeaturedArticles(),
        ]);
        setCarouselArticles(carousel);
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

  // Filtered featured articles based on selected tab
  const displayedFeatured = useMemo(() => {
    if (activeTab === 'all') return featuredArticles;
    const filtered = featuredArticles.filter((art) => {
      const slug = (art.category_slug || '').toLowerCase();
      const cat = (art.category || '').toLowerCase();
      if (activeTab === 'travel') return slug.includes('travel') || cat.includes('travel');
      if (activeTab === 'tech') return slug.includes('tech') || cat.includes('tech') || slug.includes('ai') || cat.includes('ai');
      if (activeTab === 'health') return slug.includes('health') || cat.includes('health');
      return true;
    });
    return filtered.length > 0 ? filtered : featuredArticles;
  }, [featuredArticles, activeTab]);

  return (
    <div className="space-y-10 sm:space-y-14">
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
            '@type': 'Organization',
            additionalType: 'https://schema.org/NewsMediaOrganization',
            name: 'EveryGyan',
            url: SITE_URL,
            logo: `${SITE_URL}/favicon.svg`,
            slogan: 'Knowledge for Everyone, Everywhere',
            telephone: '+1-800-555-0199',
            email: 'contact@everygyan.com',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '100 Innovation Way',
              addressLocality: 'San Francisco',
              addressRegion: 'CA',
              postalCode: '94105',
              addressCountry: 'US',
            },
            contactPoint: [
              {
                '@type': 'ContactPoint',
                telephone: '+1-800-555-0199',
                contactType: 'editorial',
                email: 'contact@everygyan.com',
                availableLanguage: ['English', 'German'],
              },
            ],
            sameAs: [
              'https://twitter.com/everygyan',
              'https://facebook.com/everygyan',
              'https://linkedin.com/company/everygyan',
              'https://github.com/everygyan',
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is EveryGyan?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'EveryGyan is an independent digital knowledge publication featuring practical tutorials, language courses, travel guides, and online games.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is content on EveryGyan free to access?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, all editorial articles, language modules, and browser games on EveryGyan are completely free to read and play.',
                },
              },
            ],
          },
        ]}
      />

      {/* Visually hidden H1 for screen reader heading hierarchy */}
      <h1 className="sr-only">EveryGyan — Knowledge for Everyone, Everywhere</h1>

      {/* 1. Daily Live Pulse & Trending Ticker */}
      <DailyPulseTicker
        trendingArticles={latestNews}
        onOpenGames={() => setIs2048Open(true)}
      />

      {/* 2. Top Hero Grid: Lead Story + Latest News Column */}
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
        ) : carouselArticles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 flex flex-col">
              <HeroLeadStory articles={carouselArticles} />
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

      {/* 3. Knowledge Domains / Topic Compass Track */}
      <TopicCompass />

      {/* 4. Curator's Spotlight: Language, Logic & Audio Capsules */}
      <KnowledgeCapsules
        onPlay2048={() => setIs2048Open(true)}
        onPlayChess={() => setIsChessOpen(true)}
      />

      {/* 5. Midday Brain Lounge: 2048 & Chess Interactive Arena */}
      <BrainLoungeSpotlight
        onPlay2048={() => setIs2048Open(true)}
        onPlayChess={() => setIsChessOpen(true)}
      />

      {/* 6. Featured Articles & Editorial Deep Dives */}
      <section aria-label="Featured Articles" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 mb-1.5">
              <Sparkles className="w-3 h-3 text-red-600" />
              <span>Editorial Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Featured Articles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Carefully researched longform guides, benchmarks, and tactical tutorials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Category Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-semibold text-slate-600">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'travel', label: 'Travel' },
                  { id: 'tech', label: 'Tech & AI' },
                  { id: 'health', label: 'Health' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              to="/category/tech"
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-red-600 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : displayedFeatured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFeatured.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No featured articles available.</p>
        )}
      </section>

      {/* 7. Scenic Mountain Newsletter Banner */}
      <NewsletterBanner />

      {/* Interactive Game Modals */}
      <Game2048Modal isOpen={is2048Open} onClose={() => setIs2048Open(false)} />
      <ChessGameModal isOpen={isChessOpen} onClose={() => setIsChessOpen(false)} />
    </div>
  );
};

export default HomePage;
