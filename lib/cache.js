const store = new Map();

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  const { value, expiresAt } = entry;
  if (expiresAt && Date.now() > expiresAt) {
    store.delete(key);
    return undefined;
  }
  return value;
}

export function cacheSet(key, value, ttlMs) {
  const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
  store.set(key, { value, expiresAt });
}

export function cacheDel(key) {
  store.delete(key);
}
