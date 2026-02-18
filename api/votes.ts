import { Redis } from "@upstash/redis";
import { rateLimit, getClientIp } from "./_lib/rate-limit.js";

export const config = { runtime: "edge" };

/**
 * Fetches aggregate vote counts for all prompts.
 *
 * Returns: { [hash]: { up: number, down: number } }
 *
 * Required env vars:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limited = rateLimit(`votes:${getClientIp(request)}`, 10, 60_000);
  if (limited) return limited;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const redis = new Redis({ url: redisUrl, token: redisToken });

    // SCAN for all vote keys
    const allVotes: Record<string, { up: number; down: number }> = {};
    let cursor = 0;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: "votes:*",
        count: 200,
      });
      cursor = typeof nextCursor === "number" ? nextCursor : parseInt(nextCursor as string, 10);

      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        for (const key of keys) {
          pipeline.hgetall(key);
        }
        const results = await pipeline.exec();

        for (let i = 0; i < keys.length; i++) {
          const hash = (keys[i] as string).replace("votes:", "");
          const data = results[i] as Record<string, string> | null;
          if (data) {
            allVotes[hash] = {
              up: parseInt(data.up as string, 10) || 0,
              down: parseInt(data.down as string, 10) || 0,
            };
          }
        }
      }
    } while (cursor !== 0);

    return new Response(JSON.stringify(allVotes), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("Failed to fetch votes:", err);
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
