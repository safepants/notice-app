export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { email, source } = await request.json();

    // Validate email format
    if (!email || typeof email !== "string" || !email.includes("@") || !email.includes(".")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const timestamp = new Date().toISOString();

    // Option 1: Google Sheets webhook (recommended — simple, visible, exportable)
    // Uses GET with query params to avoid Google Apps Script 302 redirect issues
    const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK;
    if (sheetWebhook) {
      try {
        const params = new URLSearchParams({
          email,
          source: source || "website",
          timestamp,
        });
        await fetch(`${sheetWebhook}?${params.toString()}`, {
          method: "GET",
        });
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
            tags: [source || "website"],
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
      console.log(`[subscribe] ${email} (source: ${source || "unknown"}) — NO STORAGE CONFIGURED`);
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
