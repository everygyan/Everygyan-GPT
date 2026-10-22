import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  ExternalLink,
  ShieldCheck,
  Laptop,
  Headphones,
  Compass,
  BookOpen,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { SeoHead, SITE_URL } from '../components/common/SeoHead';
import { ArticleCard } from '../components/common/ArticleCard';
import { fetchArticlesByCategoryPaginated } from '../services/articleService';
import { Article } from '../types';

interface DealItem {
  id: string;
  category: 'laptops' | 'audio' | 'travel' | 'learning';
  title: string;
  badge: string;
  originalPrice: string;
  dealPrice: string;
  discount: string;
  rating: number;
  reviewsCount: number;
  image: string;
  specs: string[];
  affiliateUrl: string;
  merchant: string;
  editorNote: string;
}

const DEALS_ITEMS: DealItem[] = [
  {
    id: 'deal-macbook-air',
    category: 'laptops',
    title: 'Apple MacBook Air 13.6" (M2 Chip, 16GB RAM, 256GB SSD)',
    badge: "Editor's Choice",
    originalPrice: '₹99,900',
    dealPrice: '₹84,990',
    discount: '15% OFF',
    rating: 4.9,
    reviewsCount: 1420,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    specs: ['Apple M2 chip with 8-core CPU', '16GB Unified Memory for multitasking', 'Up to 18 hours battery life', '1.24 kg lightweight silent fanless build'],
    affiliateUrl: 'https://amazon.in',
    merchant: 'Amazon',
    editorNote: 'The gold standard for students and mobile professionals needing all-day battery and smooth performance.',
  },
  {
    id: 'deal-sony-wh1000xm5',
    category: 'audio',
    title: 'Sony WH-1000XM5 Wireless Active Noise-Canceling Headphones',
    badge: 'Top Travel Pick',
    originalPrice: '₹34,990',
    dealPrice: '₹26,990',
    discount: '23% OFF',
    rating: 4.8,
    reviewsCount: 3890,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    specs: ['Dual-processor Auto NC Optimizer', 'Up to 30 hours playback on single charge', 'Crystal clear hands-free calls with 4 beamforming mics', 'Multipoint connection for two devices'],
    affiliateUrl: 'https://amazon.in',
    merchant: 'Amazon',
    editorNote: 'Our top-tested headphones for long flights, train commutes, and open-plan office focus.',
  },
  {
    id: 'deal-anker-gan',
    category: 'travel',
    title: 'Anker 735 65W GaN Fast Charger (3-Port Fast Wall Adapter)',
    badge: 'Travel Essential',
    originalPrice: '₹4,999',
    dealPrice: '₹3,499',
    discount: '30% OFF',
    rating: 4.7,
    reviewsCount: 920,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    specs: ['Powers a laptop, tablet and phone simultaneously', 'High-efficiency GaN II technology', '53% smaller than standard 67W laptop bricks', 'Overcharge temperature protection'],
    affiliateUrl: 'https://amazon.in',
    merchant: 'Amazon',
    editorNote: 'Replaces three bulky adapters in your backpack, saving space and weight across international flights.',
  },
  {
    id: 'deal-asus-zenbook-14',
    category: 'laptops',
    title: 'ASUS Zenbook 14 OLED (Intel Core Ultra 7, 16GB RAM, 1TB SSD)',
    badge: 'Best Windows Ultrabook',
    originalPrice: '₹1,12,990',
    dealPrice: '₹94,990',
    discount: '16% OFF',
    rating: 4.7,
    reviewsCount: 610,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
    specs: ['14.0" 2.8K 120Hz Lumina OLED display', 'Intel AI Boost NPU for local generative tasks', '15+ hour battery with fast Type-C charging', 'Full military-grade MIL-STD 810H durability'],
    affiliateUrl: 'https://amazon.in',
    merchant: 'Amazon',
    editorNote: 'Stunning high-refresh OLED panel paired with cutting-edge Intel Core Ultra silicon.',
  },
  {
    id: 'deal-peak-design-bag',
    category: 'travel',
    title: 'Peak Design Everyday Backpack 20L (V2 Weatherproof)',
    badge: 'Premium Gear',
    originalPrice: '₹26,000',
    dealPrice: '₹22,500',
    discount: '13% OFF',
    rating: 4.9,
    reviewsCount: 1120,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    specs: ['100% recycled 400D weatherproof nylon canvas', 'Dual side zip access + secure top MagLatch', 'Customizable FlexFold internal dividers', 'Dedicated padded 15" laptop sleeve'],
    affiliateUrl: 'https://amazon.in',
    merchant: 'Amazon',
    editorNote: 'The ultimate commuter and travel backpack for photographers and digital nomads.',
  },
  {
    id: 'deal-sap-course',
    category: 'learning',
    title: 'SAP S/4HANA & ABAP RAP Masterclass: Cloud Developer Bootcamp',
    badge: 'Career Upskilling',
    originalPrice: '₹12,999',
    dealPrice: '₹4,999',
    discount: '62% OFF',
    rating: 4.9,
    reviewsCount: 2450,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    specs: ['42 hours on-demand hands-on video tutorials', 'Full Eclipse ADT & Core Data Services projects', 'Downloadable source code & interview guide', 'Official certificate of completion'],
    affiliateUrl: 'https://everygyan.com',
    merchant: 'EveryGyan Learning',
    editorNote: 'Structured roadmap covering real-world ABAP RAP, Fiori Elements, and BTP integrations.',
  },
];

