export const config = { runtime: "edge" };

/**
 * Community prompt submission handler.
 *
 * Accepts { prompt, name } and stores to Google Sheets (same webhook as subscribe.ts).
 * Falls back to console logging if no webhook is configured.
 */

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt, name } = await request.json();

    // Validate prompt
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Prompt too short" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Cap length
    const cleanPrompt = prompt.trim().slice(0, 280);
    const cleanName = (name || "anonymous").trim().slice(0, 60);
    const timestamp = new Date().toISOString();

    // Store to Google Sheets via webhook
    const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK;
    if (sheetWebhook) {
      try {
        const params = new URLSearchParams({
          prompt: cleanPrompt,
          name: cleanName,
          source: "submit-page",
          timestamp,
        });
        await fetch(`${sheetWebhook}?${params.toString()}`, {
          method: "GET",
        });
      } catch (e) {
        console.error("[submit-prompt] Google Sheet webhook error:", e);
      }
    }

    // Also send via Resend if configured — notification to Nicky
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
            to: "shakaparks110@gmail.com",
            subject: `new prompt submission — ${cleanName}`,
            html: `
<div style="background:#0a0a0a;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:480px;margin:0 auto;">
    <p style="color:rgba(255,255,255,0.25);font-size:11px;letter-spacing:0.15em;margin-bottom:24px;">notice — prompt submission</p>
    <div style="border-left:2px solid #d4a056;padding-left:16px;margin-bottom:24px;">
      <p style="color:rgba(255,255,255,0.6);font-size:16px;font-weight:300;font-style:italic;line-height:1.6;margin:0;">
        "${cleanPrompt}"
      </p>
    </div>
    <p style="color:rgba(255,255,255,0.3);font-size:13px;font-weight:300;">
      submitted by: ${cleanName}<br/>
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

    // Fallback log
    if (!sheetWebhook && !resendKey) {
      console.log(`[submit-prompt] "${cleanPrompt}" — by ${cleanName} — NO STORAGE CONFIGURED`);
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
