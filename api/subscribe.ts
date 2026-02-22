import { rateLimit, getClientIp } from "./_lib/rate-limit.js";

export const config = { runtime: "edge" };

const WELCOME_EMAIL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>a fishy coincidence</title>
</head>
<body style="margin:0;padding:0;background-color:#f9f9f9;-webkit-text-size-adjust:100%;">
<div style="background-color:#f9f9f9;padding:56px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:420px;margin:0 auto;">
    <p style="color:#aaaaaa;font-size:12px;font-family:Georgia,'Times New Roman',serif;font-style:italic;margin:0 0 52px 0;">
      notice
    </p>
    <p style="color:#333333;font-size:17px;line-height:1.8;margin:0 0 4px 0;font-weight:300;">
      Have you noticed how profound being alive at the same time is? The universe is a fishy coincidence
    </p>
    <p style="color:#888888;font-size:15px;line-height:1.8;margin:0 0 44px 0;font-weight:300;font-style:italic;">
      and a fish does not know it is wet!
    </p>
    <p style="color:#666666;font-size:14px;font-weight:300;margin:0 0 4px 0;">
      made a game so you talk to your friends
    </p>
    <p style="margin:0 0 6px 0;">
      <a href="https://playnotice.com" style="color:#333333;font-size:14px;text-decoration:underline;">playnotice.com</a>
    </p>
    <p style="margin:0;">
      <a href="https://youtube.com/@8notice9" style="color:#bbbbbb;font-size:12px;text-decoration:none;">youtube.com/@8notice9</a>
    </p>
  </div>
</div>
</body>
</html>`;

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
          if (loc && new URL(loc).hostname.endsWith(".google.com")) {
            await fetch(loc, { method: "POST", headers: hdrs, body: payload });
          }
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
            reply_to: "notice@playnotice.com",
            to: [email],
            subject: "a fishy coincidence",
            html: WELCOME_EMAIL_HTML,
            text: "Have you noticed how profound being alive at the same time is? The universe is a fishy coincidence\nand a fish does not know it is wet!\n\nmade a game so you talk to your friends\nplaynotice.com\nyoutube.com/@8notice9",
            headers: {
              "X-Entity-Ref-ID": `welcome-${Date.now()}`,
            },
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
