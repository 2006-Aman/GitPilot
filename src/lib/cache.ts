type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const cacheMap = new Map<string, CacheEntry<any>>();

export function getCachedData<T>(key: string): T | null {
  const entry = cacheMap.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cacheMap.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCachedData<T>(key: string, data: T, ttlMs: number = 300000): void {
  cacheMap.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
}

export function clearUserCache(userId: string): void {
  for (const key of cacheMap.keys()) {
    if (key.startsWith(userId)) {
      cacheMap.delete(key);
    }
  }
}
