interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const store: RateLimitStore = {};

/**
 * In-memory rate limiter (for development/small scale)
 * For production, use Redis-based rate limiting with @upstash/ratelimit
 * 
 * @param identifier - Unique identifier (IP, user ID, email)
 * @param limit - Maximum requests allowed in window
 * @param windowMs - Time window in milliseconds
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < windowStart) {
        delete store[key];
      }
    });
  }

  // Initialize or reset if window expired
  if (!store[identifier] || store[identifier].resetTime < windowStart) {
    store[identifier] = { count: 1, resetTime: now + windowMs };
    return { 
      success: true, 
      limit, 
      remaining: limit - 1, 
      reset: store[identifier].resetTime 
    };
  }

  // Check if limit exceeded
  if (store[identifier].count >= limit) {
    return { 
      success: false, 
      limit, 
      remaining: 0, 
      reset: store[identifier].resetTime 
    };
  }

  // Increment count
  store[identifier].count++;
  return { 
    success: true, 
    limit, 
    remaining: limit - store[identifier].count, 
    reset: store[identifier].resetTime 
  };
}

/**
 * Get rate limit headers for API responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
}

/**
 * Create rate-limited Response with proper headers
 */
export function createRateLimitResponse(result: RateLimitResult, message: string = 'Too many requests'): Response {
  return new Response(
    JSON.stringify({ 
      error: message,
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
    }), 
    { 
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(result),
        'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
      }
    }
  );
}

// Preset rate limit configurations
export const RateLimits = {
  // Authentication endpoints - strict
  AUTH: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  
  // Contact/Support forms - moderate
  CONTACT: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  
  // File uploads - strict
  UPLOAD: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
  
  // Custom quotes - moderate
  QUOTE: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 quotes per hour
  
  // Coupon validation - prevent brute force
  COUPON: { limit: 10, windowMs: 60 * 1000 }, // 10 attempts per minute
  
  // Newsletter signup - moderate
  NEWSLETTER: { limit: 2, windowMs: 60 * 60 * 1000 }, // 2 signups per hour
  
  // Stock notifications - moderate
  STOCK_NOTIFY: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  
  // API general - lenient
  API_GENERAL: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
};
