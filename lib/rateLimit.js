const buckets = new Map();

// Rate limit configurations for different features
export const RATE_LIMITS = {
  jobMatch: { limit: 5, windowMs: 60_000 }, // 5 analyses per minute
  skillGap: { limit: 10, windowMs: 60_000 }, // 10 analyses per minute
  chat: { limit: 10, windowMs: 60_000 }, // 10 messages per minute
  chatDaily: { limit: 100, windowMs: 86_400_000 }, // 100 messages per day
  default: { limit: 5, windowMs: 60_000 }, // Default: 5 per minute
};

export function rateLimit(userId, key, { limit = 5, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const id = `${userId}:${key}`;
  const bucket = buckets.get(id) || [];
  // prune
  const recent = bucket.filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    return { allowed: false, remainingMs: windowMs - (now - recent[0]) };
  }
  recent.push(now);
  buckets.set(id, recent);
  return { allowed: true };
}
