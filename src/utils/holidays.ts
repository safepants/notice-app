/**
 * Holiday detection engine for visual effects.
 * Holidays auto-activate on the right dates for visual widgets only.
 * Code validation is handled server-side via /api/verify-code.
 */

export interface Holiday {
  id: string;
  greeting: string;
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
    greeting: "happy holidays",
    window: [2, 7, 16],
    widget: "heart",
    accentTint: "rgba(220, 100, 120, 0.6)",
  },
  {
    id: "nye",
    greeting: "happy holidays",
    window: [12, 28, 31],
    widget: "firework",
  },
  {
    id: "nye-jan",
    greeting: "happy holidays",
    window: [1, 1, 3],
    widget: "sparkle",
  },
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
