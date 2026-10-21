import { Article, Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-tech',
    name: 'Tech',
    slug: 'tech',
    description: 'Artificial intelligence, software engineering, gadgets, and digital trends.',
    icon: 'Cpu',
    color: '#2563eb',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
  },
  {
    id: 'cat-health',
    name: 'Health',
    slug: 'health',
    description: 'Evidence-based wellness, nutrition, fitness, and longevity advice.',
    icon: 'Heart',
    color: '#059669',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
  },
  {
    id: 'cat-geopolitics',
    name: 'Geopolitics',
    slug: 'geopolitics',
    description: 'International diplomacy, global trade routes, macroeconomics, and policy.',
    icon: 'Globe',
    color: '#4f46e5',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
  },
  {
    id: 'cat-sports',
    name: 'Sports',
    slug: 'sports',
    description: 'Cricket, global athletics, championship analysis, and fitness culture.',
    icon: 'Trophy',
    color: '#d97706',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
  },
  {
    id: 'cat-travel',
    name: 'Travel',
    slug: 'travel',
    description: 'Family-friendly itineraries, budget guides, cultural landmarks, and tips.',
    icon: 'Compass',
    color: '#e11d48',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
  },
  {
    id: 'cat-learning',
    name: 'Learning',
    slug: 'learning',
    description: 'In-depth SAP workflows, cloud computing tutorials, and career development.',
    icon: 'BookOpen',
    color: '#7c3aed',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
  },
];

