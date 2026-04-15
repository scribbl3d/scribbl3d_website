interface LoginAttempt {
  count: number;
  resetTime: number;
  lastAttempt: number;
}

const loginAttempts: Map<string, LoginAttempt> = new Map();

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function checkLoginAttempts(email: string): {
  allowed: boolean;
  remainingAttempts?: number;
  lockoutTimeRemaining?: number;
} {
  const now = Date.now();
  const attempt = loginAttempts.get(email);

  if (!attempt) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if lockout period has expired
  if (attempt.count >= MAX_ATTEMPTS) {
    const lockoutRemaining = attempt.resetTime - now;
    if (lockoutRemaining > 0) {
      return {
        allowed: false,
        lockoutTimeRemaining: Math.ceil(lockoutRemaining / 1000 / 60), // minutes
      };
    } else {
      // Reset after lockout
      loginAttempts.delete(email);
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }
  }

  // Check if attempt window has expired
  if (now - attempt.lastAttempt > ATTEMPT_WINDOW_MS) {
    loginAttempts.delete(email);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - attempt.count,
  };
}

export function recordFailedLogin(email: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(email);

  if (!attempt) {
    loginAttempts.set(email, {
      count: 1,
      resetTime: now + LOCK_DURATION_MS,
      lastAttempt: now,
    });
  } else {
    attempt.count += 1;
    attempt.lastAttempt = now;
    if (attempt.count >= MAX_ATTEMPTS) {
      attempt.resetTime = now + LOCK_DURATION_MS;
    }
    loginAttempts.set(email, attempt);
  }
}

export function resetLoginAttempts(email: string): void {
  loginAttempts.delete(email);
}