export const DealsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    async function loadDealsArticles() {
      setLoadingArticles(true);
      try {
        const res = await fetchArticlesByCategoryPaginated('deals', 1, 6);
        setArticles(res.items);
      } catch (err) {
        console.error('Failed to load deals articles:', err);
      } finally {
        setLoadingArticles(false);
      }
    }
    loadDealsArticles();
  }, []);

  const filteredDeals =
    selectedFilter === 'all'
      ? DEALS_ITEMS
      : DEALS_ITEMS.filter((item) => item.category === selectedFilter);

  return (
    <div className="py-6 sm:py-10 space-y-10 sm:space-y-12">
      <SeoHead
        title="Curated Deals & Gear — Tested Gadgets & Discounts"
        description="Discover handpicked tech discounts, student laptop promotions, travel gadgets, and certified courses tested and recommended by EveryGyan editors."
        canonicalUrl="/deals"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'EveryGyan Verified Deals & Gear',
          url: `${SITE_URL}/deals`,
          description: 'Verified technology deals, laptop discounts, and travel gadgets.',
        }}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-12 rounded-3xl shadow-xl border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold uppercase tracking-wider border border-red-500/30 mb-4">
            <Tag className="w-3.5 h-3.5" />
            <span>Verified Deals & Gear</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Editor-Tested Gadgets, Laptops & Travel Gear
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Every product below has been rigorously assessed by EveryGyan editors for reliability, build quality, and genuine value. We track price histories to ensure discounts represent authentic savings.
          </p>
        </div>
      </div>

      {/* Transparent Affiliate Disclosure Alert */}
      <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200/90 rounded-2xl flex items-start gap-3.5 text-xs sm:text-sm text-amber-900 leading-relaxed shadow-sm">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Editorial Transparency & Reader Trust: </span>
          <span>
            EveryGyan is reader-supported. When you purchase through links on this page, we may earn an affiliate commission at no extra cost to you. We never accept payment or free merchandise in exchange for positive reviews or favored placements.
          </span>
        </div>
      </div>

      {/* Interactive Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
        {[
          { id: 'all', label: 'All Deals', icon: Sparkles },
          { id: 'laptops', label: 'Laptops & PCs', icon: Laptop },
          { id: 'audio', label: 'Audio & ANC', icon: Headphones },
          { id: 'travel', label: 'Travel Essentials', icon: Compass },
          { id: 'learning', label: 'Courses & Skills', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Deals Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Product Image & Badges */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                    {deal.badge}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-900/90 text-white text-[11px] font-bold rounded-lg shadow-sm">
                    {deal.discount}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                    Available on {deal.merchant}
                  </span>
                  <div className="flex items-center gap-1 font-bold text-amber-600">
                    <span>★ {deal.rating}</span>
                    <span className="text-slate-400 font-normal">({deal.reviewsCount})</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {deal.title}
                </h3>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-black text-slate-900">{deal.dealPrice}</span>
                  <span className="text-xs text-slate-400 line-through">{deal.originalPrice}</span>
                </div>

                {/* Specifications List */}
                <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  {deal.specs.map((spec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>

                {/* Editor Verdict */}
                <div className="pt-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic">
                  <span className="font-bold not-italic text-slate-800">Editor’s Verdict: </span>
                  {deal.editorNote}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-5 pt-0">
              <a
                href={deal.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <span>Check Deal on {deal.merchant}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* In-Depth Reviews & Buying Guides Section */}
      <div className="pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-1">
              Tested In Depth
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Buying Guides & Gear Reviews
            </h2>
          </div>
          <Link
            to="/category/deals"
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors"
          >
            All Deal Articles →
          </Link>
        </div>

        {loadingArticles ? (
          <div className="py-12 flex justify-center">
            <div className="w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No published deal guides yet.</p>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
