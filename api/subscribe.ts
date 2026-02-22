import { rateLimit, getClientIp } from "./_lib/rate-limit.js";

export const config = { runtime: "edge" };

const WELCOME_EMAIL_HTML = `
<div style="background-color:#ffffff;padding:48px 24px;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:440px;margin:0 auto;">
    <p style="color:#999999;font-size:13px;margin:0 0 48px 0;">
      notice
    </p>
    <p style="color:#222222;font-size:18px;line-height:1.8;margin:0 0 48px 0;font-style:italic;">
      Have you noticed how profound us being alive at the same time is? The universe is a fishy coincidence, and a fish does not know it is wet!
    </p>
    <p style="color:#888888;font-size:14px;line-height:1.6;margin:0 0 48px 0;">
      That one is the last prompt in the game. There are 146 before it.
    </p>
    <a href="https://playnotice.com" style="color:#222222;font-size:14px;text-decoration:underline;">
      playnotice.com
    </a>
  </div>
</div>
`;

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

    // Welcome email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "notice <noreply@playnotice.com>",
            to: [email],
            subject: "a fishy coincidence",
            html: WELCOME_EMAIL_HTML,
            text: "Have you noticed how profound us being alive at the same time is? The universe is a fishy coincidence, and a fish does not know it is wet!\n\nThat one is the last prompt in the game. There are 146 before it.\n\nplaynotice.com",
          }),
        });
      } catch (e) {
        console.error("Welcome email error:", e);
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
