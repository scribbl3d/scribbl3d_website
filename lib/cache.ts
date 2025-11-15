class Cache<K, V> {
  private cache: Map<K, { value: V; expiry: number }>;

  constructor() {
    this.cache = new Map();
  }

  set(key: K, value: V, ttlSeconds: number): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiry });
    console.log(`Cache set: ${String(key)}`, value);
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (item && item.expiry > Date.now()) {
      console.log(`Cache get: ${String(key)}`, item.value);
      return item.value;
    }
    if (item) {
      console.log(`Cache item expired: ${String(key)}`);
      this.cache.delete(key);
    }
    return undefined;
  }

  delete(key: K): void {
    this.cache.delete(key);
    console.log(`Cache delete: ${String(key)}`);
  }
}

export const otpCache = new Cache<string, { otp: string; attempts: number }>();
