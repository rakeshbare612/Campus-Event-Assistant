import React, { useState } from 'react';
import { CampusEvent } from '../types';
import { useEvents } from '../context/EventContext';
import { formatDisplayDate } from '../utils/dateUtils';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Heart, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';

interface EventCardProps {
  event: CampusEvent;
  onOpenDetails: (event: CampusEvent) => void;
  onQuickSummarize?: (event: CampusEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onOpenDetails,
  onQuickSummarize,
}) => {
  const {
    isRegistered,
    isWaitlisted,
    isFavorite,
    toggleFavorite,
    registerForEvent,
    cancelRegistration,
    getConflictsForEvent,
  } = useEvents();

  const [isRegistering, setIsRegistering] = useState(false);

  const registered = isRegistered(event.id);
  const waitlisted = isWaitlisted(event.id);
  const favorited = isFavorite(event.id);
  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  const isFull = seatsLeft === 0 || event.status === 'full';
  const isCancelled = event.status === 'cancelled';
  const conflicts = getConflictsForEvent(event);
  const hasConflict = !registered && conflicts.length > 0;

  const categoryThemes: Record<string, { bg: string; text: string; border: string; label: string }> = {
    technical: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Technical' },
    workshop: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Workshop' },
    competition: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Competition' },
    cultural: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', label: 'Cultural' },
    seminar: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Seminar' },
    sports: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Sports' },
  };

  const theme = categoryThemes[event.category] || categoryThemes.technical;

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (registered) {
      if (window.confirm(`Do you wish to cancel your registration for "${event.title}"?`)) {
        cancelRegistration(event.id);
      }
      return;
    }

    setIsRegistering(true);
    setTimeout(() => {
      registerForEvent(event.id);
      setIsRegistering(false);
    }, 300);
  };

  return (
    <div 
      onClick={() => onOpenDetails(event)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Top Banner Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md border ${theme.bg} ${theme.text} ${theme.border}`}>
            {theme.label}
          </span>

          <div className="flex items-center gap-1.5">
            {event.isDemo && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900/70 text-slate-200 backdrop-blur-md border border-white/20">
                Demo
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(event.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                favorited
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
              }`}
              title={favorited ? 'Remove from saved' : 'Save event'}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Date on image overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <div className="flex items-center gap-1.5 drop-shadow-md">
            <Calendar className="w-3.5 h-3.5 text-purple-300" />
            <span>{formatDisplayDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 drop-shadow-md">
            <Clock className="w-3.5 h-3.5 text-purple-300" />
            <span>{event.startTime}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Status Alert Flags */}
          {hasConflict && (
            <div className="mb-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Overlaps with <strong>{conflicts[0].title}</strong></span>
            </div>
          )}

          {isCancelled && (
            <div className="mb-2.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Event Cancelled by Organizer
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-purple-700 transition-colors line-clamp-1">
            {event.title}
          </h3>

          {/* Venue & Organizer */}
          <div className="mt-2 space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.organizer}</span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Capacity Bar & Action Footer */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span className="font-medium flex items-center gap-1">
              {isFull ? (
                <span className="text-rose-600 font-semibold">Capacity Full</span>
              ) : (
                <span>Seats Available</span>
              )}
            </span>
            <span className="font-semibold text-slate-800">
              {seatsLeft} / {event.capacity} left
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-rose-500'
                  : percentFilled > 80
                  ? 'bg-amber-500'
                  : 'bg-purple-600'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onQuickSummarize && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickSummarize(event);
                }}
                className="p-2 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                title="AI Quick Summary & Key Takeaways"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(event);
              }}
              className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <span>Details</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Registration button */}
            {registered ? (
              <button
                type="button"
                onClick={handleRegisterClick}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition-colors flex items-center gap-1 group/btn"
                title="Click to cancel registration"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 group-hover/btn:hidden" />
                <span className="group-hover/btn:hidden">Registered</span>
                <span className="hidden group-hover/btn:inline">Cancel</span>
              </button>
            ) : waitlisted ? (
              <button
                type="button"
                disabled
                className="px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-100 rounded-xl cursor-default"
              >
                Waitlisted
              </button>
            ) : isCancelled ? (
              <button
                type="button"
                disabled
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed"
              >
                Cancelled
              </button>
            ) : isFull ? (
              <button
                type="button"
                onClick={handleRegisterClick}
                disabled={isRegistering}
                className="px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
              >
                Join Waitlist
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegisterClick}
                disabled={isRegistering}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1"
              >
                <span>{isRegistering ? 'Registering...' : 'Register'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
