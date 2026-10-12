interface LoginAttempt {
  count: number;
  lockouts: number;
  lockedUntil: number;
  lastAttempt: number;
}

// In-memory per server instance; use a shared store (e.g. Redis) to make
// limits hold across instances.
const loginAttempts: Map<string, LoginAttempt> = new Map();

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 5 * 60 * 1000; // failures older than this are forgotten
const BASE_LOCK_MS = 5 * 60 * 1000; // first lock: 5 minutes, then doubling
const MAX_LOCK_MS = 60 * 60 * 1000; // never more than an hour
const FORGET_AFTER_MS = 24 * 60 * 60 * 1000; // backoff history resets after a quiet day

/**
 * Keys should combine the account and the client (e.g. `admin:<email>:<ip>`)
 * so one person cannot lock everyone else out of an account.
 */
export function checkLoginAttempts(key: string): {
  allowed: boolean;
  remainingAttempts?: number;
  lockoutTimeRemaining?: number;
} {
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  if (attempt.lockedUntil > now) {
    return {
      allowed: false,
      lockoutTimeRemaining: Math.ceil((attempt.lockedUntil - now) / 1000 / 60), // minutes
    };
  }

  if (now - attempt.lastAttempt > FORGET_AFTER_MS) {
    loginAttempts.delete(key);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  if (now - attempt.lastAttempt > ATTEMPT_WINDOW_MS) {
    attempt.count = 0;
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - attempt.count,
  };
}

export function recordFailedLogin(key: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(key) ?? { count: 0, lockouts: 0, lockedUntil: 0, lastAttempt: now };

  if (now - attempt.lastAttempt > ATTEMPT_WINDOW_MS) attempt.count = 0;
  attempt.count += 1;
  attempt.lastAttempt = now;

  if (attempt.count >= MAX_ATTEMPTS) {
    // Exponential backoff instead of a fixed long lockout
    attempt.lockedUntil = now + Math.min(BASE_LOCK_MS * 2 ** attempt.lockouts, MAX_LOCK_MS);
    attempt.lockouts += 1;
    attempt.count = 0;
  }

  loginAttempts.set(key, attempt);
}

export function resetLoginAttempts(key: string): void {
  loginAttempts.delete(key);
}
