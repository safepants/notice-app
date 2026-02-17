export const config = { runtime: "edge" };

/**
 * Stripe webhook handler for post-purchase emails.
 *
 * Listens for `checkout.session.completed` events and sends:
 *   Email 1: Immediately — "here's how to play tonight"
 *   Email 2: Scheduled 7 days later — "send notice to someone"
 *
 * Required env vars:
 *   RESEND_API_KEY — from resend.com (free tier: 3,000 emails/month)
 *   STRIPE_WEBHOOK_SECRET — from Stripe Dashboard > Webhooks (optional but recommended)
 */

// ─── Email HTML Templates ────────────────────────────────────────────────────

const EMAIL_1_SUBJECT = "here's how to play tonight";

const EMAIL_1_HTML = `
<div style="background:#0a0a0a;padding:48px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:480px;margin:0 auto;">
    <p style="color:rgba(255,255,255,0.25);font-size:11px;letter-spacing:0.15em;margin-bottom:32px;">notice</p>

    <p style="color:#e0e0e0;font-size:18px;font-weight:300;line-height:1.6;margin-bottom:24px;">
      you got it. here's how to make tonight great.
    </p>

    <div style="border-left:2px solid #d4a056;padding-left:16px;margin-bottom:32px;">
      <p style="color:rgba(255,255,255,0.5);font-size:14px;font-weight:300;line-height:1.8;margin:0;">
        put your phone in the middle of the group.<br/>
        open <a href="https://playnotice.com" style="color:#d4a056;text-decoration:none;">playnotice.com</a>.<br/>
        tap to start. everyone takes turns reading out loud.
      </p>
    </div>

    <p style="color:rgba(255,255,255,0.4);font-size:14px;font-weight:300;margin-bottom:16px;">
      three good ones to start with:
    </p>

    <div style="margin-bottom:32px;">
      <p style="color:rgba(255,255,255,0.5);font-size:15px;font-weight:300;font-style:italic;line-height:1.7;margin-bottom:12px;">
        "Do you consider yourself a good influence or a bad influence?"
      </p>
      <p style="color:rgba(255,255,255,0.5);font-size:15px;font-weight:300;font-style:italic;line-height:1.7;margin-bottom:12px;">
        "Name something beautiful that's within eyesight right now"
      </p>
      <p style="color:rgba(255,255,255,0.5);font-size:15px;font-weight:300;font-style:italic;line-height:1.7;margin-bottom:12px;">
        "What was your childhood nickname?"
      </p>
    </div>

    <p style="color:#d4a056;font-size:14px;font-weight:300;margin-bottom:32px;">
      tip: start light. let it build.
    </p>

    <p style="color:rgba(255,255,255,0.3);font-size:13px;font-weight:300;margin-bottom:8px;">
      <a href="https://playnotice.com?success=true" style="color:#d4a056;text-decoration:none;">tap here to play →</a>
    </p>
    <p style="color:rgba(255,255,255,0.15);font-size:11px;font-weight:300;margin-bottom:32px;">
      bookmark this link — it's your permanent access.
    </p>

    <p style="color:rgba(255,255,255,0.2);font-size:12px;font-weight:300;">
      — notice, by <a href="https://www.tiktok.com/@8notice9" style="color:rgba(255,255,255,0.3);text-decoration:none;">8notice9</a>
    </p>
  </div>
</div>
`;

const EMAIL_2_SUBJECT = "one more thing";

const EMAIL_2_HTML = `
<div style="background:#0a0a0a;padding:48px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
  <div style="max-width:480px;margin:0 auto;">
    <p style="color:rgba(255,255,255,0.25);font-size:11px;letter-spacing:0.15em;margin-bottom:32px;">notice</p>

    <p style="color:#e0e0e0;font-size:18px;font-weight:300;line-height:1.6;margin-bottom:24px;">
      if someone came to mind while you were playing, this is the sign.
    </p>

    <p style="color:rgba(255,255,255,0.45);font-size:15px;font-weight:300;line-height:1.7;margin-bottom:24px;">
      it's $1. send it to them.
    </p>

    <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin-bottom:32px;">
      <p style="color:rgba(255,255,255,0.35);font-size:12px;font-weight:300;margin-bottom:8px;">copy and send:</p>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;font-weight:300;line-height:1.6;margin:0;">
        "this game is $1. thought of you. playnotice.com"
      </p>
    </div>

    <p style="color:rgba(255,255,255,0.15);font-size:12px;font-weight:300;margin-bottom:4px;">
      that's it. no more emails from us. ever.
    </p>

    <p style="color:rgba(255,255,255,0.2);font-size:12px;font-weight:300;margin-top:32px;">
      — notice, by <a href="https://www.tiktok.com/@8notice9" style="color:rgba(255,255,255,0.3);text-decoration:none;">8notice9</a>
    </p>
  </div>
</div>
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sendEmail(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
  scheduledAt?: string
) {
  const body: Record<string, unknown> = {
    from: "Notice <notice@playnotice.com>",
    to: [to],
    subject,
    html,
  };
  if (scheduledAt) {
    body.scheduledAt = scheduledAt;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.text();
    console.error(`Resend error (${res.status}):`, data);
    return false;
  }
  return true;
}

async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = signature.split(",").reduce(
      (acc, part) => {
        const [key, value] = part.split("=");
        if (key === "t") acc.timestamp = value;
        if (key === "v1") acc.signatures.push(value);
        return acc;
      },
      { timestamp: "", signatures: [] as string[] }
    );

    const signedPayload = `${parts.timestamp}.${payload}`;
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
      new TextEncoder().encode(signedPayload)
    );
    const expected = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return parts.signatures.includes(expected);
  } catch (e) {
    console.error("Signature verification error:", e);
    return false;
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("RESEND_API_KEY not configured");
    return new Response("Server configuration error", { status: 500 });
  }

  const body = await request.text();

  // Verify Stripe signature if secret is configured
  const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (stripeSecret && signature) {
    const valid = await verifyStripeSignature(body, signature, stripeSecret);
    if (!valid) {
      console.error("Invalid Stripe signature");
      return new Response("Invalid signature", { status: 400 });
    }
  }

  try {
    const event = JSON.parse(body);

    // Only handle successful checkout completions
    if (event.type !== "checkout.session.completed") {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = event.data?.object;
    const customerEmail = session?.customer_details?.email || session?.customer_email;

    if (!customerEmail) {
      console.error("No customer email in checkout session");
      return new Response(JSON.stringify({ received: true, error: "no email" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[stripe-webhook] Purchase from: ${customerEmail}`);

    // Send Email 1 immediately
    const email1Sent = await sendEmail(resendKey, customerEmail, EMAIL_1_SUBJECT, EMAIL_1_HTML);
    console.log(`[stripe-webhook] Email 1 ${email1Sent ? "sent" : "FAILED"}: ${customerEmail}`);

    // Schedule Email 2 for 7 days later
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const email2Sent = await sendEmail(
      resendKey,
      customerEmail,
      EMAIL_2_SUBJECT,
      EMAIL_2_HTML,
      sevenDaysLater
    );
    console.log(
      `[stripe-webhook] Email 2 ${email2Sent ? "scheduled" : "FAILED"} for ${sevenDaysLater}: ${customerEmail}`
    );

    return new Response(
      JSON.stringify({ received: true, email1: email1Sent, email2: email2Sent }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return new Response(JSON.stringify({ error: "Processing error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
