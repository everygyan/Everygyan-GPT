import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Trophy,
  Compass,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { germanLessons } from '../../data/germanLessons';

export const LearningHub: React.FC = () => {
  const tracks = [
    {
      level: 'a1' as const,
      code: 'A1',
      title: 'A1 Beginner Foundations',
      subtitle: 'Survival Phrases & Der/Die/Das Rules',
      description: 'Master everyday greetings, fundamental articles, office introductions, and conversational basics.',
      data: germanLessons.a1,
      badgeText: 'Foundational',
      color: 'from-amber-500 to-orange-600',
      borderActive: 'border-amber-400 hover:border-amber-500',
      bgLight: 'bg-amber-50/70',
      accentColor: 'text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      progressPercent: 100,
      statusLabel: 'Mastered & Unlocked',
      icon: Sparkles,
    },
    {
      level: 'a2' as const,
      code: 'A2',
      title: 'A2 Workplace Elementary',
      subtitle: 'Office Correspondence & Schedules',
      description: 'Coordinate appointments, write professional emails, request feedback, and master office protocols.',
      data: germanLessons.a2,
      badgeText: 'Active Track',
      color: 'from-blue-600 to-indigo-600',
      borderActive: 'border-blue-400 hover:border-blue-500',
      bgLight: 'bg-blue-50/70',
      accentColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      progressPercent: 60,
      statusLabel: 'In Progress (3/5 Complete)',
      icon: Layers,
    },
    {
      level: 'b1' as const,
      code: 'B1',
      title: 'B1 Professional Fluency',
      subtitle: 'Executive Meetings & Negotiations',
      description: 'Lead retrospectives, articulate project milestones, negotiate deadlines, and handle complex corporate topics.',
      data: germanLessons.b1,
      badgeText: 'Intermediate Track',
      color: 'from-emerald-600 to-teal-700',
      borderActive: 'border-emerald-400 hover:border-emerald-500',
      bgLight: 'bg-emerald-50/70',
      accentColor: 'text-emerald-600',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
      progressPercent: 33,
      statusLabel: 'Active Challenge (2/6 Complete)',
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Interactive Path Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
            <Compass className="w-4 h-4" />
            Interactive Language Curriculum
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            CEFR Progression Learning Hub
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Choose a milestone node to launch interactive flashcards, vocabulary drills, matching challenges, and fill-in-the-blank tests.
          </p>
        </div>

        {/* Global Progress Metrics Pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl self-start md:self-auto">
          <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-slate-900">Curriculum Milestones</div>
            <div className="text-slate-500">9 of 15 Drills Completed (60%)</div>
          </div>
        </div>
      </div>

      {/* Duolingo-style Visual Progression Map */}
      <div className="relative">
        {/* Connecting Track Line for Desktop */}
        <div
          className="hidden lg:block absolute top-1/2 left-12 right-12 h-1 bg-gradient-to-r from-amber-400 via-blue-400 to-emerald-400 -translate-y-1/2 z-0 opacity-40 rounded-full"
          aria-hidden="true"
        />

        {/* Track Nodes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {tracks.map((trk) => {
            const Icon = trk.icon;
            return (
              <div
                key={trk.level}
                className={`flex flex-col justify-between rounded-3xl border bg-white p-6 sm:p-7 shadow-sm transition-all duration-200 hover:shadow-md ${trk.borderActive}`}
              >
                <div>
                  {/* Top Node Badge & Milestone Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${trk.bgLight} ${trk.accentColor}`}
                    >
                      {trk.badgeText}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{trk.statusLabel}</span>
                    </div>
                  </div>

                  {/* Circular Node Identifier */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${trk.color} text-white flex items-center justify-center font-black text-xl shadow-md shrink-0`}
                    >
                      {trk.code}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {trk.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{trk.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-5">
                    {trk.description}
                  </p>

                  {/* Lesson Completion Counter & Progress Bar */}
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Milestones: {trk.data.milestonesCompleted} / {trk.data.milestonesTotal}</span>
                      <span>{trk.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${trk.color} transition-all duration-500`}
                        style={{ width: `${trk.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Module Feature Counters */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-slate-50 border border-slate-100 text-center mb-6">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {trk.data.vocab.length}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">Vocabulary</div>
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {trk.data.matching.pairs.length}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">Matches</div>
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {trk.data.fillBlank.length}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">Blanks</div>
                    </div>
                  </div>
                </div>

                {/* Clickable Milestone Action Button */}
                <Link
                  to={`/category/learn-german/${trk.level}`}
                  className={`w-full py-3 px-4 rounded-2xl text-white font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-sm transition-all ${trk.buttonBg}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>Start {trk.code} Learning Module</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Curriculum Highlights Footer Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Practical Expats & Professional Fast-Track</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Focus on real-world German spoken in offices, daily administrative offices (Bürgeramt), and team meetings.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[11px] font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
            No registration needed
          </span>
          <span className="text-[11px] font-semibold bg-red-600/40 text-red-200 px-3 py-1.5 rounded-xl border border-red-400/30">
            Free Curriculum
          </span>
        </div>
      </div>
    </div>
  );
};
