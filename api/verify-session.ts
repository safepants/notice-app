import { rateLimit, getClientIp } from "./_lib/rate-limit.js";

export const config = { runtime: "edge" };

/**
 * Verifies a Stripe checkout session or a signed access token.
 *
 * Two modes:
 *   1. ?session_id=cs_... — calls Stripe API to verify payment_status === "paid"
 *   2. ?access=<hmac>&e=<base64email> — verifies HMAC signature (for email re-access links)
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY — sk_live_... or sk_test_... (for session verification)
 *   ACCESS_TOKEN_SECRET — separate secret for HMAC access token verification
 */

async function hmacSign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ valid: false }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limited = rateLimit(`verify-session:${getClientIp(request)}`, 10, 60_000);
  if (limited) return limited;

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const access = url.searchParams.get("access");
  const emailB64 = url.searchParams.get("e");
  const tokenEpoch = url.searchParams.get("t");

  // Mode 1: Verify Stripe checkout session
  if (sessionId) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ valid: false }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate session_id format to prevent injection
    if (!sessionId.startsWith("cs_")) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const res = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
        {
          headers: { Authorization: `Bearer ${stripeKey}` },
        }
      );

      if (!res.ok) {
        return new Response(JSON.stringify({ valid: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const session = await res.json();
      const paid = session.payment_status === "paid";

      return new Response(JSON.stringify({ valid: paid }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ valid: false }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Mode 2: Verify signed access token (from email links)
  if (access && emailB64) {
    const accessSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessSecret) {
      console.error("ACCESS_TOKEN_SECRET not configured");
      return new Response(JSON.stringify({ valid: false }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const email = atob(emailB64);

      // Support both legacy tokens (no timestamp) and new tokens (with epoch month)
      const TOKEN_WINDOW_MONTHS = 120;
      const currentEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 30));
      let valid = false;

      if (tokenEpoch) {
        const epoch = parseInt(tokenEpoch, 10);
        if (!isNaN(epoch) && Math.abs(currentEpoch - epoch) <= TOKEN_WINDOW_MONTHS) {
          const expected = await hmacSign(accessSecret, `${email}:${epoch}`);
          valid = constantTimeEqual(access, expected);
        }
      } else {
        const expected = await hmacSign(accessSecret, email);
        valid = constantTimeEqual(access, expected);
      }

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

  return new Response(JSON.stringify({ valid: false }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
