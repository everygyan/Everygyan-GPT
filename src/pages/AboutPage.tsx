import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Compass,
  Sparkles,
  Globe,
  Tag,
  CheckCircle,
  Award,
} from 'lucide-react';
import { SeoHead, SITE_URL } from '../components/common/SeoHead';

const EDITORIAL_TEAM = [
  {
    name: 'Sandeep',
    role: 'Lead Travel, Tech & Enterprise Editor',
    bio: 'Enterprise architect and tech journalist specializing in SAP S/4HANA, cloud infrastructure, and family-friendly European rail expeditions.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    specialties: ['SAP & ABAP RAP', 'Multimodal AI', 'European Rail', 'Gear Reviews'],
  },
  {
    name: 'Dr. Neha Verma',
    role: 'Health & Wellness Editor',
    bio: 'Clinical researcher and wellness writer covering circadian biology, nutritional biochemistry, and sustainable lifestyle micro-habits.',
    avatar: 'https://images.unsplash.com/photo-1594824813572-c28f7478052f?auto=format&fit=crop&w=300&q=80',
    specialties: ['Circadian Rhythms', 'Evidence-Based Nutrition', 'Sleep Optimization'],
  },
  {
    name: 'Vikram Mehta',
    role: 'Global Affairs & Trade Analyst',
    bio: 'International macroeconomist analyzing multilateral treaties, clean energy finance, maritime trade corridors, and supply chain shifts.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    specialties: ['Global Trade', 'Energy Policy', 'International Accords'],
  },
  {
    name: 'Rahul Sharma',
    role: 'Sports & Regional News Correspondent',
    bio: 'Cricket analyst and South Asian affairs correspondent with focus on tactical match analytics, sports science, and regional transit.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    specialties: ['Cricket Tactics', 'High-Speed Rail', 'Regional Development'],
  },
  {
    name: 'Ananya Rao',
    role: 'Culture & Travel Editor',
    bio: 'Photojournalist documenting cultural heritage, eco-sanctuaries, Himalayan trails, and sustainable travel initiatives worldwide.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    specialties: ['Asia Travel', 'Wildlife Photography', 'Ecotourism'],
  },
  {
    name: 'Priya Patel',
    role: 'Entertainment & Film Critic',
    bio: 'Film historian and cultural critic tracking international cinema festivals, prestige television narratives, and theatrical innovations.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    specialties: ['70mm & IMAX Cinema', 'Prestige Series', 'Cannes Coverage'],
  },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-10 sm:py-16 space-y-16">
      <SeoHead
        title="About Us — Who We Are & What We Do | EveryGyan"
        description="EveryGyan is an independent digital publication dedicated to authoritative enterprise learning, global news, family travel guides, and honest tech gear reviews without paywalls."
        canonicalUrl="/about"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About EveryGyan',
          url: `${SITE_URL}/about`,
          description: 'Mission, editorial principles, team, and standards of EveryGyan.',
        }}
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-red-600 block">
          Who We Are & What We Do
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Knowledge for Everyone, <span className="text-red-600">Everywhere</span>
        </h1>
        <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal">
          EveryGyan was created on the core conviction that practical enterprise learning, independent world news, and culturally rich travel discovery belong in the public square — accessible to all readers without paywalls, pop-up traps, or algorithmic clickbait.
        </p>
      </div>

      {/* Who We Are: The EveryGyan Story */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 text-red-600 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>The EveryGyan Story</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Bridging Deep Technical Skills, Global Awareness, and Everyday Life
        </h2>
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          <p>
            The internet today is increasingly bifurcated: on one side stand walled gardens and expensive paywalls locking away essential knowledge; on the other lies sensationalized, AI-generated spam engineered solely for clicks.
          </p>
          <p>
            EveryGyan occupies a different space. We are an independent, digital-native publication built on meticulous research, verifiable citations, and real-world domain expertise. Whether decoding modern SAP S/4HANA CDS views for an aspiring developer, analyzing clean energy transitions for a policy researcher, or charting child-friendly hiking routes across the Swiss Alps, our work is produced to be actionable, truthful, and inspiring.
          </p>
          <p>
            We take pride in our name: <em>Gyan</em> represents wisdom, clarity, and lifelong learning. Our goal is to make that wisdom accessible to every curious mind, regardless of geographic location or economic background.
          </p>
        </div>
      </div>

      {/* What We Do: Four Core Pillars */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 block">
            Our Core Departments
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            What We Do
          </h2>
          <p className="text-slate-600 text-sm">
            Four specialized editorial pillars working under a single standard of integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: Enterprise Learning & AI */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Enterprise Tech & Skills Learning</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We author detailed, code-backed guides for modern developers and enterprise architects: SAP S/4HANA migrations, ABAP RESTful Application Programming Model (RAP), multimodal AI agents with tool use, German language proficiency for expatriates, and cloud architecture certifications.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hands-on code snippets tested against real cloud tenants</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero theoretical fluff — focused on production enterprise patterns</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Independent News & World Affairs */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Independent World & Regional News</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Fact-checked reporting covering geopolitics, international trade corridors, high-speed rail integration across Asia, European climate legislation, space exploration, and macroeconomic policy shifts across the Americas.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified against official treaty documents and statistical authorities</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contextual analysis beyond superficial 24-hour news cycles</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: Family Travel & Cultural Expeditions */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Cultural & Family Travel</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-world itineraries crafted for families and independent travelers: vetted transit links, step-free station access, daily budget ranges, safety caveats, and local cultural etiquette from Kyoto to the Norwegian fjords.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified transit cards and timetable schedules</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Strictly no invented prices, opening hours, or fake reviews</span>
              </li>
            </ul>
          </div>

          {/* Pillar 4: Tested Deals & Honest Reviews */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Curated Deals & Gear Reviews</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We test consumer tech, developer ultrabooks, noise-canceling headphones, and travel accessories. Every deal featured in our showcase is verified against price tracking tools to ensure genuine reader value.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transparent affiliate disclosures on every commercial link</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>No sponsored placements; reviews reflect honest editorial testing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Editorial Standards & Fact-Checking Process */}
      <div className="bg-slate-900 text-white p-8 sm:p-14 rounded-3xl shadow-xl space-y-8">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <span>Integrity By Design</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black">
          Our Editorial Standards & Verification Process
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-slate-300">
          <div className="space-y-2">
            <h4 className="font-bold text-white text-base">Primary Sources First</h4>
            <p className="leading-relaxed text-xs sm:text-sm text-slate-400">
              We link directly to official national tourism portals, open peer-reviewed studies, government gazettes, and software API references. We do not recycle secondary blog hearsay.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-white text-base">Transparent AI Policy</h4>
            <p className="leading-relaxed text-xs sm:text-sm text-slate-400">
              When automated workflows assist in synthesizing research or drafting outlines, every piece of content undergoes comprehensive human editorial review and code execution before publication.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-white text-base">Clear Corrections</h4>
            <p className="leading-relaxed text-xs sm:text-sm text-slate-400">
              When factual details require correction or regulatory policies change, we update articles promptly with transparent notes documenting what was modified and when.
            </p>
          </div>
        </div>
      </div>

      {/* Editorial Team & Leadership */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 block">
            Our People
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Meet the Editorial Team
          </h2>
          <p className="text-slate-600 text-sm">
            Experienced domain specialists, software architects, and journalists steering EveryGyan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EDITORIAL_TEAM.map((member) => (
            <div
              key={member.name}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-slate-100"
                    loading="lazy"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                    <p className="text-xs font-semibold text-red-600">{member.role}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{member.bio}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex flex-wrap gap-1.5">
                {member.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ethics & Reader Commitment */}
      <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center max-w-2xl mx-auto space-y-4">
        <Award className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900">Our Reader Commitment</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          We exist to serve our audience. Your trust is our most valuable asset. If you ever spot an error, have feedback on an itinerary, or wish to suggest a technical tutorial, reach out directly to our editorial team at{' '}
          <a
            href="mailto:editorial@everygyan.com"
            className="text-red-600 font-semibold hover:underline"
          >
            editorial@everygyan.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
