import { supabase, isSupabaseConfigured } from './supabase';
import { AboutPageContent, EditorialTeamMember } from '../types';

export const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
  hero_tagline: 'Who We Are & What We Do',
  hero_title: 'Knowledge for Everyone, Everywhere',
  hero_highlight: 'Everywhere',
  hero_description:
    'EveryGyan was created on the core conviction that practical enterprise learning, independent world news, and culturally rich travel discovery belong in the public square — accessible to all readers without paywalls, pop-up traps, or algorithmic clickbait.',
  story_badge: 'The EveryGyan Story',
  story_title: 'Bridging Deep Technical Skills, Global Awareness, and Everyday Life',
  story_paragraphs: [
    'The internet today is increasingly bifurcated: on one side stand walled gardens and expensive paywalls locking away essential knowledge; on the other lies sensationalized, AI-generated spam engineered solely for clicks.',
    'EveryGyan occupies a different space. We are an independent, digital-native publication built on meticulous research, verifiable citations, and real-world domain expertise. Whether decoding modern SAP S/4HANA CDS views for an aspiring developer, analyzing clean energy transitions for a policy researcher, or charting child-friendly hiking routes across the Swiss Alps, our work is produced to be actionable, truthful, and inspiring.',
    'We take pride in our name: Gyan represents wisdom, clarity, and lifelong learning. Our goal is to make that wisdom accessible to every curious mind, regardless of geographic location or economic background.',
  ],
  pillars: [
    {
      icon: 'BookOpen',
      color: 'purple',
      title: 'Enterprise Tech & Skills Learning',
      description:
        'We author detailed, code-backed guides for modern developers and enterprise architects: SAP S/4HANA migrations, ABAP RESTful Application Programming Model (RAP), multimodal AI agents with tool use, German language proficiency for expatriates, and cloud architecture certifications.',
      bullets: [
        'Hands-on code snippets tested against real cloud tenants',
        'Zero theoretical fluff — focused on production enterprise patterns',
      ],
    },
    {
      icon: 'Globe',
      color: 'blue',
      title: 'Independent World & Regional News',
      description:
        'Fact-checked reporting covering geopolitics, international trade corridors, high-speed rail integration across Asia, European climate legislation, space exploration, and macroeconomic policy shifts across the Americas.',
      bullets: [
        'Verified against official treaty documents and statistical authorities',
        'Contextual analysis beyond superficial 24-hour news cycles',
      ],
    },
    {
      icon: 'Compass',
      color: 'rose',
      title: 'Cultural & Family Travel',
      description:
        'Real-world itineraries crafted for families and independent travelers: vetted transit links, step-free station access, daily budget ranges, safety caveats, and local cultural etiquette from Kyoto to the Norwegian fjords.',
      bullets: [
        'Verified transit cards and timetable schedules',
        'Strictly no invented prices, opening hours, or fake reviews',
      ],
    },
    {
      icon: 'Tag',
      color: 'amber',
      title: 'Curated Deals & Gear Reviews',
      description:
        'We test consumer tech, developer ultrabooks, noise-canceling headphones, and travel accessories. Every deal featured in our showcase is verified against price tracking tools to ensure genuine reader value.',
      bullets: [
        'Transparent affiliate disclosures on every commercial link',
        'No sponsored placements; reviews reflect honest editorial testing',
      ],
    },
  ],
  standards_badge: 'Integrity By Design',
  standards_title: 'Our Editorial Standards & Verification Process',
  standards_items: [
    {
      title: 'Primary Sources First',
      description:
        'We link directly to official national tourism portals, open peer-reviewed studies, government gazettes, and software API references. We do not recycle secondary blog hearsay.',
    },
    {
      title: 'Transparent AI Policy',
      description:
        'When automated workflows assist in synthesizing research or drafting outlines, every piece of content undergoes comprehensive human editorial review and code execution before publication.',
    },
    {
      title: 'Clear Corrections',
      description:
        'When factual details require correction or regulatory policies change, we update articles promptly with transparent notes documenting what was modified and when.',
    },
  ],
  commitment_title: 'Our Reader Commitment',
  commitment_text:
    'We exist to serve our audience. Your trust is our most valuable asset. If you ever spot an error, have feedback on an itinerary, or wish to suggest a technical tutorial, reach out directly to our editorial team at editorial@everygyan.com.',
  commitment_email: 'editorial@everygyan.com',
};

