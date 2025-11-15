interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export async function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000
) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!store[identifier] || store[identifier].resetTime < windowStart) {
    store[identifier] = { count: 1, resetTime: now };
    return { success: true };
  }

  if (store[identifier].count >= limit) {
    return { success: false };
  }

  store[identifier].count++;
  return { success: true };
}
