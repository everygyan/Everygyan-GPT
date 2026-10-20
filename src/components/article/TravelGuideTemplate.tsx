import React from 'react';
import {
  MapPin,
  Calendar,
  Compass,
  DollarSign,
  Users,
  ShieldAlert,
  ExternalLink,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { TravelTemplateData } from '../../types';

interface TravelGuideTemplateProps {
  data?: TravelTemplateData;
}

export const TravelGuideTemplate: React.FC<TravelGuideTemplateProps> = ({ data }) => {
  if (!data) return null;

  const hasAtAGlance = Boolean(
    data.destination ||
    data.best_time_to_visit?.season ||
    data.transport?.arrival ||
    data.transport?.local_transit ||
    data.budget_ranges?.daily_budget ||
    data.family_accessibility?.accessibility_notes ||
    data.family_accessibility?.family_friendly !== undefined
  );

  const hasItinerary = Boolean(data.itinerary && data.itinerary.length > 0);
  const hasMapsLinks = Boolean(data.maps_links && data.maps_links.length > 0);
  const hasSafetyCaveats = Boolean(data.safety_caveats && data.safety_caveats.trim().length > 0);

  // If entire template data is empty, disappear completely
  if (!hasAtAGlance && !hasItinerary && !hasMapsLinks && !hasSafetyCaveats) {
    return null;
  }

  return (
    <div className="my-8 space-y-8" data-testid="travel-guide-template">
      {/* 1. Destination & At-A-Glance Overview */}
      {hasAtAGlance && (
        <section
          aria-labelledby="travel-glance-heading"
          className="bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 rounded-3xl p-6 sm:p-8 border border-rose-100/90 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-rose-100/80">
            <div>
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4" />
                <span>Travel Guide & Destination Briefing</span>
              </div>
              <h2
                id="travel-glance-heading"
                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
              >
                {data.destination ? data.destination : 'Destination Highlights'}
              </h2>
            </div>
            {data.destination && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>{data.destination}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Best Time to Visit */}
            {(data.best_time_to_visit?.season || data.best_time_to_visit?.note) && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Calendar className="w-4 h-4 text-rose-600" />
                  <span>Best Time to Visit</span>
                  {data.best_time_to_visit.verified_date && (
                    <span className="text-[10px] text-slate-400 font-normal ml-auto">
                      Verified: {data.best_time_to_visit.verified_date}
                    </span>
                  )}
                </div>
                {data.best_time_to_visit.season && (
                  <p className="text-sm font-semibold text-slate-800">
                    {data.best_time_to_visit.season}
                  </p>
                )}
                {data.best_time_to_visit.note && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {data.best_time_to_visit.note}
                  </p>
                )}
              </div>
            )}

            {/* Transport & Getting Around */}
            {(data.transport?.arrival || data.transport?.local_transit || data.transport?.tip) && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>Transport & Logistics</span>
                </div>
                {data.transport.arrival && (
                  <p className="text-xs text-slate-700">
                    <strong className="text-slate-900">Arrival:</strong> {data.transport.arrival}
                  </p>
                )}
                {data.transport.local_transit && (
                  <p className="text-xs text-slate-700">
                    <strong className="text-slate-900">Local Transit:</strong> {data.transport.local_transit}
                  </p>
                )}
                {data.transport.tip && (
                  <p className="text-xs text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 mt-1">
                    💡 <strong>Tip:</strong> {data.transport.tip}
                  </p>
                )}
              </div>
            )}

            {/* Budget Ranges */}
            {data.budget_ranges?.daily_budget && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Estimated Budget Range</span>
                  {data.budget_ranges.verified_date && (
                    <span className="text-[10px] text-slate-400 font-normal ml-auto">
                      Checked: {data.budget_ranges.verified_date}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-slate-900">
                    {data.budget_ranges.daily_budget}
                  </span>
                  {data.budget_ranges.currency && (
                    <span className="text-xs font-medium text-slate-500">
                      ({data.budget_ranges.currency})
                    </span>
                  )}
                </div>
                {data.budget_ranges.notes && (
                  <p className="text-xs text-slate-500 italic">
                    {data.budget_ranges.notes}
                  </p>
                )}
              </div>
            )}

            {/* Family & Accessibility Notes */}
            {(data.family_accessibility?.family_friendly !== undefined ||
              data.family_accessibility?.accessibility_notes) && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Family & Accessibility</span>
                </div>
                {data.family_accessibility.family_friendly !== undefined && (
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{data.family_accessibility.family_friendly ? 'Family & Child Friendly' : 'Adult / Adventure Oriented'}</span>
                  </p>
                )}
                {data.family_accessibility.accessibility_notes && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {data.family_accessibility.accessibility_notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Suggested Itinerary Timeline */}
      {hasItinerary && (
        <section aria-labelledby="travel-itinerary-heading" className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-black text-xl sm:text-2xl tracking-tight">
            <Clock className="w-5 h-5 text-rose-600" />
            <h3 id="travel-itinerary-heading">Suggested Day-by-Day Itinerary</h3>
          </div>
          <div className="relative pl-6 border-l-2 border-rose-200 space-y-6 my-4">
            {data.itinerary!.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline node dot */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-rose-500" />
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-rose-200 transition-colors">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 mb-1.5">
                    {item.day}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
                  {item.activities && item.activities.length > 0 && (
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                      {item.activities.map((act, actIdx) => (
                        <li key={actIdx} className="flex items-start gap-2">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Official Maps & Verified Resources */}
      {hasMapsLinks && (
        <section aria-labelledby="travel-resources-heading" className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 id="travel-resources-heading" className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>Official Maps & Regional Portals</span>
          </h3>
          <ul className="space-y-2">
            {data.maps_links!.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-rose-600 hover:text-rose-700 font-semibold underline underline-offset-2"
                >
                  <span>{link.title}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. Safety & Travel Document Caveats */}
      {hasSafetyCaveats && (
        <div
          role="note"
          aria-label="Travel safety and documentation caveat"
          className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-start gap-3.5 shadow-sm"
        >
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-amber-950 block">Safety & Travel Document Notice</strong>
            <p className="text-amber-900/90 leading-relaxed font-normal">
              {data.safety_caveats}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
