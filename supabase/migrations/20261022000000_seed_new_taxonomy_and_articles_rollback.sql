-- ==============================================================================
-- EveryGyan — Rollback for Migration 20261022000000_seed_new_taxonomy_and_articles.sql
-- Description: Reverts the seeded articles and categories added in the migration.
-- ==============================================================================

DO $$
BEGIN
  -- 1. Remove seeded articles (identifying by slugs)
  DELETE FROM public.articles WHERE slug IN (
    'essential-tips-for-planning-your-first-around-the-world-trip',
    'sustainable-ecotourism-destinations-redefining-global-travel',
    'first-timers-guide-to-exploring-kyoto-and-tokyo-by-shinkansen',
    'scenic-norwegian-fjords-by-rail-and-ferry-complete-itinerary',
    'ultimate-pacific-coast-highway-road-trip-guide',
    'exploring-patagonia-a-complete-guide-to-torres-del-paine',
    'the-science-of-circadian-rhythms-optimizing-sleep-and-energy',
    'global-clean-energy-investment-surpasses-fossil-fuels',
    'breakthroughs-in-solid-state-batteries-signal-ev-revolution',
    'un-climate-summit-agrees-on-new-loss-and-damage-fund-framework',
    'high-speed-rail-networks-expand-rapidly-across-southeast-asia',
    'european-union-implements-comprehensive-ai-act-enforcement',
    'cross-border-night-trains-experience-massive-renaissance-in-central-europe',
    'nasa-artemis-lunar-mission-prepares-for-crewed-orbit',
    'renewable-microgrids-gain-traction-across-latin-america',
    'building-autonomous-ai-agents-with-tool-use-and-structured-outputs',
    'mastering-sap-btp-and-event-mesh-for-real-time-integrations',
    'mastering-german-articles-der-die-das-with-practical-memory-rules',
    'essential-german-for-the-workplace-professional-emails-and-meetings',
    'top-cloud-certifications-in-demand-for-2026-aws-gcp-azure',
    'modern-full-stack-roadmap-from-react-19-to-serverless-backends',
    'the-resurgence-of-imax-and-70mm-cinema-storytelling',
    'top-sci-fi-masterpieces-of-the-2020s-you-must-watch',
    'why-prestige-limited-series-are-outpacing-traditional-television',
    'must-watch-international-series-streaming-in-2026',
    'behind-the-scenes-at-the-cannes-film-festival-red-carpet',
    'actors-who-underwent-dramatic-physical-transformations-for-roles',
    'stunning-wildlife-photographs-from-the-national-geographic-awards',
    'architectural-marvels-of-the-ancient-world-in-high-definition',
    'essential-travel-gear-and-gadgets-worth-every-penny'
  );

  -- 2. Clean up newly created subcategories if they have no remaining articles
  DELETE FROM public.categories WHERE slug IN (
    'travel-world', 'travel-asia', 'travel-europe', 'travel-americas',
    'latest-news', 'news-world', 'news-asia', 'news-europe', 'news-americas',
    'learn-ai', 'learn-sap', 'learn-german', 'learn-updates',
    'entertainment-movies', 'entertainment-series', 'entertainment-celeb-news', 'entertainment-photos',
    'deals'
  ) AND id NOT IN (SELECT DISTINCT category_id FROM public.articles WHERE category_id IS NOT NULL);
END $$;
