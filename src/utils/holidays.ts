/**
 * Holiday detection engine.
 * Add new holidays here — they auto-activate on the right dates.
 * Inspired by old-school Google Doodles: subtle, delightful, never obnoxious.
 */

export interface Holiday {
  id: string;
  code: string; // secret unlock code
  greeting: string; // shown on landing page
  /** Month (1-12), start day, end day (inclusive) */
  window: [number, number, number];
  /** Small visual hint — mapped to a component in LandingPage */
  widget: "heart" | "snowflake" | "sparkle" | "leaf" | "firework";
  /** Optional accent tint (CSS color) */
  accentTint?: string;
}

const HOLIDAYS: Holiday[] = [
  {
    id: "valentines",
    code: "iloveyou",
    greeting: "happy holidays",
    window: [2, 7, 16],
    widget: "heart",
    accentTint: "rgba(220, 100, 120, 0.6)",
  },
  {
    id: "nye",
    code: "newyear",
    greeting: "happy holidays",
    window: [12, 28, 31],
    widget: "firework",
  },
  {
    id: "nye-jan",
    code: "newyear",
    greeting: "happy holidays",
    window: [1, 1, 3],
    widget: "sparkle",
  },
  // Add more: Halloween, Thanksgiving, etc.
];

export function getActiveHoliday(): Holiday | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  return (
    HOLIDAYS.find(
      (h) => h.window[0] === month && day >= h.window[1] && day <= h.window[2]
    ) ?? null
  );
}

export function validateCode(input: string): Holiday | null {
  const cleaned = input.trim().toLowerCase();
  return HOLIDAYS.find((h) => h.code === cleaned) ?? null;
}
