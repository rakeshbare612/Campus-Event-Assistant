/**
 * Utility functions for date parsing, formatting, and conflict detection
 */

// Converts a time string like "10:00 AM" or "01:30 PM" to minutes from midnight
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];

  if (period === 'PM' && hours < 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

// Checks if two event intervals on the same day overlap
export function doTimesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeStringToMinutes(start1);
  const e1 = timeStringToMinutes(end1);
  const s2 = timeStringToMinutes(start2);
  const e2 = timeStringToMinutes(end2);

  // Overlap condition: start1 < end2 && start2 < end1
  return s1 < e2 && s2 < e1;
}

// Format YYYY-MM-DD into a human-friendly format e.g. "Tuesday, Oct 20, 2026"
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Check if event is today based on reference date (defaults to current app date 2026-10-13 or system date)
export function isEventToday(dateStr: string, refDateStr = '2026-10-13'): boolean {
  return dateStr === refDateStr;
}

// Check if an event date is in the past
export function isEventPast(dateStr: string, refDateStr = '2026-10-13'): boolean {
  return dateStr < refDateStr;
}

// Calculate remaining days
export function getDaysUntil(dateStr: string, refDateStr = '2026-10-13'): number {
  try {
    const [y1, m1, d1] = refDateStr.split('-').map(Number);
    const [y2, m2, d2] = dateStr.split('-').map(Number);
    const dRef = new Date(y1, m1 - 1, d1).getTime();
    const dTarget = new Date(y2, m2 - 1, d2).getTime();
    const diffTime = dTarget - dRef;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}
