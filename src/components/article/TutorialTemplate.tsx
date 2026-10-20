import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Target,
  ListOrdered,
  AlertTriangle,
  Copy,
  Check,
  Cpu,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TutorialTemplateData } from '../../types';

interface TutorialTemplateProps {
  data?: TutorialTemplateData;
}

export const TutorialTemplate: React.FC<TutorialTemplateProps> = ({ data }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!data) return null;

  const hasHeaderMeta = Boolean(data.version_applicability || data.difficulty_level);
  const hasPrerequisites = Boolean(data.prerequisites && data.prerequisites.length > 0);
  const hasObjectives = Boolean(data.learning_objectives && data.learning_objectives.length > 0);
  const hasSteps = Boolean(data.steps && data.steps.length > 0);
  const hasTroubleshooting = Boolean(data.troubleshooting && data.troubleshooting.length > 0);
  const hasRelated = Boolean(data.related_lessons && data.related_lessons.length > 0);

  if (
    !hasHeaderMeta &&
    !hasPrerequisites &&
    !hasObjectives &&
    !hasSteps &&
    !hasTroubleshooting &&
    !hasRelated
  ) {
    return null;
  }

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="my-8 space-y-8" data-testid="tutorial-template">
      {/* 1. Technical Header Bar: Version Applicability & Difficulty */}
      {hasHeaderMeta && (
        <section
          aria-labelledby="tutorial-meta-heading"
          className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-800"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span id="tutorial-meta-heading">Technical Tutorial & Workflow</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Course Metadata & Architecture
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {data.difficulty_level && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-amber-300 border border-slate-700">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Level: {data.difficulty_level}</span>
                </span>
              )}
              {data.version_applicability && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-950/60 text-red-200 border border-red-800/60">
                  <Cpu className="w-3.5 h-3.5 text-red-400" />
                  <span>{data.version_applicability}</span>
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. Prerequisites & Learning Objectives Grid */}
      {(hasPrerequisites || hasObjectives) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prerequisites */}
          {hasPrerequisites && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/90 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Prerequisites</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {data.prerequisites!.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learning Objectives */}
          {hasObjectives && (
            <div className="bg-rose-50/60 p-6 rounded-2xl border border-rose-100 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Target className="w-4 h-4 text-rose-600" />
                <span>Learning Objectives</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {data.learning_objectives!.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. Numbered Step-by-Step Instructions */}
      {hasSteps && (
        <section aria-labelledby="tutorial-steps-heading" className="space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-black text-xl sm:text-2xl tracking-tight">
            <ListOrdered className="w-5 h-5 text-red-600" />
            <h3 id="tutorial-steps-heading">Step-by-Step Implementation</h3>
          </div>

          <div className="space-y-6">
            {data.steps!.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-red-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    {step.step_number || idx + 1}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900">{step.title}</h4>
                </div>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {step.instructions}
                </p>

                {/* Code Snippet Box */}
                {step.code_snippet && (
                  <div className="relative rounded-2xl bg-slate-950 p-4 text-slate-200 font-mono text-xs sm:text-sm overflow-x-auto shadow-inner border border-slate-800">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                      <span>Code / Query</span>
                      <button
                        onClick={() => handleCopyCode(step.code_snippet!, idx)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[10px] font-sans"
                        aria-label="Copy code snippet to clipboard"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="overflow-x-auto leading-relaxed">
                      <code>{step.code_snippet}</code>
                    </pre>
                  </div>
                )}

                {/* Pro Tip Callout */}
                {step.tip && (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                    <span className="text-base leading-none">💡</span>
                    <p className="leading-relaxed">
                      <strong className="font-semibold text-amber-950">Tip:</strong> {step.tip}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Troubleshooting & Common Pitfalls */}
      {hasTroubleshooting && (
        <section
          aria-labelledby="tutorial-troubleshooting-heading"
          className="p-6 bg-rose-50/40 rounded-3xl border border-rose-100/90 space-y-4"
        >
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 id="tutorial-troubleshooting-heading">Troubleshooting & Gotchas</h3>
          </div>

          <div className="space-y-3">
            {data.troubleshooting!.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1.5">
                <div className="flex items-start gap-2 text-xs font-bold text-rose-700">
                  <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{item.issue}</span>
                </div>
                <p className="text-xs text-slate-600 pl-5 leading-relaxed">
                  <strong className="text-slate-800 font-semibold">Solution:</strong> {item.resolution}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Related Lessons */}
      {hasRelated && (
        <section aria-labelledby="tutorial-lessons-heading" className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 id="tutorial-lessons-heading" className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-red-600" />
            <span>Related Lessons & Further Study</span>
          </h3>
          <ul className="space-y-2">
            {data.related_lessons!.map((lesson, idx) => (
              <li key={idx}>
                {lesson.url_or_slug.startsWith('http') ? (
                  <a
                    href={lesson.url_or_slug}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-red-600 hover:text-red-700 font-semibold underline underline-offset-2"
                  >
                    <span>{lesson.title}</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                ) : (
                  <Link
                    to={`/article/${lesson.url_or_slug}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-red-600 hover:text-red-700 font-semibold hover:underline"
                  >
                    <span>{lesson.title}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