export const SEED_ARTICLES: Article[] = [
  {
    id: 'art-lead-1',
    title: '10 Amazing Places to Visit in Europe with Family',
    slug: '10-amazing-places-to-visit-in-europe-with-family',
    excerpt: 'From fairytale towns to breathtaking alpine landscapes, discover the best family-friendly destinations in Europe that are fun, safe and budget-friendly.',
    content: `
Travelling with family can be one of the most rewarding experiences. Europe offers a perfect mix of culture, adventure, and safety, making it an ideal destination for families. Here are some of the top places you should consider for your next trip.

## 1. Vienna, Austria
Vienna is renowned for its imperial palaces, immaculate parks, and family-oriented museums. The Prater amusement park and Schönbrunn Zoo offer entertainment for children of all ages, while parents can enjoy world-class coffee house culture and historic architecture.

## 2. Hallstatt, Austria
Tucked away between tranquil alpine waters and soaring mountain ranges, Hallstatt feels like stepping straight into a classic storybook. Explore the world's oldest salt mine with subterranean wooden slides and take panoramic boat rides across the mirror-like lake.

## 3. Prague, Czech Republic
Known as the City of a Hundred Spires, Prague enchants visitors with its medieval astronomical clock, pedestrian-friendly Charles Bridge, and majestic castle complex overlooking the Vltava river.

## 4. Interlaken, Switzerland
Nestled in the heart of the Bernese Oberland, Interlaken is Europe's premier adventure gateway. Families can board scenic cogwheel railways up to Jungfraujoch — the Top of Europe — explore crystal-clear turquoise lakes, and embark on gentle alpine meadow hikes.
    `,
    cover_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    cover_caption: 'Breathtaking alpine vistas and serene lakes across central Europe.',
    category: 'Travel',
    category_slug: 'travel',
    author: {
      id: 'usr-sandeep',
      name: 'Sandeep',
      role: 'Lead Travel & Tech Editor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    tags: ['Europe', 'Family Travel', 'Austria', 'Switzerland', 'Budget Travel'],
    status: 'published',
    published_at: 'Oct 20, 2026',
    read_time: '8 min read',
    is_lead_story: true,
    is_featured: false,
    is_carousel: true,
    views_count: 2480,
    table_of_contents: [
      { id: '1-vienna-austria', title: '1. Vienna, Austria', level: 2 },
      { id: '2-hallstatt-austria', title: '2. Hallstatt, Austria', level: 2 },
      { id: '3-prague-czech-republic', title: '3. Prague, Czech Republic', level: 2 },
      { id: '4-interlaken-switzerland', title: '4. Interlaken, Switzerland', level: 2 },
    ],
    references: [
      { title: 'Austrian National Tourist Office Official Portal', url: 'https://www.austria.info' },
      { title: 'Swiss Federal Railways (SBB) Family Travel Information', url: 'https://www.sbb.ch' },
    ],
    template_type: 'travel',
    template_data: {
      destination: 'Central Europe (Austria, Czech Republic, Switzerland)',
      best_time_to_visit: {
        season: 'May to September & December',
        note: 'Late spring and summer are optimal for alpine lake excursions; December offers world-renowned holiday markets. Always verify local seasonal hours.',
        verified_date: 'October 2026',
      },
      transport: {
        arrival: 'International flights into Vienna International (VIE) or Zurich Airport (ZRH).',
        local_transit: 'Integrated Eurail and Swiss Travel Pass (SBB) network with regional cogwheel trains.',
        tip: 'Book long-distance OBB Railjet and SBB seat reservations at least 2 weeks in advance during summer.',
      },
      budget_ranges: {
        currency: 'EUR / CHF',
        daily_budget: '€85 - €160 / day',
        verified_date: 'October 2026',
        notes: 'Estimated mid-range family daily spend covering regional transit cards, museum family tickets, and local dining.',
      },
      family_accessibility: {
        family_friendly: true,
        accessibility_notes: 'All major Austrian and Swiss central rail stations provide step-free access, dedicated elevators, and family quiet compartments.',
      },
      itinerary: [
        {
          day: 'Days 1-2',
          title: 'Vienna Imperial Parks & Prater',
          activities: [
            'Schönbrunn Palace gardens & children pavilion',
            'Historic Prater Riesenrad giant ferris wheel',
            'Interactive Haus der Musik sound museum',
          ],
        },
        {
          day: 'Days 3-4',
          title: 'Hallstatt Alpine Lakes & Historic Salt Mine',
          activities: [
            'Electric boat cruise on mirror-like Lake Hallstatt',
            'Salzwelten funicular ascent and subterranean wooden miners slide',
            'Skywalk World Heritage viewpoint',
          ],
        },
        {
          day: 'Days 5-7',
          title: 'Interlaken & Bernese Oberland',
          activities: [
            'Cogwheel railway to Jungfraujoch Top of Europe',
            'Lake Brienz scenic historic paddle-steamer',
            'Family walking trail from First to Bachalpsee',
          ],
        },
      ],
      maps_links: [
        { title: 'Austrian National Tourist Office Official Portal', url: 'https://www.austria.info' },
        { title: 'Swiss Federal Railways (SBB) Family Travel Information', url: 'https://www.sbb.ch' },
      ],
      safety_caveats:
        'Ensure all travel passports have at least 6 months remaining validity before entering the Schengen area. Verify visa eligibility and comprehensive health/trip cancellation coverage before booking.',
    },
  },
  {
    id: 'art-news-1',
    title: 'The Future of AI: How Gemini is Changing the Way We Work',
    slug: 'the-future-of-ai-how-gemini-is-changing-the-way-we-work',
    excerpt: 'Exploring how multimodal generative intelligence is streamlining software engineering, editorial operations, and business productivity.',
    content: 'Deep diving into agentic architectures, context windows, and modern workflow automation.',
    cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    category: 'Tech',
    category_slug: 'tech',
    author: { id: 'usr-sandeep', name: 'Sandeep' },
    tags: ['AI', 'Productivity', 'Technology'],
    status: 'published',
    published_at: 'Oct 20, 2026',
    read_time: '5 min read',
    is_lead_story: false,
    is_featured: false,
    is_carousel: true,
  },
  {
    id: 'art-news-2',
    title: 'Simple Habits for a Healthier and Happier Life',
    slug: 'simple-habits-for-a-healthier-and-happier-life',
    excerpt: 'Science-backed daily micro-habits that improve sleep quality, reduce cognitive fatigue, and enhance physical vitality.',
    content: 'Actionable guidance on morning sunlight, progressive resistance training, and hydration.',
    cover_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
    category: 'Health',
    category_slug: 'health',
    author: { id: 'usr-dr-neha', name: 'Dr. Neha Verma' },
    tags: ['Wellness', 'Habits', 'Mental Health'],
    status: 'published',
    published_at: 'Oct 19, 2026',
    read_time: '6 min read',
    is_lead_story: false,
    is_featured: false,
  },
  {
    id: 'art-news-3',
    title: "What's Next for Global Trade in 2026?",
    slug: 'whats-next-for-global-trade-in-2026',
    excerpt: 'Supply chain diversification, semiconductor corridors, and geopolitical realignments reshaping international commerce.',
    content: 'Macroeconomic analysis of shipping lanes and bilateral agreements.',
    cover_image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=400&q=80',
    category: 'Geopolitics',
    category_slug: 'geopolitics',
    author: { id: 'usr-vikram', name: 'Vikram Mehta' },
    tags: ['Trade', 'Economy', 'Policy'],
    status: 'published',
    published_at: 'Oct 18, 2026',
    read_time: '7 min read',
    is_lead_story: false,
    is_featured: false,
  },
  {
    id: 'art-news-4',
    title: "India's Journey in the T20 World Cup",
    slug: 'indias-journey-in-the-t20-world-cup',
    excerpt: 'Tactical breakdown of bowling rotations, aggressive middle-order fielding, and key championship milestones.',
    content: 'Performance analysis and stats review from the recent tournament matches.',
    cover_image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80',
    category: 'Sports',
    category_slug: 'sports',
    author: { id: 'usr-rahul', name: 'Rahul Sharma' },
    tags: ['Cricket', 'T20', 'World Cup'],
    status: 'published',
    published_at: 'Oct 17, 2026',
    read_time: '4 min read',
    is_lead_story: false,
    is_featured: false,
  },
  {
    id: 'art-featured-1',
    title: 'Best Laptops for Students in 2026 (Under ₹70,000)',
    slug: 'best-laptops-for-students-in-2026-under-70000',
    excerpt: 'Find the perfect laptop for your studies, creative work or everyday use — with our top picks tested for battery life and performance.',
    content: 'Comprehensive testing and benchmarks comparing thermal performance, battery endurance, and keyboards.',
    cover_image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    category: 'Tech',
    category_slug: 'tech',
    author: { id: 'usr-sandeep', name: 'Sandeep' },
    tags: ['Laptops', 'Students', 'Hardware', 'Reviews'],
    status: 'published',
    published_at: 'Oct 19, 2026',
    read_time: '6 min read',
    is_lead_story: false,
    is_featured: true,
  },
  {
    id: 'art-featured-2',
    title: 'Top 5 Beaches in India for a Perfect Getaway',
    slug: 'top-5-beaches-in-india-for-a-perfect-getaway',
    excerpt: 'Crystal clear waters, golden sands and unforgettable experiences await you in these serene coastal paradises.',
    content: 'Exploring secluded coastlines from the Andaman Islands to South Goa and Gokarna.',
    cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    category: 'Travel',
    category_slug: 'travel',
    author: { id: 'usr-ananya', name: 'Ananya Rao' },
    tags: ['Beaches', 'India', 'Travel', 'Getaway'],
    status: 'published',
    published_at: 'Oct 18, 2026',
    read_time: '7 min read',
    is_lead_story: false,
    is_featured: true,
    is_carousel: true,
  },
  {
    id: 'art-featured-3',
    title: 'Why Learning SAP Can Boost Your Career',
    slug: 'why-learning-sap-can-boost-your-career',
    excerpt: 'Explore the key benefits, career opportunities and structured learning paths for enterprise SAP professionals.',
    content: 'Detailed roadmap covering SAP S/4HANA migration, ABAP on Cloud, and enterprise integration.',
    cover_image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    category: 'Learning',
    category_slug: 'learning',
    author: { id: 'usr-sandeep', name: 'Sandeep' },
    tags: ['SAP', 'ERP', 'Enterprise', 'Career'],
    status: 'published',
    published_at: 'Oct 17, 2026',
    read_time: '8 min read',
    is_lead_story: false,
    is_featured: true,
    template_type: 'tutorial',
    template_data: {
      version_applicability: 'SAP S/4HANA 2023 / Cloud 2402, ABAP RESTful Application Programming Model (RAP)',
      difficulty_level: 'Intermediate',
      prerequisites: [
        'Basic familiarity with relational database schema and SQL syntax',
        'Active developer tenant or access to SAP BTP Free Tier / SAP S/4HANA Trial System',
        'Eclipse IDE with ABAP Development Tools (ADT) plugin installed and configured',
      ],
      learning_objectives: [
        'Understand the architectural shift from legacy ERP table queries to CDS views',
        'Build and activate a Core Data Services (CDS) Data Definition in Eclipse ADT',
        'Expose CDS views via an OData V4 Service Binding and test live with SAP Fiori Preview',
      ],
      steps: [
        {
          step_number: 1,
          title: 'Connect Eclipse ADT to your SAP S/4HANA ABAP Backend',
          instructions:
            'Open Eclipse IDE with the ADT plugin installed. Select File > New > ABAP Project. Select your SAP system from SAP Logon or enter the system host details, client (e.g., 100), user, and password.',
          tip: 'Verify that your user has developer authorization object S_DEVELOP assigned in transaction SU01.',
        },
        {
          step_number: 2,
          title: 'Create your Core Data Services (CDS) Data Definition',
          instructions:
            'In the Project Explorer, expand your development package. Right-click Core Data Services > Data Definitions > New Data Definition. Give it a name such as ZI_FlightDemo and enter a descriptive label.',
          code_snippet: `@AbapCatalog.sqlViewName: 'ZV_FLIGHT_DEMO'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Flight Data Definition'
define view ZI_FlightDemo as select from sflight {
  key carrid as CarrierId,
  key connid as ConnectionId,
  key fldate as FlightDate,
  price      as Price,
  currency   as CurrencyCode,
  planetype  as PlaneType
}`,
          tip: 'Press Ctrl+F3 to activate the CDS view. Review Problems tab to ensure zero syntax warnings.',
        },
        {
          step_number: 3,
          title: 'Expose as OData V4 Service & Preview in SAP Fiori',
          instructions:
            'Right-click your newly activated CDS view > New Business Services > Service Definition. Expose entity ZI_FlightDemo. Next, right-click the Service Definition and select New Service Binding with Binding Type "OData V4 - UI". Click Activate then Publish.',
          tip: 'Select the exposed entity in the Service Binding and double-click to launch the browser-based Fiori Elements Preview.',
        },
      ],
      troubleshooting: [
        {
          issue: 'Package $TMP is not transportable',
          resolution:
            'Local package $TMP is restricted to temporary prototyping. For permanent development, assign an approved transportable workbench request with package starting with Z or Y.',
        },
        {
          issue: 'HTTP 403 Forbidden when publishing Service Binding',
          resolution:
            'Verify user authorizations in SAP transaction /IWFND/MAINT_SERVICE and ensure your developer profile includes authorization object /IWFND/AUTH.',
        },
      ],
      related_lessons: [
        {
          title: 'Introduction to SAP Fiori Elements Floorplans',
          url_or_slug: 'why-learning-sap-can-boost-your-career',
        },
      ],
    },
  },
];
