import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { CampusEvent, Registration, StudentProfile, ScheduleConflict, EventCategory } from '../types';
import { INITIAL_EVENTS, DEFAULT_STUDENT_PROFILE } from '../data/initialEvents';
import { doTimesOverlap, isEventPast } from '../utils/dateUtils';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface EventContextType {
  events: CampusEvent[];
  registrations: Registration[];
  favorites: string[];
  studentProfile: StudentProfile;
  waitlist: Record<string, string[]>; // eventId -> list of studentIds
  toasts: ToastNotification[];
  removeToast: (id: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  
  // Registration operations
  registerForEvent: (eventId: string, customStudent?: Partial<StudentProfile>) => {
    success: boolean;
    status: 'confirmed' | 'waitlisted' | 'error';
    message: string;
    registration?: Registration;
  };
  cancelRegistration: (eventId: string) => {
    success: boolean;
    message: string;
  };
  isRegistered: (eventId: string) => boolean;
  isWaitlisted: (eventId: string) => boolean;
  getRegistrationForEvent: (eventId: string) => Registration | undefined;

  // Favorites
  toggleFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;

  // Schedule & Conflicts
  getConflictsForEvent: (event: CampusEvent) => CampusEvent[];
  registeredEventsWithConflicts: ScheduleConflict[];

  // Organizer Actions
  addEvent: (eventData: Omit<CampusEvent, 'id' | 'isDemo' | 'registeredCount'>) => {
    success: boolean;
    message: string;
    event?: CampusEvent;
  };
  updateEvent: (updatedEvent: CampusEvent) => {
    success: boolean;
    message: string;
  };
  deleteEvent: (eventId: string) => {
    success: boolean;
    message: string;
  };
  toggleEventStatus: (eventId: string, newStatus: 'open' | 'full' | 'cancelled' | 'closed') => void;

  // Student Profile
  updateStudentProfile: (profile: Partial<StudentProfile>) => void;

  // Reset demo
  resetDemoData: () => void;
}

const STORAGE_KEYS = {
  EVENTS: 'cea_events_v1',
  REGISTRATIONS: 'cea_registrations_v1',
  FAVORITES: 'cea_favorites_v1',
  PROFILE: 'cea_profile_v1',
  WAITLIST: 'cea_waitlist_v1',
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Events State
  const [events, setEvents] = useState<CampusEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored events:', e);
    }
    return INITIAL_EVENTS;
  });

  // 2. Registrations State (Seed AI Workshop as initial registration for instant realism)
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse registrations:', e);
    }
    // Default initial registration
    return [
      {
        id: 'reg-init-01',
        eventId: 'evt-101',
        eventTitle: 'AI & Machine Learning Workshop',
        eventDate: '2026-10-20',
        eventTime: '10:00 AM - 01:00 PM',
        eventVenue: 'Alan Turing Auditorium, Block B',
        studentName: DEFAULT_STUDENT_PROFILE.name,
        studentId: DEFAULT_STUDENT_PROFILE.studentId,
        department: DEFAULT_STUDENT_PROFILE.department,
        email: DEFAULT_STUDENT_PROFILE.email,
        timestamp: '2026-10-12T14:20:00.000Z',
        status: 'confirmed',
        ticketNumber: 'TKT-AIML-9021',
        qrCodeSeed: 'CEA-EVT-101-CE2024-CIE3-042',
      },
    ];
  });

  // 3. Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse favorites:', e);
    }
    return ['evt-102', 'evt-105'];
  });

  // 4. Student Profile State
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse profile:', e);
    }
    return DEFAULT_STUDENT_PROFILE;
  });

  // 5. Waitlist State
  const [waitlist, setWaitlist] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WAITLIST);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse waitlist:', e);
    }
    return {};
  });

  // 6. Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.warn('LocalStorage error on events:', e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
    } catch (e) {
      console.warn('LocalStorage error on registrations:', e);
    }
  }, [registrations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.warn('LocalStorage error on favorites:', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(studentProfile));
    } catch (e) {
      console.warn('LocalStorage error on profile:', e);
    }
  }, [studentProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(waitlist));
    } catch (e) {
      console.warn('LocalStorage error on waitlist:', e);
    }
  }, [waitlist]);

  // Query helpers
  const isRegistered = (eventId: string) => {
    return registrations.some((r) => r.eventId === eventId && r.status === 'confirmed');
  };

  const isWaitlisted = (eventId: string) => {
    const list = waitlist[eventId] || [];
    return list.includes(studentProfile.studentId);
  };

  const getRegistrationForEvent = (eventId: string) => {
    return registrations.find((r) => r.eventId === eventId && r.status === 'confirmed');
  };

  const isFavorite = (eventId: string) => {
    return favorites.includes(eventId);
  };

  const toggleFavorite = (eventId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(eventId);
      const next = exists ? prev.filter((id) => id !== eventId) : [...prev, eventId];
      showToast(
        'info',
        exists ? 'Removed from Bookmarks' : 'Added to Bookmarks',
        exists ? 'Event removed from your saved list.' : 'Event saved to your quick reference list.'
      );
      return next;
    });
  };

  // Conflict detection for a given event against current confirmed registrations
  const getConflictsForEvent = (targetEvent: CampusEvent): CampusEvent[] => {
    const registeredEvents = registrations
      .filter((r) => r.status === 'confirmed' && r.eventId !== targetEvent.id)
      .map((r) => events.find((e) => e.id === r.eventId))
      .filter((e): e is CampusEvent => !!e);

    return registeredEvents.filter((regEvt) => {
      if (regEvt.date !== targetEvent.date) return false;
      return doTimesOverlap(
        targetEvent.startTime,
        targetEvent.endTime,
        regEvt.startTime,
        regEvt.endTime
      );
    });
  };

  // Compute all conflicts among registered events
  const registeredEventsWithConflicts = useMemo<ScheduleConflict[]>(() => {
    const activeRegistrations = registrations.filter((r) => r.status === 'confirmed');
    const registeredList = activeRegistrations
      .map((r) => events.find((e) => e.id === r.eventId))
      .filter((e): e is CampusEvent => !!e);

    const conflicts: ScheduleConflict[] = [];

    for (let i = 0; i < registeredList.length; i++) {
      for (let j = i + 1; j < registeredList.length; j++) {
        const ev1 = registeredList[i];
        const ev2 = registeredList[j];
        if (ev1.date === ev2.date && doTimesOverlap(ev1.startTime, ev1.endTime, ev2.startTime, ev2.endTime)) {
          conflicts.push({
            event1: ev1,
            event2: ev2,
            date: ev1.date,
            overlappingTime: `${ev1.startTime} - ${ev1.endTime} overlaps with ${ev2.startTime} - ${ev2.endTime}`,
            recommendedResolution: `Prioritize ${ev1.title} or ${ev2.title} based on your course credits or team obligations. Cancel one to avoid missed attendance.`,
          });
        }
      }
    }
    return conflicts;
  }, [registrations, events]);

  // Core Registration Handler
  const registerForEvent = (
    eventId: string,
    customStudent?: Partial<StudentProfile>
  ): {
    success: boolean;
    status: 'confirmed' | 'waitlisted' | 'error';
    message: string;
    registration?: Registration;
  } => {
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      showToast('error', 'Event Not Found', 'Could not locate the requested event record.');
      return { success: false, status: 'error', message: 'Event not found in the system registry.' };
    }

    // Check if event is cancelled or closed
    if (event.status === 'cancelled') {
      showToast('error', 'Registration Failed', 'This event has been cancelled by the department organizers.');
      return { success: false, status: 'error', message: 'This event has been cancelled by the organizers.' };
    }
    if (event.status === 'closed') {
      showToast('error', 'Registration Closed', 'The registration window for this event is now closed.');
      return { success: false, status: 'error', message: 'The registration deadline has passed for this event.' };
    }

    // Check deadline
    if (isEventPast(event.registrationDeadline)) {
      showToast('warning', 'Deadline Expired', `The registration deadline was ${event.registrationDeadline}. New submissions are closed.`);
      return { success: false, status: 'error', message: `Registration deadline (${event.registrationDeadline}) has passed.` };
    }

    // Check duplicate registration
    const alreadyRegistered = registrations.some(
      (r) => r.eventId === eventId && r.status === 'confirmed'
    );
    if (alreadyRegistered) {
      showToast('warning', 'Already Registered', `You have already secured a confirmed ticket for "${event.title}".`);
      return { success: false, status: 'error', message: `Duplicate registration prevented: You are already registered for ${event.title}.` };
    }

    const currentStudent = { ...studentProfile, ...customStudent };

    // Check capacity
    const isFull = event.registeredCount >= event.capacity || event.status === 'full';
    if (isFull) {
      // Add to waitlist
      const currentWaitlist = waitlist[eventId] || [];
      if (currentWaitlist.includes(currentStudent.studentId)) {
        showToast('warning', 'Already Waitlisted', `You are already on the priority waitlist for "${event.title}".`);
        return { success: false, status: 'waitlisted', message: `You are already on the waitlist for ${event.title}.` };
      }

      setWaitlist((prev) => ({
        ...prev,
        [eventId]: [...(prev[eventId] || []), currentStudent.studentId],
      }));

      showToast(
        'warning',
        'Event Full — Waitlisted',
        `"${event.title}" has reached full capacity (${event.capacity} seats). You have been placed at position #${currentWaitlist.length + 1} on the simulated waitlist.`
      );
      return {
        success: true,
        status: 'waitlisted',
        message: `Event is at full capacity (${event.capacity}/${event.capacity}). You have been placed on the simulated waitlist at position #${currentWaitlist.length + 1}.`,
      };
    }

    // Check schedule overlap for warning toast
    const conflicts = getConflictsForEvent(event);
    if (conflicts.length > 0) {
      showToast(
        'warning',
        'Schedule Overlap Detected',
        `Warning: This event time overlaps with your registered event "${conflicts[0].title}". You can still register, but please check your Schedule Planner!`
      );
    }

    // Confirm registration
    const ticketId = `TKT-${event.category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReg: Registration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: `${event.startTime} - ${event.endTime}`,
      eventVenue: event.venue,
      studentName: currentStudent.name,
      studentId: currentStudent.studentId,
      department: currentStudent.department,
      email: currentStudent.email,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
      ticketNumber: ticketId,
      qrCodeSeed: `CEA-${event.id}-${currentStudent.studentId}-${ticketId}`,
    };

    // Update event registered count
    setEvents((prevEvents) =>
      prevEvents.map((e) => {
        if (e.id === eventId) {
          const newCount = e.registeredCount + 1;
          return {
            ...e,
            registeredCount: newCount,
            status: newCount >= e.capacity ? 'full' : e.status,
          };
        }
        return e;
      })
    );

    setRegistrations((prev) => [...prev, newReg]);

    showToast(
      'success',
      'Registration Confirmed!',
      `Ticket #${ticketId} generated for "${event.title}". Admission pass saved to "My Registrations".`
    );

    return {
      success: true,
      status: 'confirmed',
      message: `Registration successful! Your ticket number is ${ticketId}.`,
      registration: newReg,
    };
  };

  // Core Cancel Registration Handler
  const cancelRegistration = (eventId: string): { success: boolean; message: string } => {
    const existing = registrations.find(
      (r) => r.eventId === eventId && r.status === 'confirmed'
    );

    if (!existing) {
      showToast('error', 'Cancellation Failed', 'No active registration found for this event.');
      return { success: false, message: 'No confirmed registration found to cancel.' };
    }

    // Remove registration
    setRegistrations((prev) => prev.filter((r) => r.id !== existing.id));

    // Decrement event registered count and promote from waitlist if exists
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const newCount = Math.max(0, e.registeredCount - 1);
          return {
            ...e,
            registeredCount: newCount,
            status: e.status === 'full' && newCount < e.capacity ? 'open' : e.status,
          };
        }
        return e;
      })
    );

    // If waitlist had someone, notify
    const eventWaitlist = waitlist[eventId] || [];
    if (eventWaitlist.length > 0) {
      const nextStudent = eventWaitlist[0];
      setWaitlist((prev) => ({
        ...prev,
        [eventId]: (prev[eventId] || []).slice(1),
      }));
      console.log(`Waitlist auto-seat allocated for student ${nextStudent} in event ${eventId}`);
    }

    showToast(
      'info',
      'Registration Cancelled',
      `Your registration for "${existing.eventTitle}" has been cancelled. The seat is now released.`
    );

    return {
      success: true,
      message: `Successfully cancelled registration for ${existing.eventTitle}.`,
    };
  };

  // Organizer: Add Event
  const addEvent = (
    eventData: Omit<CampusEvent, 'id' | 'isDemo' | 'registeredCount'>
  ): { success: boolean; message: string; event?: CampusEvent } => {
    const id = `evt-${Date.now().toString(36)}`;
    const newEvent: CampusEvent = {
      ...eventData,
      id,
      isDemo: true,
      registeredCount: 0,
      status: eventData.status || 'open',
    };

    setEvents((prev) => [newEvent, ...prev]);
    showToast('success', 'Event Created', `"${newEvent.title}" has been published to the campus catalog.`);
    return { success: true, message: 'Event successfully created.', event: newEvent };
  };

  // Organizer: Update Event
  const updateEvent = (updatedEvent: CampusEvent): { success: boolean; message: string } => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? { ...updatedEvent, isDemo: true } : e))
    );
    showToast('success', 'Event Updated', `Changes to "${updatedEvent.title}" have been saved.`);
    return { success: true, message: 'Event successfully updated.' };
  };

  // Organizer: Delete Event
  const deleteEvent = (eventId: string): { success: boolean; message: string } => {
    const target = events.find((e) => e.id === eventId);
    if (!target) {
      return { success: false, message: 'Event not found.' };
    }

    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    // Also cancel active registrations
    setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));
    setFavorites((prev) => prev.filter((id) => id !== eventId));

    showToast('warning', 'Event Deleted', `"${target.title}" was removed from the campus catalog.`);
    return { success: true, message: `Event "${target.title}" successfully deleted.` };
  };

  // Toggle Event Status
  const toggleEventStatus = (eventId: string, newStatus: 'open' | 'full' | 'cancelled' | 'closed') => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
    );
    showToast('info', 'Status Updated', `Event status set to "${newStatus.toUpperCase()}".`);
  };

  // Update Profile
  const updateStudentProfile = (updated: Partial<StudentProfile>) => {
    setStudentProfile((prev) => {
      const next = { ...prev, ...updated };
      showToast('success', 'Profile Updated', 'Student preferences and profile details have been saved.');
      return next;
    });
  };

  // Reset Demo Data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.REGISTRATIONS);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.WAITLIST);

    setEvents(INITIAL_EVENTS);
    setRegistrations([
      {
        id: 'reg-init-01',
        eventId: 'evt-101',
        eventTitle: 'AI & Machine Learning Workshop',
        eventDate: '2026-10-20',
        eventTime: '10:00 AM - 01:00 PM',
        eventVenue: 'Alan Turing Auditorium, Block B',
        studentName: DEFAULT_STUDENT_PROFILE.name,
        studentId: DEFAULT_STUDENT_PROFILE.studentId,
        department: DEFAULT_STUDENT_PROFILE.department,
        email: DEFAULT_STUDENT_PROFILE.email,
        timestamp: '2026-10-12T14:20:00.000Z',
        status: 'confirmed',
        ticketNumber: 'TKT-AIML-9021',
        qrCodeSeed: 'CEA-EVT-101-CE2024-CIE3-042',
      },
    ]);
    setFavorites(['evt-102', 'evt-105']);
    setStudentProfile(DEFAULT_STUDENT_PROFILE);
    setWaitlist({});

    showToast('info', 'Demo Data Reset', 'Campus Event Assistant demo dataset restored to factory baseline state.');
  };

  return (
    <EventContext.Provider
      value={{
        events,
        registrations,
        favorites,
        studentProfile,
        waitlist,
        toasts,
        removeToast,
        showToast,
        registerForEvent,
        cancelRegistration,
        isRegistered,
        isWaitlisted,
        getRegistrationForEvent,
        toggleFavorite,
        isFavorite,
        getConflictsForEvent,
        registeredEventsWithConflicts,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleEventStatus,
        updateStudentProfile,
        resetDemoData,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
