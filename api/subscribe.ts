import { rateLimit, getClientIp } from "./_lib/rate-limit.js";

export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limited = rateLimit(`subscribe:${getClientIp(request)}`, 3, 60_000);
  if (limited) return limited;

  try {
    const { email, source } = await request.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email) || email.length > 254) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate and cap source parameter
    const cleanSource = (typeof source === "string" ? source : "website").trim().slice(0, 50);
    const timestamp = new Date().toISOString();

    // Google Sheets webhook (POST with shared secret auth)
    // Uses redirect: "manual" because Apps Script returns 302 which converts POST to GET
    const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK;
    if (sheetWebhook) {
      try {
        const payload = JSON.stringify({
          _secret: process.env.GOOGLE_SHEET_SECRET || "",
          email,
          source: cleanSource,
          timestamp,
        });
        const hdrs = { "Content-Type": "application/json" };
        const res = await fetch(sheetWebhook, {
          method: "POST",
          headers: hdrs,
          body: payload,
          redirect: "manual",
        });
        if (res.status === 302 || res.status === 301) {
          const loc = res.headers.get("location");
          if (loc) await fetch(loc, { method: "POST", headers: hdrs, body: payload });
        }
      } catch (e) {
        console.error("Google Sheet webhook error:", e);
      }
    }

    // Option 2: Buttondown (if you switch to a newsletter later)
    const apiKey = process.env.BUTTONDOWN_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch("https://api.buttondown.email/v1/subscribers", {
          method: "POST",
          headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: email,
            tags: [cleanSource],
          }),
        });
        if (!res.ok && res.status !== 409) {
          const data = await res.json().catch(() => ({}));
          console.error("Buttondown error:", data);
        }
      } catch (e) {
        console.error("Buttondown error:", e);
      }
    }

    // Fallback: log if nothing is configured
    if (!sheetWebhook && !apiKey) {
      console.log("[subscribe] No storage configured");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Subscribe error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
