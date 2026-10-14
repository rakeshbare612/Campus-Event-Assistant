import React, { useState } from 'react';
import { useEvents } from '../../context/EventContext';
import { CampusEvent, EventCategory } from '../../types';
import { formatDisplayDate } from '../../utils/dateUtils';
import {
  ShieldAlert,
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  Check,
  X,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Tag,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const OrganizerPanelView: React.FC = () => {
  const {
    events,
    registrations,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    showToast,
  } = useEvents();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [viewingParticipantsFor, setViewingParticipantsFor] = useState<CampusEvent | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<EventCategory>('technical');
  const [formDate, setFormDate] = useState('2026-10-25');
  const [formStartTime, setFormStartTime] = useState('10:00 AM');
  const [formEndTime, setFormEndTime] = useState('01:00 PM');
  const [formVenue, setFormVenue] = useState('');
  const [formOrganizer, setFormOrganizer] = useState('');
  const [formCapacity, setFormCapacity] = useState(60);
  const [formDeadline, setFormDeadline] = useState('2026-10-24');
  const [formDescription, setFormDescription] = useState('');
  const [formFee, setFormFee] = useState('Free');
  const [formDifficulty, setFormDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('All Levels');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormCategory('technical');
    setFormDate('2026-10-26');
    setFormStartTime('10:00 AM');
    setFormEndTime('01:00 PM');
    setFormVenue('Computer Lab 201');
    setFormOrganizer('Department Student Council');
    setFormCapacity(50);
    setFormDeadline('2026-10-25');
    setFormDescription('Interactive technical session with hands-on labs and student demonstrations.');
    setFormFee('Free');
    setFormDifficulty('Intermediate');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (event: CampusEvent) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormCategory(event.category);
    setFormDate(event.date);
    setFormStartTime(event.startTime);
    setFormEndTime(event.endTime);
    setFormVenue(event.venue);
    setFormOrganizer(event.organizer);
    setFormCapacity(event.capacity);
    setFormDeadline(event.registrationDeadline);
    setFormDescription(event.description);
    setFormFee(event.fee);
    setFormDifficulty(event.difficulty || 'All Levels');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) errors.title = 'Title is required';
    if (!formVenue.trim()) errors.venue = 'Venue is required';
    if (!formOrganizer.trim()) errors.organizer = 'Organizer name is required';
    if (!formDate.trim()) errors.date = 'Date is required';
    if (!formDeadline.trim()) errors.deadline = 'Deadline is required';
    if (formCapacity <= 0) errors.capacity = 'Capacity must be greater than 0';
    if (formDeadline > formDate) errors.deadline = 'Deadline cannot be after event date';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please correct the highlighted form errors.');
      return;
    }

    if (editingEvent) {
      updateEvent({
        ...editingEvent,
        title: formTitle,
        category: formCategory,
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        venue: formVenue,
        organizer: formOrganizer,
        capacity: Number(formCapacity),
        registrationDeadline: formDeadline,
        description: formDescription,
        fee: formFee,
        difficulty: formDifficulty,
      });
    } else {
      addEvent({
        title: formTitle,
        category: formCategory,
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        venue: formVenue,
        organizer: formOrganizer,
        capacity: Number(formCapacity),
        registrationDeadline: formDeadline,
        description: formDescription,
        fee: formFee,
        difficulty: formDifficulty,
        status: 'open',
        targetAudience: ['Engineering Students'],
        prerequisites: ['Valid Student ID'],
        tags: [formCategory, 'CollegeEvent', 'Workshop'],
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        contactEmail: 'organizer@campus.edu',
        certificateProvided: true,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (event: CampusEvent) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"? This cannot be undone.`)) {
      deleteEvent(event.id);
    }
  };

  // Get participants for viewing
  const participants = viewingParticipantsFor
    ? registrations.filter((r) => r.eventId === viewingParticipantsFor.id && r.status === 'confirmed')
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Demo Warning Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <span className="font-bold">Demonstration Organizer Dashboard (CIE-3 Assessment):</span>
          <p className="text-amber-800 mt-0.5">
            This administrative control panel is provided for project grading and testing purposes. In a real institutional deployment, role-based access control (RBAC) and faculty authentication would protect these actions.
          </p>
        </div>
      </div>

      {/* Header & New Event Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Event Organizer Management Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish new campus events, monitor seat capacities, manage participants, and toggle event statuses.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Search & Statistics Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter managed events..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span>Total Managed: <strong>{events.length}</strong></span>
          <span>•</span>
          <span>Total Registered Students: <strong>{registrations.length}</strong></span>
        </div>
      </div>

      {/* Events Admin Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Event Details</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Venue</th>
                <th className="p-4">Registrations</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((evt) => {
                const isFull = evt.registeredCount >= evt.capacity || evt.status === 'full';
                const isCancelled = evt.status === 'cancelled';

                return (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{evt.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{evt.organizer} • <span className="uppercase text-purple-700 font-semibold">{evt.category}</span></div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{evt.date}</div>
                      <div className="text-slate-500 text-[11px]">{evt.startTime} - {evt.endTime}</div>
                    </td>

                    <td className="p-4">
                      <span className="text-slate-700">{evt.venue}</span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {evt.registeredCount} / {evt.capacity}
                        </span>
                        <button
                          onClick={() => setViewingParticipantsFor(evt)}
                          className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                          title="View participants"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full ${isFull ? 'bg-rose-500' : 'bg-purple-600'}`}
                          style={{ width: `${Math.min(100, (evt.registeredCount / evt.capacity) * 100)}%` }}
                        />
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={evt.status}
                        onChange={(e) => toggleEventStatus(evt.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                          evt.status === 'open'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : evt.status === 'full'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : evt.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="open">OPEN</option>
                        <option value="full">FULL</option>
                        <option value="cancelled">CANCELLED</option>
                        <option value="closed">CLOSED</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(evt)}
                          className="p-2 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(evt)}
                          className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingEvent ? 'Edit Event Details' : 'Publish New Campus Event'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Machine Learning Masterclass"
                  className={`w-full px-3.5 py-2 rounded-xl border ${formErrors.title ? 'border-rose-400' : 'border-slate-200'} focus:ring-2 focus:ring-purple-600 focus:outline-none`}
                />
                {formErrors.title && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="technical">Technical</option>
                    <option value="workshop">Workshop</option>
                    <option value="competition">Competition</option>
                    <option value="seminar">Seminar</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date (YYYY-MM-DD) *</label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="2026-10-25"
                    className={`w-full px-3.5 py-2 rounded-xl border ${formErrors.date ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                  {formErrors.date && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.date}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    placeholder="01:00 PM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    placeholder="e.g. Auditorium Hall A"
                    className={`w-full px-3.5 py-2 rounded-xl border ${formErrors.venue ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organizer Name *</label>
                  <input
                    type="text"
                    value={formOrganizer}
                    onChange={(e) => setFormOrganizer(e.target.value)}
                    placeholder="e.g. ACM Student Chapter"
                    className={`w-full px-3.5 py-2 rounded-xl border ${formErrors.organizer ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity (Seats) *</label>
                  <input
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    min={1}
                    className={`w-full px-3.5 py-2 rounded-xl border ${formErrors.capacity ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registration Deadline *</label>
                  <input
                    type="text"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    placeholder="2026-10-24"
                    className={`w-full px-3.5 py-2 rounded-xl border ${formErrors.deadline ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                  {formErrors.deadline && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.deadline}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entry Fee</label>
                  <input
                    type="text"
                    value={formFee}
                    onChange={(e) => setFormFee(e.target.value)}
                    placeholder="Free"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md"
                >
                  {editingEvent ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants View Modal */}
      {viewingParticipantsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">
                  Registered Participants ({participants.length})
                </h3>
                <p className="text-xs text-purple-700 mt-0.5">
                  {viewingParticipantsFor.title}
                </p>
              </div>
              <button
                onClick={() => setViewingParticipantsFor(null)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
              {participants.length > 0 ? (
                participants.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{p.studentName}</span>
                      <p className="text-[11px] text-slate-500 font-mono">{p.studentId} • {p.department}</p>
                    </div>
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-purple-700 font-bold">
                      {p.ticketNumber}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-6">
                  No confirmed registrations found for this event yet.
                </p>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setViewingParticipantsFor(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
