const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] || "Unknown";
}

export function formatDisplayTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  if (minutes === 0) return `${displayHours}${period}`;
  return `${displayHours}:${String(minutes).padStart(2, "0")}${period}`;
}
