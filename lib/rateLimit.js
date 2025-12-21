const buckets = new Map();

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
