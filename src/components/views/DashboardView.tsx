import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { CampusEvent } from '../../types';
import { EventCard } from '../EventCard';
import { formatDisplayDate } from '../../utils/dateUtils';
import {
  Calendar,
  Sparkles,
  Ticket,
  Clock,
  Users,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Send,
  Zap,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

interface DashboardViewProps {
  onOpenEventDetails: (event: CampusEvent) => void;
  onNavigateTab: (tab: string) => void;
  onStartAiChatWithPrompt: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenEventDetails,
  onNavigateTab,
  onStartAiChatWithPrompt,
}) => {
  const {
    events,
    registrations,
    studentProfile,
    registeredEventsWithConflicts,
  } = useEvents();

  const [quickQuery, setQuickQuery] = useState('');

  // Metrics
  const totalEvents = events.filter((e) => e.status !== 'cancelled').length;
  const registeredCount = registrations.filter((r) => r.status === 'confirmed').length;
  const totalSeatsLeft = events.reduce(
    (acc, e) => acc + Math.max(0, e.capacity - e.registeredCount),
    0
  );

  // Today's or imminent events (Oct 13 to late Oct 2026)
  const sortedUpcoming = [...events]
    .filter((e) => e.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date));

  const spotlightEvent = sortedUpcoming[0]; // Next immediate event
  const recommendedEvents = sortedUpcoming.slice(0, 3);
  const recentlyAdded = sortedUpcoming.slice(-3).reverse();

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    onStartAiChatWithPrompt(quickQuery.trim());
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & AI Assistant Quick Ask Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-900 text-white p-6 sm:p-8 shadow-xl border border-purple-500/20">
        {/* Subtle Background Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Computer Engineering CIE-3 AI Agent Challenge</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Welcome back, <span className="text-purple-300">{studentProfile.name}</span>!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Your intelligent guide to campus workshops, hackathons, and symposiums. Ask questions in natural language, plan your schedule, and never miss a registration deadline.
          </p>

          {/* Quick AI Search Form */}
          <form onSubmit={handleQuickSubmit} className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ask AI: 'What technical events are happening this week?' or 'Suggest AI workshops'..."
                className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 focus:placeholder:text-slate-400 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all backdrop-blur-md"
              />
              <Sparkles className="w-4 h-4 text-purple-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>Ask AI Agent</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Prompt Chips */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-purple-200">
            <span className="text-slate-400 font-medium">Quick Prompts:</span>
            <button
              onClick={() => onStartAiChatWithPrompt('What technical events are coming up?')}
              className="hover:text-white underline decoration-purple-400 underline-offset-2 transition-colors"
            >
              "Technical events coming up"
            </button>
            <span>•</span>
            <button
              onClick={() => onStartAiChatWithPrompt('Suggest an event for a Computer Engineering student interested in AI')}
              className="hover:text-white underline decoration-purple-400 underline-offset-2 transition-colors"
            >
              "AI events for Comp Engg"
            </button>
            <span>•</span>
            <button
              onClick={() => onStartAiChatWithPrompt('Create a schedule for my registered events')}
              className="hover:text-white underline decoration-purple-400 underline-offset-2 transition-colors"
            >
              "Create my schedule"
            </button>
          </div>
        </div>
      </div>

      {/* Conflicts Alert Banner if any exist */}
      {registeredEventsWithConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-bold">Schedule Overlap Alert Detected</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                You have <strong>{registeredEventsWithConflicts.length}</strong> time conflict(s) in your registered events schedule (e.g. {registeredEventsWithConflicts[0].event1.title} and {registeredEventsWithConflicts[0].event2.title}).
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('schedule')}
            className="px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-xl transition-colors shrink-0"
          >
            Resolve in Planner
          </button>
        </div>
      )}

      {/* Key Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Upcoming Events
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {totalEvents}
            </h3>
            <p className="text-[11px] text-purple-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Across 6 Categories
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigateTab('registrations')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Registrations
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {registeredCount}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Confirmed Tickets
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Open Seats Available
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {totalSeatsLeft}
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
              <Users className="w-3 h-3" /> Live Capacity Sync
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigateTab('recommendations')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              AI Match Index
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-700 mt-1">
              95%
            </h3>
            <p className="text-[11px] text-purple-600 font-medium mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Comp Engg Tailored
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Spotlight Event Next Up */}
      {spotlightEvent && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-white border border-purple-200/80 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white">
                  Next Up on Campus
                </span>
                <span className="text-xs font-medium text-purple-700">
                  {formatDisplayDate(spotlightEvent.date)}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {spotlightEvent.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl line-clamp-2">
                {spotlightEvent.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-purple-600" /> {spotlightEvent.startTime} - {spotlightEvent.endTime}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-purple-600" /> {spotlightEvent.venue}
                </span>
                <span className="font-semibold text-purple-700">
                  {spotlightEvent.capacity - spotlightEvent.registeredCount} seats remaining
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onOpenEventDetails(spotlightEvent)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
              >
                <span>View & Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Recommended for You
            </h2>
            <p className="text-xs text-slate-500">
              Personalized for {studentProfile.department} ({studentProfile.skillLevel} Level)
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('recommendations')}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            <span>Customize Preferences</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onOpenDetails={onOpenEventDetails}
            />
          ))}
        </div>
      </div>

      {/* Recently Added Events & CIE-3 Evaluation Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recently Added Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Recently Added Events
            </h2>
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs font-semibold text-slate-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>View All ({events.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentlyAdded.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onOpenEventDetails(evt)}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{formatDisplayDate(evt.date)}</span>
                      <span>•</span>
                      <span>{evt.venue}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700">
                    {evt.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: CIE-3 Challenge Quick Test Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-purple-950 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-purple-200 text-xs font-semibold mb-3 border border-white/10">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>CIE-3 Evaluation Hub</span>
            </div>
            <h3 className="text-lg font-bold">20 Marks Evaluation Center</h3>
            <p className="text-xs text-purple-200 mt-2 leading-relaxed">
              Verify system architecture, agent system instructions, 5 sample conversations, and execute 10 automated test scenarios with live PASS/FAIL assertions.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => onNavigateTab('evaluation')}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-purple-950 font-bold text-xs hover:bg-purple-50 transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Open CIE-3 Test Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('chat')}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-800/60 hover:bg-purple-800 text-purple-100 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Test AI Agent Live</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
