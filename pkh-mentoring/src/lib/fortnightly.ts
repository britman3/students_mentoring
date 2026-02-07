import { differenceInCalendarWeeks, nextDay, addWeeks, isBefore, isEqual } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const TIMEZONE = "Europe/London";
const DEFAULT_ANCHOR = new Date("2026-01-06T00:00:00.000Z"); // Monday 6th January 2026

/**
 * Day index used by date-fns `nextDay`:
 * 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday
 */
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Determine whether a given date falls in Week 1 or Week 2
 * of the fortnightly cycle.
 *
 * The anchor date is Week 1. Even-numbered weeks from the anchor = Week 1,
 * odd-numbered weeks = Week 2.
 */
export function getWeekNumber(
  date: Date,
  anchorDate: Date = DEFAULT_ANCHOR
): 1 | 2 {
  const zonedDate = toZonedTime(date, TIMEZONE);
  const zonedAnchor = toZonedTime(anchorDate, TIMEZONE);

  const weeksDiff = differenceInCalendarWeeks(zonedDate, zonedAnchor, {
    weekStartsOn: 1, // Monday
  });

  // Even weeks from anchor = Week 1, odd = Week 2
  const mod = ((weeksDiff % 2) + 2) % 2; // handle negative values
  return mod === 0 ? 1 : 2;
}

/**
 * Convenience function: returns true if the date is in Week 1.
 */
export function isWeek1(date: Date, anchorDate: Date = DEFAULT_ANCHOR): boolean {
  return getWeekNumber(date, anchorDate) === 1;
}

/**
 * Returns the current week number (1 or 2).
 */
export function getCurrentWeek(anchorDate: Date = DEFAULT_ANCHOR): 1 | 2 {
  return getWeekNumber(new Date(), anchorDate);
}

/**
 * Find the next call date for a given slot configuration.
 *
 * @param dayOfWeek - Day of the week (0=Sun .. 6=Sat)
 * @param time - Time in "HH:mm" format (24hr, UK time)
 * @param weekNumber - Which week of the fortnightly cycle (1 or 2)
 * @param fromDate - Starting date to search from (defaults to now)
 * @param anchorDate - Anchor date for the fortnightly cycle
 * @returns Full Date object representing the next call in Europe/London timezone
 */
export function getNextCallDate(
  dayOfWeek: number,
  time: string,
  weekNumber: 1 | 2,
  fromDate: Date = new Date(),
  anchorDate: Date = DEFAULT_ANCHOR
): Date {
  const [hours, minutes] = time.split(":").map(Number);

  // Start from today in London time
  const zonedFrom = toZonedTime(fromDate, TIMEZONE);

  // Build a candidate date: today at the specified time in London
  const candidateToday = new Date(zonedFrom);
  candidateToday.setHours(hours, minutes, 0, 0);

  // If today is the correct day of week and the time hasn't passed yet,
  // check if it's also the correct week
  let candidate: Date;
  if (zonedFrom.getDay() === dayOfWeek && isBefore(zonedFrom, candidateToday)) {
    candidate = candidateToday;
  } else {
    // Find the next occurrence of this day of week
    candidate = nextDay(zonedFrom, dayOfWeek as DayOfWeek);
    candidate.setHours(hours, minutes, 0, 0);
  }

  // Now iterate forward week by week until we find a date in the correct week
  for (let i = 0; i < 4; i++) {
    // Convert candidate (which is in London zoned time) back to UTC for week check
    const candidateUtc = fromZonedTime(candidate, TIMEZONE);
    if (getWeekNumber(candidateUtc, anchorDate) === weekNumber) {
      return candidateUtc;
    }
    candidate = addWeeks(candidate, 1);
  }

  // Fallback: should never reach here in a valid fortnightly cycle
  throw new Error("Could not find next call date within 4 weeks");
}