export const DEFAULT_EDITORIAL_TEAM: EditorialTeamMember[] = [
  {
    id: 'team-sandeep',
    name: 'Sandeep',
    role: 'Lead Travel, Tech & Enterprise Editor',
    bio: 'Enterprise architect and tech journalist specializing in SAP S/4HANA, cloud infrastructure, and family-friendly European rail expeditions.',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    specialties: ['SAP & ABAP RAP', 'Multimodal AI', 'European Rail', 'Gear Reviews'],
    display_order: 1,
  },
  {
    id: 'team-neha',
    name: 'Dr. Neha Verma',
    role: 'Health & Wellness Editor',
    bio: 'Clinical researcher and wellness writer covering circadian biology, nutritional biochemistry, and sustainable lifestyle micro-habits.',
    avatar:
      'https://images.unsplash.com/photo-1594824813572-c28f7478052f?auto=format&fit=crop&w=300&q=80',
    specialties: ['Circadian Rhythms', 'Evidence-Based Nutrition', 'Sleep Optimization'],
    display_order: 2,
  },
  {
    id: 'team-vikram',
    name: 'Vikram Mehta',
    role: 'Global Affairs & Trade Analyst',
    bio: 'International macroeconomist analyzing multilateral treaties, clean energy finance, maritime trade corridors, and supply chain shifts.',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    specialties: ['Global Trade', 'Energy Policy', 'International Accords'],
    display_order: 3,
  },
  {
    id: 'team-rahul',
    name: 'Rahul Sharma',
    role: 'Sports & Regional News Correspondent',
    bio: 'Cricket analyst and South Asian affairs correspondent with focus on tactical match analytics, sports science, and regional transit.',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    specialties: ['Cricket Tactics', 'High-Speed Rail', 'Regional Development'],
    display_order: 4,
  },
  {
    id: 'team-ananya',
    name: 'Ananya Rao',
    role: 'Culture & Travel Editor',
    bio: 'Photojournalist documenting cultural heritage, eco-sanctuaries, Himalayan trails, and sustainable travel initiatives worldwide.',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    specialties: ['Asia Travel', 'Wildlife Photography', 'Ecotourism'],
    display_order: 5,
  },
  {
    id: 'team-priya',
    name: 'Priya Patel',
    role: 'Entertainment & Film Critic',
    bio: 'Film historian and cultural critic tracking international cinema festivals, prestige television narratives, and theatrical innovations.',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    specialties: ['70mm & IMAX Cinema', 'Prestige Series', 'Cannes Coverage'],
    display_order: 6,
  },
];

// In-memory fallback stores for local development without DB
let localAboutContent: AboutPageContent = { ...DEFAULT_ABOUT_CONTENT };
let localTeamStore: EditorialTeamMember[] = [...DEFAULT_EDITORIAL_TEAM];

/**
 * Fetches the About Us page content and team members
 */
export async function fetchAboutPageData(): Promise<{
  content: AboutPageContent;
  team: EditorialTeamMember[];
}> {
  if (!isSupabaseConfigured) {
    return {
      content: localAboutContent,
      team: [...localTeamStore].sort((a, b) => a.display_order - b.display_order),
    };
  }

  try {
    const [contentRes, teamRes] = await Promise.all([
      supabase.from('about_page_content').select('*').eq('id', 'main').maybeSingle(),
      supabase.from('editorial_team').select('*').order('display_order', { ascending: true }),
    ]);

    let content = localAboutContent;
    if (contentRes.data && !contentRes.error) {
      content = {
        hero_tagline: contentRes.data.hero_tagline || DEFAULT_ABOUT_CONTENT.hero_tagline,
        hero_title: contentRes.data.hero_title || DEFAULT_ABOUT_CONTENT.hero_title,
        hero_highlight: contentRes.data.hero_highlight || DEFAULT_ABOUT_CONTENT.hero_highlight,
        hero_description: contentRes.data.hero_description || DEFAULT_ABOUT_CONTENT.hero_description,
        story_badge: contentRes.data.story_badge || DEFAULT_ABOUT_CONTENT.story_badge,
        story_title: contentRes.data.story_title || DEFAULT_ABOUT_CONTENT.story_title,
        story_paragraphs: Array.isArray(contentRes.data.story_paragraphs)
          ? contentRes.data.story_paragraphs
          : DEFAULT_ABOUT_CONTENT.story_paragraphs,
        pillars: Array.isArray(contentRes.data.pillars)
          ? contentRes.data.pillars
          : DEFAULT_ABOUT_CONTENT.pillars,
        standards_badge: contentRes.data.standards_badge || DEFAULT_ABOUT_CONTENT.standards_badge,
        standards_title: contentRes.data.standards_title || DEFAULT_ABOUT_CONTENT.standards_title,
        standards_items: Array.isArray(contentRes.data.standards_items)
          ? contentRes.data.standards_items
          : DEFAULT_ABOUT_CONTENT.standards_items,
        commitment_title: contentRes.data.commitment_title || DEFAULT_ABOUT_CONTENT.commitment_title,
        commitment_text: contentRes.data.commitment_text || DEFAULT_ABOUT_CONTENT.commitment_text,
        commitment_email: contentRes.data.commitment_email || DEFAULT_ABOUT_CONTENT.commitment_email,
        updated_at: contentRes.data.updated_at,
      };
      localAboutContent = content;
    }

    let team = localTeamStore;
    if (teamRes.data && !teamRes.error && teamRes.data.length > 0) {
      team = teamRes.data.map((m: Record<string, unknown>) => ({
        id: String(m.id),
        name: String(m.name || ''),
        role: String(m.role || ''),
        bio: String(m.bio || ''),
        avatar: String(m.avatar || ''),
        specialties: Array.isArray(m.specialties) ? (m.specialties as string[]) : [],
        display_order: Number(m.display_order ?? 0),
        created_at: m.created_at ? String(m.created_at) : undefined,
        updated_at: m.updated_at ? String(m.updated_at) : undefined,
      }));
      localTeamStore = team;
    }

    return { content, team };
  } catch (err) {
    console.warn('[aboutService] Failed to fetch from Supabase, using local defaults:', err);
    return {
      content: localAboutContent,
      team: [...localTeamStore].sort((a, b) => a.display_order - b.display_order),
    };
  }
}

