import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ShieldCheck,
  Compass,
  Sparkles,
  Globe,
  Tag,
  CheckCircle,
  Award,
  Edit3,
} from 'lucide-react';
import { SeoHead, SITE_URL } from '../components/common/SeoHead';
import { fetchAboutPageData, DEFAULT_ABOUT_CONTENT, DEFAULT_EDITORIAL_TEAM } from '../services/aboutService';
import { AboutPageContent, EditorialTeamMember, AboutPillar, AboutStandard } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const AboutPage: React.FC = () => {
  const { role } = useAuth();
  const isEditorOrAdmin = role === 'editor' || role === 'admin';

  const [content, setContent] = useState<AboutPageContent>(DEFAULT_ABOUT_CONTENT);
  const [team, setTeam] = useState<EditorialTeamMember[]>(DEFAULT_EDITORIAL_TEAM);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchAboutPageData();
        setContent(data.content);
        setTeam(data.team);
      } catch (err) {
        console.error('[AboutPage] Error fetching dynamic about data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const renderPillarIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'globe':
        return <Globe className="w-6 h-6" />;
      case 'compass':
        return <Compass className="w-6 h-6" />;
      case 'tag':
        return <Tag className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  const getPillarStyles = (color: string) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-50', text: 'text-blue-600' };
      case 'rose':
        return { bg: 'bg-rose-50', text: 'text-rose-600' };
      case 'amber':
        return { bg: 'bg-amber-50', text: 'text-amber-600' };
      default:
        return { bg: 'bg-purple-50', text: 'text-purple-600' };
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 space-y-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-1/3 mx-auto" />
        <div className="h-14 bg-slate-200 rounded-2xl w-3/4 mx-auto" />
        <div className="h-24 bg-slate-100 rounded-2xl max-w-2xl mx-auto" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 sm:py-16 space-y-16">
      <SeoHead
        title="About Us — Who We Are & What We Do | EveryGyan"
        description={content.hero_description}
        canonicalUrl="/about"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About EveryGyan',
          url: `${SITE_URL}/about`,
          description: content.hero_description,
        }}
      />

      {/* Editor Quick Link (Visible only to authorized editors) */}
      {isEditorOrAdmin && (
        <div className="flex justify-end -mb-8">
          <Link
            to="/dashboard/about"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit About Content & Team in Dashboard
          </Link>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-red-600 block">
          {content.hero_tagline}
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          {content.hero_highlight && content.hero_title.includes(content.hero_highlight) ? (
            <>
              {content.hero_title.replace(content.hero_highlight, '')}
              <span className="text-red-600">{content.hero_highlight}</span>
            </>
          ) : (
            content.hero_title
          )}
        </h1>
        <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal">
          {content.hero_description}
        </p>
      </div>

      {/* Who We Are: The EveryGyan Story */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 text-red-600 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>{content.story_badge}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{content.story_title}</h2>
        <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
          {content.story_paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </div>

      {/* What We Do: Core Pillars */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 block">
            Our Core Departments
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">What We Do</h2>
          <p className="text-slate-600 text-sm">
            Four specialized editorial pillars working under a single standard of integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.pillars.map((pillar: AboutPillar, idx: number) => {
            const styles = getPillarStyles(pillar.color);
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4"
              >
                <div
                  className={`w-12 h-12 ${styles.bg} ${styles.text} rounded-2xl flex items-center justify-center`}
                >
                  {renderPillarIcon(pillar.icon)}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{pillar.description}</p>
                {pillar.bullets && pillar.bullets.length > 0 && (
                  <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                    {pillar.bullets.map((bullet: string, bIdx: number) => (
                      <li key={bIdx} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Editorial Standards & Fact-Checking Process */}
      <div className="bg-slate-900 text-white p-8 sm:p-14 rounded-3xl shadow-xl space-y-8">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <span>{content.standards_badge}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black">{content.standards_title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-slate-300">
          {content.standards_items.map((item: AboutStandard, idx: number) => (
            <div key={idx} className="space-y-2">
              <h4 className="font-bold text-white text-base">{item.title}</h4>
              <p className="leading-relaxed text-xs sm:text-sm text-slate-400">{item.description}</p>
            </div>
          ))}
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
          {team.map((member: EditorialTeamMember) => (
            <div
              key={member.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-slate-100"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback avatar if URL is broken
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                    <p className="text-xs font-semibold text-red-600">{member.role}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{member.bio}</p>
              </div>

              {member.specialties && member.specialties.length > 0 && (
                <div className="pt-4 border-t border-slate-100 mt-4 flex flex-wrap gap-1.5">
                  {member.specialties.map((spec: string) => (
                    <span
                      key={spec}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ethics & Reader Commitment */}
      <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center max-w-2xl mx-auto space-y-4">
        <Award className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900">{content.commitment_title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {content.commitment_text}{' '}
          {content.commitment_email && (
            <a
              href={`mailto:${content.commitment_email}`}
              className="text-red-600 font-semibold hover:underline"
            >
              {content.commitment_email}
            </a>
          )}
          .
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
