import { Redis } from "@upstash/redis";
import { rateLimit, getClientIp } from "./_lib/rate-limit.js";
import { promptHash } from "./_lib/prompt-hash.js";

export const config = { runtime: "edge" };

/**
 * Casts a vote (up/down) on a prompt and optionally submits feedback.
 *
 * Body: { prompt: string, direction: "up" | "down", feedback?: string }
 *
 * Required env vars:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *   GOOGLE_SHEET_WEBHOOK (optional — logs votes for analytics)
 *   GOOGLE_SHEET_SECRET (optional — authenticates webhook)
 */

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limited = rateLimit(`vote:${getClientIp(request)}`, 60, 60_000);
  if (limited) return limited;

  try {
    const { prompt, direction, feedback } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid prompt" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (direction !== "up" && direction !== "down") {
      return new Response(JSON.stringify({ error: "Invalid direction" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hash = promptHash(prompt);
    const field = direction === "up" ? "up" : "down";
    let newCount: number | null = null;

    // Write to Redis if configured
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (redisUrl && redisToken) {
      try {
        const redis = new Redis({ url: redisUrl, token: redisToken });
        newCount = await redis.hincrby(`votes:${hash}`, field, 1);
      } catch (e) {
        console.error("Redis vote error:", e);
      }
    }

    // Fire-and-forget to Google Sheets for analytics
    const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK;
    if (sheetWebhook) {
      const payload = JSON.stringify({
        _secret: process.env.GOOGLE_SHEET_SECRET || "",
        vote_direction: direction,
        prompt_hash: hash,
        prompt_preview: prompt.slice(0, 80),
        feedback: feedback ? String(feedback).slice(0, 280) : "",
        source: "vote",
        timestamp: new Date().toISOString(),
      });
      const hdrs = { "Content-Type": "application/json" };
      try {
        const res = await fetch(sheetWebhook, {
          method: "POST",
          headers: hdrs,
          body: payload,
          redirect: "manual",
        });
        if (res.status === 302 || res.status === 301) {
          const loc = res.headers.get("location");
          if (loc)
            await fetch(loc, { method: "POST", headers: hdrs, body: payload });
        }
      } catch {
        // Non-critical
      }
    }

    const result: Record<string, unknown> = { hash, ok: true };
    if (newCount !== null) result[field] = newCount;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
