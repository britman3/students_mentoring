import { addDays, differenceInDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "Europe/London";

/**
 * Ordinal suffix for a day number: 1st, 2nd, 3rd, 4th, etc.
 */
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Format a date in UK style: "Wednesday 21st January 2026 at 4:00 PM"
 */
export function formatUKDate(date: Date): string {
  const zoned = toZonedTime(date, TIMEZONE);
  const dayName = format(zoned, "EEEE");
  const day = zoned.getDate();
  const month = format(zoned, "MMMM");
  const year = format(zoned, "yyyy");
  const time = format(zoned, "h:mm a");
  return `${dayName} ${ordinal(day)} ${month} ${year} at ${time}`;
}

/**
 * Calculate the last call date: firstCallDate + 196 days
 * 15 fortnightly sessions = 14 gaps x 14 days = 196 days
 * Always falls on the same day of the week as the first call.
 */
export function getLastCallDate(firstCallDate: Date): Date {
  const zonedDate = toZonedTime(firstCallDate, TIMEZONE);
  return addDays(zonedDate, 196);
}

/**
 * Calculate the number of days remaining until the last call date.
 * Returns a negative number if the last call date has passed.
 */
export function getDaysUntilLastCall(firstCallDate: Date): number {
  const lastCallDate = getLastCallDate(firstCallDate);
  const now = toZonedTime(new Date(), TIMEZONE);
  return differenceInDays(lastCallDate, now);
}

/**
 * Short format: "21 Jan 2026"
 */
export function formatShortDate(date: Date): string {
  const zoned = toZonedTime(date, TIMEZONE);
  return format(zoned, "d MMM yyyy");
}

/**
 * Table format: "21/01/2026"
 */
export function formatTableDate(date: Date): string {
  const zoned = toZonedTime(date, TIMEZONE);
  return format(zoned, "dd/MM/yyyy");
}
