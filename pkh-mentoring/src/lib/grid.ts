/**
 * Calculate the grid position (1-12) for a slot based on day and time.
 *
 * Days: Tuesday(2)=0, Wednesday(3)=1, Thursday(4)=2
 * Times: "12:00"=0, "14:00"=1, "16:00"=2, "18:00"=3
 * position = (dayIndex * 4) + timeIndex + 1
 */
export function calculateGridPosition(dayOfWeek: number, time: string): number {
  const dayIndex = dayOfWeek - 2; // Tuesday(2)=0, Wednesday(3)=1, Thursday(4)=2
  const timeMap: Record<string, number> = {
    "12:00": 0,
    "14:00": 1,
    "16:00": 2,
    "18:00": 3,
  };
  const timeIndex = timeMap[time];
  if (dayIndex < 0 || dayIndex > 2 || timeIndex === undefined) {
    throw new Error(`Invalid dayOfWeek (${dayOfWeek}) or time (${time})`);
  }
  return (dayIndex * 4) + timeIndex + 1;
}

/**
 * Get the group code for a given grid position and week number.
 *
 * Week 1: "W1" + String.fromCharCode(64 + gridPosition)  → W1A through W1L
 * Week 2: "W2" + String.fromCharCode(76 + gridPosition)  → W2M through W2X
 */
export function getGroupCode(gridPosition: number, weekNumber: 1 | 2): string {
  if (weekNumber === 1) {
    return "W1" + String.fromCharCode(64 + gridPosition);
  }
  return "W2" + String.fromCharCode(76 + gridPosition);
}

/**
 * Generate a human-readable display name for a slot.
 * E.g. "Wednesday 4pm", "Tuesday 12pm"
 */
export function generateDisplayName(dayOfWeek: number, time: string): string {
  const dayNames: Record<number, string> = {
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
  };
  const dayName = dayNames[dayOfWeek];
  if (!dayName) {
    throw new Error(`Invalid dayOfWeek: ${dayOfWeek}`);
  }

  const [hours] = time.split(":").map(Number);
  let timeLabel: string;
  if (hours === 0 || hours === 12) {
    timeLabel = "12pm";
  } else if (hours < 12) {
    timeLabel = `${hours}am`;
  } else {
    timeLabel = `${hours - 12}pm`;
  }

  return `${dayName} ${timeLabel}`;
}
