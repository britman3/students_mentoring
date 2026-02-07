import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "Europe/London";

export function formatDateLondon(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const zonedDate = toZonedTime(d, TIMEZONE);
  return format(zonedDate, "EEEE do MMMM yyyy 'at' h:mm a");
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const zonedDate = toZonedTime(d, TIMEZONE);
  return format(zonedDate, "dd/MM/yyyy");
}

export function formatDateISO(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const zonedDate = toZonedTime(d, TIMEZONE);
  return format(zonedDate, "yyyy-MM-dd");
}
