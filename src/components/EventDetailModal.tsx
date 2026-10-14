import React, { useState } from 'react';
import { CampusEvent } from '../types';
import { useEvents } from '../context/EventContext';
import { formatDisplayDate } from '../utils/dateUtils';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  BookOpen, 
  Tag, 
  Heart,
  FileCheck
} from 'lucide-react';

interface EventDetailModalProps {
  event: CampusEvent | null;
  onClose: () => void;
  onNavigateToSchedule?: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onNavigateToSchedule,
}) => {
  const {
    isRegistered,
    isWaitlisted,
    isFavorite,
    toggleFavorite,
    registerForEvent,
    cancelRegistration,
    getConflictsForEvent,
    getRegistrationForEvent,
  } = useEvents();

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  if (!event) return null;

  const registered = isRegistered(event.id);
  const waitlisted = isWaitlisted(event.id);
  const favorited = isFavorite(event.id);
  const currentReg = getRegistrationForEvent(event.id);
  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const isFull = seatsLeft === 0 || event.status === 'full';
  const isCancelled = event.status === 'cancelled';
  const conflicts = getConflictsForEvent(event);
  const hasConflict = !registered && conflicts.length > 0;

  const handleRegister = () => {
    setIsRegistering(true);
    setTimeout(() => {
      registerForEvent(event.id);
      setIsRegistering(false);
    }, 300);
  };

  const handleCancel = () => {
    if (window.confirm(`Are you sure you want to cancel your confirmed registration for "${event.title}"?`)) {
      cancelRegistration(event.id);
    }
  };

  const fetchAiSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      });
      const data = await res.json();
      setAiSummary(data.summary || 'Summary unavailable at this time.');
    } catch (err) {
      setAiSummary(
        `• **Core Focus:** ${event.description}\n• **Recommended For:** ${event.targetAudience.join(', ')}\n• **Key Prerequisite:** ${event.prerequisites.join('; ')}`
      );
    } finally {
      setIsLoadingSummary(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/80 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Image */}
        <div className="relative h-64 w-full bg-slate-900 shrink-0">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close & Favorite buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(event.id)}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                favorited
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'bg-white/80 text-slate-800 hover:bg-white'
              }`}
              title={favorited ? 'Saved in bookmarks' : 'Save event'}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category & Demo Tag */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-600/90 text-white backdrop-blur-md">
              {event.category}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-purple-200 backdrop-blur-md border border-purple-400/30">
              CIE-3 Demo Record
            </span>
          </div>

          {/* Title on Hero */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight drop-shadow">
              {event.title}
            </h2>
            <p className="text-sm text-purple-200 mt-1 flex items-center gap-2">
              <span>Organized by {event.organizer}</span>
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1">
          {/* Conflict Warning Banner */}
          {hasConflict && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <h4 className="font-bold">Schedule Overlap Alert</h4>
                <p className="mt-0.5 text-amber-800">
                  This event takes place on <strong>{event.date}</strong> at{' '}
                  <strong>{event.startTime} - {event.endTime}</strong>, which overlaps with your confirmed registration for{' '}
                  <strong>{conflicts[0].title}</strong> ({conflicts[0].startTime} - {conflicts[0].endTime}).
                </p>
                {onNavigateToSchedule && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToSchedule();
                    }}
                    className="mt-2 text-xs font-semibold text-amber-900 underline hover:text-amber-950"
                  >
                    View in Schedule Planner →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Registered Confirmation Banner */}
          {registered && currentReg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">You are Registered for this Event!</h4>
                  <p className="text-xs text-emerald-700">
                    Admission Ticket: <code className="font-mono font-bold">{currentReg.ticketNumber}</code> • Status: Confirmed
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
              >
                Cancel Registration
              </button>
            </div>
          )}

          {/* Key Event Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" /> Date
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                {formatDisplayDate(event.date)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" /> Timing
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                {event.startTime} - {event.endTime}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600" /> Venue
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1 truncate" title={event.venue}>
                {event.venue}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" /> Seat Capacity
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                {seatsLeft} left / {event.capacity} total
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Event Overview
            </h3>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* AI Summarizer Feature */}
          <div className="p-4.5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-indigo-50/50 to-white border border-purple-200/80">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="font-bold text-sm text-purple-950">
                  AI Event Summarizer & Attendee Guide
                </h4>
              </div>
              <button
                type="button"
                onClick={fetchAiSummary}
                disabled={isLoadingSummary}
                className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-white hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isLoadingSummary ? 'Analyzing...' : aiSummary ? 'Regenerate' : 'Generate Summary'}
              </button>
            </div>

            {aiSummary ? (
              <div className="mt-3 text-xs sm:text-sm text-slate-700 space-y-1 bg-white/80 p-3.5 rounded-xl border border-purple-100 leading-relaxed whitespace-pre-line">
                {aiSummary}
              </div>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500">
                Click generate to receive a 3-point AI brief on key takeaways, who should attend, and preparation required.
              </p>
            )}
          </div>

          {/* Detailed Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            {/* Left: Prerequisites & Audience */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                  <BookOpen className="w-4 h-4 text-purple-600" /> Prerequisites
                </h5>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  {event.prerequisites.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                  <Users className="w-4 h-4 text-purple-600" /> Target Audience
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {event.targetAudience.map((aud, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs">
                      {aud}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Speakers & Administration */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              {event.speakers && event.speakers.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                    <Award className="w-4 h-4 text-purple-600" /> Speakers & Mentors
                  </h5>
                  <ul className="space-y-1 text-slate-600">
                    {event.speakers.map((s, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-slate-600 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Registration Deadline:</span>
                  <span className="font-semibold text-slate-800">{event.registrationDeadline}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Certificate Provided:</span>
                  <span className="font-semibold text-emerald-700">{event.certificateProvided ? 'Yes (Verified)' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Entry Fee:</span>
                  <span className="font-semibold text-slate-800">{event.fee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Contact:</span>
                  <span className="font-mono text-purple-700">{event.contactEmail}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200/80 rounded-b-3xl flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {event.isDemo && <span>* College CIE-3 project demonstration event.</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>

            {registered ? (
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md"
              >
                Cancel Registration
              </button>
            ) : waitlisted ? (
              <div className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-amber-800 bg-amber-100 rounded-xl border border-amber-200">
                You are on the Waitlist
              </div>
            ) : isCancelled ? (
              <div className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 bg-slate-200 rounded-xl">
                Event Cancelled
              </div>
            ) : isFull ? (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md"
              >
                {isRegistering ? 'Processing...' : 'Join Waitlist'}
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 rounded-xl transition-all shadow-lg shadow-purple-600/20"
              >
                {isRegistering ? 'Registering...' : 'Register for Event'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
