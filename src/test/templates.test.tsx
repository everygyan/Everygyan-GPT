import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TravelGuideTemplate } from '../components/article/TravelGuideTemplate';
import { TutorialTemplate } from '../components/article/TutorialTemplate';
import { saveArticle } from '../services/cmsService';
import { TravelTemplateData, TutorialTemplateData } from '../types';

describe('Travel Guide Template Component', () => {
  const mockTravelData: TravelTemplateData = {
    destination: 'Kyoto, Japan',
    best_time_to_visit: {
      season: 'March to May & October to November',
      note: 'Cherry blossoms and vibrant autumn foliage.',
      verified_date: 'October 2026',
    },
    transport: {
      arrival: 'Kansai International Airport (KIX), then Haruka Express.',
      local_transit: 'Kyoto City Bus & Subway IC card.',
      tip: 'Purchase an ICOCA card at Kansai Airport station.',
    },
    budget_ranges: {
      currency: 'JPY',
      daily_budget: '¥12,000 - ¥20,000 / day',
      verified_date: 'October 2026',
      notes: 'Includes mid-range ryokan accommodation, meals, and shrine entry fees.',
    },
    family_accessibility: {
      family_friendly: true,
      accessibility_notes: 'Most major temple grounds have gravel pathways; strollers recommended with larger rubber wheels.',
    },
    itinerary: [
      {
        day: 'Day 1',
        title: 'Higashiyama Historic District & Kiyomizu-dera',
        activities: ['Walk through preserved Sannenzaka lane', 'Visit Kiyomizu-dera main hall'],
      },
      {
        day: 'Day 2',
        title: 'Arashiyama Bamboo Grove & Tenryu-ji',
        activities: ['Morning walk in bamboo grove', 'Monkey Park Iwatayama hike'],
      },
    ],
    maps_links: [
      { title: 'Kyoto Official Tourism Guide', url: 'https://kyoto.travel' },
      { title: 'West Japan Railway Official Portal', url: 'https://www.westjr.co.jp' },
    ],
    safety_caveats:
      'Always carry passport identification as required by Japanese immigration. Check typhoon advisories during late summer.',
  };

  it('renders all travel guide sections when fully populated', () => {
    render(<TravelGuideTemplate data={mockTravelData} />);

    // Destination & Header
    expect(screen.getByRole('heading', { name: 'Kyoto, Japan' })).toBeInTheDocument();
    expect(screen.getByText('March to May & October to November')).toBeInTheDocument();
    expect(screen.getByText('Verified: October 2026')).toBeInTheDocument();

    // Transport & Logistics
    expect(screen.getByText(/Kansai International Airport/)).toBeInTheDocument();
    expect(screen.getByText(/Purchase an ICOCA card/)).toBeInTheDocument();

    // Budget
    expect(screen.getByText('¥12,000 - ¥20,000 / day')).toBeInTheDocument();
    expect(screen.getByText('(JPY)')).toBeInTheDocument();

    // Family & Accessibility
    expect(screen.getByText('Family & Child Friendly')).toBeInTheDocument();

    // Itinerary
    expect(screen.getByText('Higashiyama Historic District & Kiyomizu-dera')).toBeInTheDocument();
    expect(screen.getByText('Arashiyama Bamboo Grove & Tenryu-ji')).toBeInTheDocument();

    // Official Links
    expect(screen.getByText('Kyoto Official Tourism Guide')).toBeInTheDocument();

    // Caveats
    expect(screen.getByText(/Always carry passport identification/)).toBeInTheDocument();
  });

  it('strictly hides optional sections when empty or omitted', () => {
    const minimalTravelData: TravelTemplateData = {
      destination: 'Hallstatt, Austria',
    };

    render(<TravelGuideTemplate data={minimalTravelData} />);

    // Destination is present
    expect(screen.getByRole('heading', { name: 'Hallstatt, Austria' })).toBeInTheDocument();

    // Absent sections must NOT be rendered
    expect(screen.queryByText('Suggested Day-by-Day Itinerary')).toBeNull();
    expect(screen.queryByText('Official Maps & Regional Portals')).toBeNull();
    expect(screen.queryByText(/Safety & Travel Document Notice/)).toBeNull();
    expect(screen.queryByText(/Estimated Budget Range/)).toBeNull();
  });

  it('returns null and renders nothing when template data is completely empty', () => {
    const { container } = render(<TravelGuideTemplate data={{}} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('Learning / SAP Tutorial Template Component', () => {
  const mockTutorialData: TutorialTemplateData = {
    version_applicability: 'SAP S/4HANA 2023, ABAP RAP',
    difficulty_level: 'Intermediate',
    prerequisites: [
      'Basic relational SQL knowledge',
      'Eclipse IDE with ADT installed',
    ],
    learning_objectives: [
      'Build CDS View',
      'Expose OData V4 Service',
    ],
    steps: [
      {
        step_number: 1,
        title: 'Create ABAP Project in Eclipse',
        instructions: 'Open Eclipse and connect with valid developer credentials.',
        tip: 'Check developer key authorization.',
      },
      {
        step_number: 2,
        title: 'Define Data Definition in CDS',
        instructions: 'Right click package and select New Data Definition.',
        code_snippet: 'define view ZI_Demo as select from sflight { carrid, connid }',
      },
    ],
    troubleshooting: [
      {
        issue: 'Transport request missing',
        resolution: 'Create transport request in SE09 or assign transportable package.',
      },
    ],
    related_lessons: [
      { title: 'Advanced Fiori Elements', url_or_slug: 'advanced-fiori-elements' },
    ],
  };

  it('renders all tutorial components when fully populated', () => {
    render(
      <MemoryRouter>
        <TutorialTemplate data={mockTutorialData} />
      </MemoryRouter>
    );

    // Metadata
    expect(screen.getByText('SAP S/4HANA 2023, ABAP RAP')).toBeInTheDocument();
    expect(screen.getByText('Level: Intermediate')).toBeInTheDocument();

    // Prerequisites & Objectives
    expect(screen.getByText('Basic relational SQL knowledge')).toBeInTheDocument();
    expect(screen.getByText('Build CDS View')).toBeInTheDocument();

    // Steps & Code Snippet
    expect(screen.getByText('Create ABAP Project in Eclipse')).toBeInTheDocument();
    expect(screen.getByText('define view ZI_Demo as select from sflight { carrid, connid }')).toBeInTheDocument();
    expect(screen.getByText(/Check developer key authorization/)).toBeInTheDocument();

    // Troubleshooting
    expect(screen.getByText('Transport request missing')).toBeInTheDocument();
    expect(screen.getByText(/Create transport request in SE09/)).toBeInTheDocument();

    // Related Lessons
    expect(screen.getByText('Advanced Fiori Elements')).toBeInTheDocument();
  });

  it('strictly hides optional sections when omitted in tutorial', () => {
    const minimalTutorial: TutorialTemplateData = {
      version_applicability: 'SAP S/4HANA 2023',
    };

    render(
      <MemoryRouter>
        <TutorialTemplate data={minimalTutorial} />
      </MemoryRouter>
    );

    expect(screen.getByText('SAP S/4HANA 2023')).toBeInTheDocument();

    // Absent sections must NOT render
    expect(screen.queryByText('Prerequisites')).toBeNull();
    expect(screen.queryByText('Learning Objectives')).toBeNull();
    expect(screen.queryByText('Step-by-Step Implementation')).toBeNull();
    expect(screen.queryByText('Troubleshooting & Gotchas')).toBeNull();
    expect(screen.queryByText('Related Lessons & Further Study')).toBeNull();
  });

  it('returns null when tutorial data is empty', () => {
    const { container } = render(
      <MemoryRouter>
        <TutorialTemplate data={{}} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('CMS Template Persistence & Validation', () => {
  it('saves an article with travel template attributes successfully', async () => {
    const travelPayload = {
      title: 'Top Alps Family Itinerary for Summer',
      content: 'Comprehensive travel guide covering alpine destinations, trains, and family lodges.',
      category: 'Travel',
      category_slug: 'travel',
      status: 'draft' as const,
      template_type: 'travel' as const,
      template_data: {
        destination: 'Bernese Oberland, Switzerland',
        budget_ranges: {
          currency: 'CHF',
          daily_budget: 'CHF 150 / day',
          verified_date: 'October 2026',
        },
      },
    };

    const authorUser = { id: 'usr-author-1', name: 'Travel Author', role: 'author' as const };
    const res = await saveArticle(travelPayload, authorUser);

    expect(res.error).toBeNull();
    expect(res.data).not.toBeNull();
    expect(res.data?.template_type).toBe('travel');
    expect((res.data?.template_data as TravelTemplateData)?.destination).toBe('Bernese Oberland, Switzerland');
  });

  it('saves an article with tutorial template attributes successfully', async () => {
    const tutorialPayload = {
      title: 'Building SAP RAP Managed Business Objects',
      content: 'Detailed step by step tutorial on defining RAP behavior definitions and database tables.',
      category: 'Learning',
      category_slug: 'learning',
      status: 'draft' as const,
      template_type: 'tutorial' as const,
      template_data: {
        version_applicability: 'SAP BTP ABAP Environment 2402',
        difficulty_level: 'Advanced',
      },
    };

    const editorUser = { id: 'usr-editor-1', name: 'SAP Editor', role: 'editor' as const };
    const res = await saveArticle(tutorialPayload, editorUser);

    expect(res.error).toBeNull();
    expect(res.data).not.toBeNull();
    expect(res.data?.template_type).toBe('tutorial');
    expect((res.data?.template_data as TutorialTemplateData)?.version_applicability).toBe(
      'SAP BTP ABAP Environment 2402'
    );
  });
});
