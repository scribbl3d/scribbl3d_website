import { checkLoginAttempts, recordFailedLogin, resetLoginAttempts } from '@/lib/login-rate-limit';

describe('login rate limit (backoff)', () => {
  const key = 'admin:a@example.test:203.0.113.7';

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-12T10:00:00Z'));
    resetLoginAttempts(key);
  });
  afterEach(() => jest.useRealTimers());

  const fail = (times: number) => { for (let i = 0; i < times; i++) recordFailedLogin(key); };

  it('locks after 5 failures for 5 minutes, then doubles', () => {
    fail(4);
    expect(checkLoginAttempts(key).allowed).toBe(true);
    fail(1);
    expect(checkLoginAttempts(key)).toEqual({ allowed: false, lockoutTimeRemaining: 5 });

    jest.advanceTimersByTime(5 * 60 * 1000 + 1);
    expect(checkLoginAttempts(key).allowed).toBe(true);
    fail(5);
    expect(checkLoginAttempts(key)).toEqual({ allowed: false, lockoutTimeRemaining: 10 });
  });

  it('caps the lock at an hour', () => {
    for (let round = 0; round < 6; round++) {
      fail(5);
      jest.advanceTimersByTime(61 * 60 * 1000);
    }
    fail(5);
    expect(checkLoginAttempts(key).lockoutTimeRemaining).toBe(60);
  });

  it('keeps other clients unaffected', () => {
    fail(5);
    expect(checkLoginAttempts('admin:a@example.test:198.51.100.1').allowed).toBe(true);
  });

  it('clears on successful login', () => {
    fail(5);
    resetLoginAttempts(key);
    expect(checkLoginAttempts(key).allowed).toBe(true);
  });
});
