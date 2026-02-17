import { rateLimit, getClientIp } from "./_lib/rate-limit.js";

export const config = { runtime: "edge" };

/**
 * Server-side promo/holiday code verification.
 *
 * Accepts { code: string } and validates against UNLOCK_CODES env var.
 * Returns { valid: true/false }.
 *
 * Required env var:
 *   UNLOCK_CODES — comma-separated list (e.g. "becauseis,iloveyou,newyear")
 */

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ valid: false }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limited = rateLimit(`verify-code:${getClientIp(request)}`, 5, 60_000);
  if (limited) return limited;

  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return new Response(JSON.stringify({ valid: false }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const unlockCodes = process.env.UNLOCK_CODES;
    if (!unlockCodes) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validCodes = unlockCodes.split(",").map((c) => c.trim().toLowerCase());
    const cleaned = code.trim().toLowerCase();
    const valid = validCodes.includes(cleaned);

    return new Response(JSON.stringify({ valid }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ valid: false }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
