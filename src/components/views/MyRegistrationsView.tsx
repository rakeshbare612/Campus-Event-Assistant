import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { formatDisplayDate } from '../../utils/dateUtils';
import { CampusEvent, Registration } from '../../types';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  AlertTriangle, 
  Download, 
  Trash2, 
  CheckCircle2, 
  ArrowRight,
  Printer,
  Sparkles
} from 'lucide-react';

interface MyRegistrationsViewProps {
  onOpenEventDetails: (event: CampusEvent) => void;
  onNavigateTab: (tab: string) => void;
}

export const MyRegistrationsView: React.FC<MyRegistrationsViewProps> = ({
  onOpenEventDetails,
  onNavigateTab,
}) => {
  const {
    events,
    registrations,
    studentProfile,
    cancelRegistration,
    registeredEventsWithConflicts,
  } = useEvents();

  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState<Registration | null>(null);

  const activeRegistrations = registrations.filter((r) => r.status === 'confirmed');

  // Find if a registration has conflicts
  const getConflictWarningForReg = (reg: Registration) => {
    return registeredEventsWithConflicts.find(
      (c) => c.event1.id === reg.eventId || c.event2.id === reg.eventId
    );
  };

  const handleCancel = (reg: Registration) => {
    if (
      window.confirm(
        `Are you sure you want to cancel your registration for "${reg.eventTitle}"? Your seat will be made available for other students.`
      )
    ) {
      cancelRegistration(reg.eventId);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Registrations & Event Passes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Confirmed admission passes for {studentProfile.name} ({studentProfile.studentId})
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('schedule')}
          className="px-4 py-2 text-xs sm:text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto border border-purple-200"
        >
          <Calendar className="w-4 h-4" />
          <span>Open Schedule Planner</span>
        </button>
      </div>

      {/* Overview Stat Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Confirmed Passes</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeRegistrations.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Department</span>
            <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">{studentProfile.department}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Schedule Status</span>
            <h3 className={`text-sm font-bold mt-1 ${registeredEventsWithConflicts.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {registeredEventsWithConflicts.length > 0 ? `${registeredEventsWithConflicts.length} Conflict Alert` : 'All Clear (No Conflicts)'}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${registeredEventsWithConflicts.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {registeredEventsWithConflicts.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {activeRegistrations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeRegistrations.map((reg) => {
            const eventObj = events.find((e) => e.id === reg.eventId);
            const conflict = getConflictWarningForReg(reg);

            return (
              <div
                key={reg.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* Ticket Top Banner */}
                <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-5 flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                      Admission Pass
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold mt-1.5 leading-snug">
                      {reg.eventTitle}
                    </h3>
                  </div>

                  <div className="text-right shrink-0 relative z-10">
                    <span className="text-[10px] uppercase text-purple-200 block">Ticket No.</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-white bg-white/15 px-2.5 py-1 rounded-lg backdrop-blur-md">
                      {reg.ticketNumber}
                    </span>
                  </div>
                </div>

                {/* Conflict Alert if applicable */}
                {conflict && (
                  <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Time overlap detected with <strong>{conflict.event1.id === reg.eventId ? conflict.event2.title : conflict.event1.title}</strong>!
                    </span>
                  </div>
                )}

                {/* Ticket Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" /> Date
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {formatDisplayDate(reg.eventDate)}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-600" /> Timing
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {reg.eventTime}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" /> Venue
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {reg.eventVenue}
                      </p>
                    </div>
                  </div>

                  {/* Student Verification & Simulated QR Code */}
                  <div className="pt-3 border-t border-dashed border-slate-200 flex items-center justify-between gap-4">
                    <div className="text-xs">
                      <span className="text-slate-400">Attendee:</span>
                      <p className="font-bold text-slate-800">{reg.studentName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{reg.studentId} • {reg.department}</p>
                    </div>

                    {/* Simulated Visual QR Pass */}
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center shrink-0">
                      <QrCode className="w-12 h-12 text-slate-900" />
                      <span className="text-[9px] font-mono text-slate-400 mt-1">SCAN ON ARRIVAL</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedTicketForPrint(reg)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / Save Pass</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {eventObj && (
                        <button
                          onClick={() => onOpenEventDetails(eventObj)}
                          className="px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
                        >
                          View Event
                        </button>
                      )}

                      <button
                        onClick={() => handleCancel(reg)}
                        className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Registrations State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Confirmed Registrations Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            You haven't registered for any campus events. Explore our upcoming workshops, technical exhibitions, and competitions to reserve your seat.
          </p>
          <button
            onClick={() => onNavigateTab('events')}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 mx-auto"
          >
            <span>Browse Campus Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Simulated Printable Ticket Modal */}
      {selectedTicketForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Official Campus Event Pass
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                {selectedTicketForPrint.eventTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ticket Code: <span className="font-mono font-bold text-slate-800">{selectedTicketForPrint.ticketNumber}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Date & Timing:</span>
                <p className="font-semibold text-slate-800">{selectedTicketForPrint.eventDate} ({selectedTicketForPrint.eventTime})</p>
              </div>
              <div>
                <span className="text-slate-400">Venue:</span>
                <p className="font-semibold text-slate-800">{selectedTicketForPrint.eventVenue}</p>
              </div>
              <div>
                <span className="text-slate-400">Attendee:</span>
                <p className="font-semibold text-slate-800">{selectedTicketForPrint.studentName} ({selectedTicketForPrint.studentId})</p>
              </div>
            </div>

            <div className="flex justify-center p-3 bg-slate-100 rounded-2xl">
              <QrCode className="w-24 h-24 text-slate-900" />
            </div>

            <p className="text-[11px] text-slate-400">
              * Show this digital QR pass at the entrance gate along with your student ID card.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTicketForPrint(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
