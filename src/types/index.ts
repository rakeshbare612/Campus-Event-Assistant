export type EventCategory = 
  | 'technical' 
  | 'cultural' 
  | 'sports' 
  | 'workshop' 
  | 'seminar' 
  | 'competition';

export interface CampusEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD e.g. '2026-10-20'
  startTime: string; // e.g. '10:00 AM'
  endTime: string; // e.g. '01:00 PM'
  venue: string;
  description: string;
  organizer: string;
  capacity: number;
  registeredCount: number;
  registrationDeadline: string; // YYYY-MM-DD
  isDemo: boolean;
  status: 'open' | 'full' | 'cancelled' | 'closed';
  targetAudience: string[];
  prerequisites: string[];
  tags: string[];
  image: string;
  contactEmail: string;
  speakers?: string[];
  certificateProvided: boolean;
  fee: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
}

export interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  studentName: string;
  studentId: string;
  department: string;
  email: string;
  timestamp: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  ticketNumber: string;
  qrCodeSeed: string;
}

export interface StudentProfile {
  name: string;
  studentId: string;
  department: string;
  year: string;
  email: string;
  interests: string[];
  preferredCategories: EventCategory[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  availability: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{
    label: string;
    action: 'view_event' | 'register_event' | 'open_schedule' | 'open_tab';
    targetId?: string;
  }>;
  relatedEventIds?: string[];
  isError?: boolean;
}

export interface RecommendationResult {
  eventId: string;
  matchScore: number; // 0 - 100
  reason: string;
  highlightBenefit: string;
}

export interface ScheduleConflict {
  event1: CampusEvent;
  event2: CampusEvent;
  date: string;
  overlappingTime: string;
  recommendedResolution: string;
}

export interface CIE3TestCase {
  id: number;
  title: string;
  description: string;
  category: 'Event Search' | 'Filter & Registration' | 'Concurrency & Capacity' | 'Schedule Conflicts' | 'AI Intelligence' | 'Validation';
  steps: string[];
  expectedOutcome: string;
  status: 'untested' | 'passing' | 'failing' | 'running';
  actualResult?: string;
  logs?: string[];
}
