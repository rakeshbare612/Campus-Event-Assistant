import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { formatDisplayDate, getDaysUntil } from '../../utils/dateUtils';
import { CampusEvent } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  CalendarRange,
  Zap,
  Info
} from 'lucide-react';

interface SchedulePlannerViewProps {
  onOpenEventDetails: (event: CampusEvent) => void;
  onNavigateTab: (tab: string) => void;
}

export const SchedulePlannerView: React.FC<SchedulePlannerViewProps> = ({
  onOpenEventDetails,
  onNavigateTab,
}) => {
  const {
    events,
    registrations,
    registeredEventsWithConflicts,
    cancelRegistration,
  } = useEvents();

  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAiAdvice, setLoadingAiAdvice] = useState(false);

  // Get active registered events sorted chronologically
  const activeRegistrations = registrations.filter((r) => r.status === 'confirmed');
  const registeredEventObjects = activeRegistrations
    .map((r) => events.find((e) => e.id === r.eventId))
    .filter((e): e is CampusEvent => !!e)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group events by date for Day View
  const eventsByDate = registeredEventObjects.reduce((acc, evt) => {
    if (!acc[evt.date]) acc[evt.date] = [];
    acc[evt.date].push(evt);
    return acc;
  }, {} as Record<string, CampusEvent[]>);

  // Call AI Schedule Assistant endpoint
  const handleGetAiAdvice = async () => {
    setLoadingAiAdvice(true);
    try {
      const res = await fetch('/api/ai/schedule-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registeredEvents: registeredEventObjects,
          conflicts: registeredEventsWithConflicts,
        }),
      });
      const data = await res.json();
      setAiAdvice(data.advice || 'Schedule advice generated successfully.');
    } catch (err) {
      setAiAdvice(
        '⚠️ **Conflict Management Tip:** Prioritize required department labs first. Cancel non-mandatory sessions to allow fellow waitlisted students to participate.'
      );
    } finally {
      setLoadingAiAdvice(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart Schedule Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chronological calendar, automated programmatic conflict detection, and AI schedule optimization.
          </p>
        </div>

        {/* View Switcher: Day vs Week */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'day'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Day View</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'week'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Week View</span>
            </button>
          </div>

          <button
            onClick={handleGetAiAdvice}
            disabled={loadingAiAdvice}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loadingAiAdvice ? 'Analyzing...' : 'AI Schedule Helper'}</span>
          </button>
        </div>
      </div>

      {/* Conflicts Alert Card */}
      {registeredEventsWithConflicts.length > 0 ? (
        <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm sm:text-base leading-snug">
                Warning: Scheduling Overlap Detected ({registeredEventsWithConflicts.length})
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 mt-1">
                You have simultaneous registrations on the same day. Our deterministic time-comparison engine identified the following conflict(s):
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {registeredEventsWithConflicts.map((c, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-800">
                    "{c.event1.title}" ({c.event1.startTime} - {c.event1.endTime})
                  </span>
                  <span className="text-amber-700 font-bold mx-1.5">⚡ overlaps with</span>
                  <span className="font-semibold text-slate-800">
                    "{c.event2.title}" ({c.event2.startTime} - {c.event2.endTime})
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    📅 Date: {formatDisplayDate(c.date)} • {c.recommendedResolution}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (window.confirm(`Cancel registration for "${c.event2.title}" to resolve this conflict?`)) {
                        cancelRegistration(c.event2.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 transition-colors"
                  >
                    Release Seat in "{c.event2.title.slice(0, 15)}..."
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeRegistrations.length > 0 ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Schedule Conflict Free:</span> All {activeRegistrations.length} registered events have distinct non-overlapping time slots.
          </div>
        </div>
      ) : null}

      {/* AI Advice Output Card if requested */}
      {aiAdvice && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 via-indigo-50 to-white border border-purple-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-purple-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Gemini AI Schedule Optimization Advice
            </h4>
            <button
              onClick={() => setAiAdvice(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Dismiss
            </button>
          </div>
          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white/80 p-4 rounded-2xl border border-purple-100">
            {aiAdvice}
          </div>
        </div>
      )}

      {/* Timeline Render */}
      {registeredEventObjects.length > 0 ? (
        viewMode === 'day' ? (
          /* Day-by-Day Grouped View */
          <div className="space-y-6">
            {Object.entries(eventsByDate).map(([dateStr, dayEvents]) => {
              const daysLeft = getDaysUntil(dateStr);
              return (
                <div key={dateStr} className="space-y-3">
                  {/* Date Heading Header */}
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs">
                      {formatDisplayDate(dateStr)}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {daysLeft === 0
                        ? 'Happening Today'
                        : daysLeft > 0
                        ? `in ${daysLeft} days`
                        : `${Math.abs(daysLeft)} days ago`}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Day Events Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-700">
                              {evt.category}
                            </span>
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-purple-600" />
                              {evt.startTime} - {evt.endTime}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {evt.title}
                          </h4>

                          <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{evt.venue}</span>
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Confirmed Ticket
                          </span>
                          <button
                            onClick={() => onOpenEventDetails(evt)}
                            className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Week View Table / Timeline */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs overflow-x-auto">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Weekly Schedule Timeline Matrix
            </h3>
            <div className="min-w-[600px] divide-y divide-slate-100">
              {registeredEventObjects.map((evt, idx) => (
                <div key={evt.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="w-40 shrink-0">
                    <span className="text-xs font-bold text-slate-900 block">
                      {formatDisplayDate(evt.date)}
                    </span>
                    <span className="text-[11px] text-purple-700 font-mono">
                      {evt.startTime} - {evt.endTime}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>📍 {evt.venue}</span>
                      <span>•</span>
                      <span>🏷️ {evt.category}</span>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => onOpenEventDetails(evt)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Your Planner is Clear</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            You don't have any registered events scheduled yet. Once you register for workshops or hackathons, they will automatically appear here with automated conflict checking.
          </p>
          <button
            onClick={() => onNavigateTab('events')}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 mx-auto"
          >
            <span>Explore Campus Events</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