/**
 * Updates the About Us page content
 */
export async function updateAboutPageContent(
  updates: Partial<AboutPageContent>
): Promise<{ success: boolean; error?: string }> {
  const merged: AboutPageContent = {
    ...localAboutContent,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  localAboutContent = merged;

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const payload = {
      id: 'main',
      hero_tagline: merged.hero_tagline,
      hero_title: merged.hero_title,
      hero_highlight: merged.hero_highlight,
      hero_description: merged.hero_description,
      story_badge: merged.story_badge,
      story_title: merged.story_title,
      story_paragraphs: merged.story_paragraphs,
      pillars: merged.pillars,
      standards_badge: merged.standards_badge,
      standards_title: merged.standards_title,
      standards_items: merged.standards_items,
      commitment_title: merged.commitment_title,
      commitment_text: merged.commitment_text,
      commitment_email: merged.commitment_email,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('about_page_content').upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('[aboutService] Supabase upsert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error updating about content';
    return { success: false, error: message };
  }
}

/**
 * Creates a new editorial team member
 */
export async function createTeamMember(
  member: Omit<EditorialTeamMember, 'id' | 'created_at' | 'updated_at'>
): Promise<{ member: EditorialTeamMember | null; error?: string }> {
  const tempId = `team-${Date.now()}`;
  const newMember: EditorialTeamMember = {
    id: tempId,
    ...member,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    localTeamStore.push(newMember);
    return { member: newMember };
  }

  try {
    const { data, error } = await supabase
      .from('editorial_team')
      .insert({
        name: member.name,
        role: member.role,
        bio: member.bio,
        avatar: member.avatar,
        specialties: member.specialties,
        display_order: member.display_order,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[aboutService] createTeamMember error:', error);
      // fallback locally so user still sees it
      localTeamStore.push(newMember);
      return { member: newMember, error: error.message };
    }

    const created: EditorialTeamMember = {
      id: String(data.id),
      name: String(data.name),
      role: String(data.role),
      bio: String(data.bio),
      avatar: String(data.avatar),
      specialties: Array.isArray(data.specialties) ? data.specialties : [],
      display_order: Number(data.display_order ?? 0),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    localTeamStore.push(created);
    return { member: created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create team member';
    return { member: newMember, error: message };
  }
}

/**
 * Updates an existing editorial team member
 */
export async function updateTeamMember(
  id: string,
  updates: Partial<EditorialTeamMember>
): Promise<{ success: boolean; error?: string }> {
  localTeamStore = localTeamStore.map((m) => (m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m));

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.specialties !== undefined) payload.specialties = updates.specialties;
    if (updates.display_order !== undefined) payload.display_order = updates.display_order;

    const { error } = await supabase.from('editorial_team').update(payload).eq('id', id);

    if (error) {
      console.error('[aboutService] updateTeamMember error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update team member';
    return { success: false, error: message };
  }
}

/**
 * Deletes an editorial team member
 */
export async function deleteTeamMember(id: string): Promise<{ success: boolean; error?: string }> {
  localTeamStore = localTeamStore.filter((m) => m.id !== id);

  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('editorial_team').delete().eq('id', id);

    if (error) {
      console.error('[aboutService] deleteTeamMember error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete team member';
    return { success: false, error: message };
  }
}
