import { rateLimit, getClientIp } from "./_lib/rate-limit.js";

export const config = { runtime: "edge" };

/**
 * Community prompt submission handler.
 *
 * Accepts { prompt, name } and stores to Google Sheets (same webhook as subscribe.ts).
 * Falls back to console logging if no webhook is configured.
 *
 * Env vars:
 *   GOOGLE_SHEET_WEBHOOK — Google Apps Script URL
 *   GOOGLE_SHEET_SECRET — shared secret for webhook authentication
 *   RESEND_API_KEY — for notification emails
 *   NOTIFICATION_EMAIL — where submissions are sent (defaults to no notification)
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limited = rateLimit(`submit-prompt:${getClientIp(request)}`, 3, 60_000);
  if (limited) return limited;

  try {
    const { prompt, name } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Prompt too short" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cleanPrompt = prompt.trim().slice(0, 280);
    const cleanName = (name || "anonymous").trim().slice(0, 60);
    const timestamp = new Date().toISOString();

    // Store to Google Sheets via webhook (POST with shared secret auth)
    // Uses redirect: "manual" because Apps Script returns 302 which converts POST to GET
    const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK;
    if (sheetWebhook) {
      try {
        const payload = JSON.stringify({
          _secret: process.env.GOOGLE_SHEET_SECRET || "",
          prompt: cleanPrompt,
          name: cleanName,
          source: "submit-page",
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
        console.error("[submit-prompt] Google Sheet webhook error:", e);
      }
    }

    // Send notification email if configured
    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFICATION_EMAIL;
    if (resendKey && notifyEmail) {
      try {
        const safePrompt = escapeHtml(cleanPrompt);
        const safeName = escapeHtml(cleanName);

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "notice <noreply@playnotice.com>",
            to: notifyEmail,
            subject: `new prompt submission`,
            html: `
<div style="background:#0a0a0a;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:480px;margin:0 auto;">
    <p style="color:rgba(255,255,255,0.25);font-size:11px;letter-spacing:0.15em;margin-bottom:24px;">notice — prompt submission</p>
    <div style="border-left:2px solid #d4a056;padding-left:16px;margin-bottom:24px;">
      <p style="color:rgba(255,255,255,0.6);font-size:16px;font-weight:300;font-style:italic;line-height:1.6;margin:0;">
        "${safePrompt}"
      </p>
    </div>
    <p style="color:rgba(255,255,255,0.3);font-size:13px;font-weight:300;">
      submitted by: ${safeName}<br/>
      ${timestamp}
    </p>
  </div>
</div>`,
          }),
        });
      } catch (e) {
        console.error("[submit-prompt] Resend notification error:", e);
      }
    }

    if (!sheetWebhook && !resendKey) {
      console.log("[submit-prompt] No storage configured");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[submit-prompt] Error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
