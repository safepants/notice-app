/**
 * Holiday detection engine + promo code system.
 * Holidays auto-activate on the right dates.
 * Promo codes are permanent (Substack, partnerships, etc.).
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

export interface PromoCode {
  id: string;
  code: string;
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

const PROMO_CODES: PromoCode[] = [
  { id: "substack", code: "becauseis" },
  // Add more promo codes here
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

export function validateCode(input: string): Holiday | PromoCode | null {
  const cleaned = input.trim().toLowerCase();
  // Check holiday codes first
  const holiday = HOLIDAYS.find((h) => h.code === cleaned);
  if (holiday) return holiday;
  // Check promo codes
  const promo = PROMO_CODES.find((p) => p.code === cleaned);
  if (promo) return promo;
  return null;
}
