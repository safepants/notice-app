/**
 * Deterministic hash for prompt text -> short stable key.
 * Used to key vote counts in Redis without storing full prompt text.
 */
export function promptHash(text: string): string {
  let hash = 0;
  const normalized = text.trim().toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return "p" + Math.abs(hash).toString(36);
}
