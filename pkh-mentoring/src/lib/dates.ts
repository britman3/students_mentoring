import { addMonths, addWeeks, differenceInDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "Europe/London";

/**
 * Calculate the last call date: firstCallDate + 6 months + 2 weeks
 */
export function getLastCallDate(firstCallDate: Date): Date {
  const zonedDate = toZonedTime(firstCallDate, TIMEZONE);
  const plusSixMonths = addMonths(zonedDate, 6);
  const plusTwoWeeks = addWeeks(plusSixMonths, 2);
  return plusTwoWeeks;
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
