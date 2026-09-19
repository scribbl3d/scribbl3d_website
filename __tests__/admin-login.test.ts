import { POST } from '@/app/api/admin/login/route';
import { authenticateAdmin } from '@/lib/auth';
import { createAdminSession, isSameOrigin } from '@/lib/admin-session';
import { checkLoginAttempts, recordFailedLogin, resetLoginAttempts } from '@/lib/login-rate-limit';

jest.mock('next/server', () => ({ NextResponse: { json: (data: unknown, options: { status?: number; headers?: Record<string, string> } = {}) => ({ status: options.status || 200, headers: options.headers, json: async () => data }) } }));
jest.mock('@/lib/auth', () => ({ authenticateAdmin: jest.fn() }));
jest.mock('@/lib/admin-session', () => ({ createAdminSession: jest.fn(), isSameOrigin: jest.fn() }));
jest.mock('@/lib/login-rate-limit', () => ({ checkLoginAttempts: jest.fn(), recordFailedLogin: jest.fn(), resetLoginAttempts: jest.fn() }));

const body = { email: 'admin@example.test', password: 'test-only-password' };
const request = (data: unknown = body) => ({ json: jest.fn().mockResolvedValue(data) }) as unknown as Request;

beforeEach(() => {
  jest.mocked(isSameOrigin).mockReturnValue(true);
  jest.mocked(checkLoginAttempts).mockReturnValue({ allowed: true });
  jest.mocked(authenticateAdmin).mockResolvedValue({ email: body.email, role: 'admin' });
  jest.mocked(createAdminSession).mockReset().mockResolvedValue('test-signed-session');
});

describe('Admin login', () => {
  it('issues a signed, HTTP-only session cookie rather than unsigned account JSON', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(createAdminSession).toHaveBeenCalledWith(body.email);
    expect(response.headers).toEqual(expect.objectContaining({
      'Set-Cookie': expect.stringContaining('admin_token=test-signed-session'),
      'Cache-Control': 'no-store',
    }));
    const headers = response.headers as unknown as Record<string, string>;
    expect(headers['Set-Cookie']).toContain('HttpOnly');
    expect(headers['Set-Cookie']).toContain('SameSite=Strict');
    expect(headers['Set-Cookie']).toContain('Max-Age=3600');
    expect(resetLoginAttempts).toHaveBeenCalledWith('admin:admin@example.test');
  });

  it('rejects cross-origin login before checking credentials', async () => {
    jest.mocked(isSameOrigin).mockReturnValue(false);
    expect((await POST(request())).status).toBe(403);
    expect(authenticateAdmin).not.toHaveBeenCalled();
  });

  it.each([null, {}, { email: 'invalid', password: 'x' }, { ...body, password: '' }])('rejects malformed credentials %#', async (data) => {
    expect((await POST(request(data))).status).toBe(400);
    expect(createAdminSession).not.toHaveBeenCalled();
  });

  it('rejects bad credentials and records the failed attempt', async () => {
    jest.mocked(authenticateAdmin).mockResolvedValue(null);
    expect((await POST(request())).status).toBe(401);
    expect(recordFailedLogin).toHaveBeenCalledWith('admin:admin@example.test');
    expect(createAdminSession).not.toHaveBeenCalled();
  });

  it('enforces the login attempt limit before authenticating', async () => {
    jest.mocked(checkLoginAttempts).mockReturnValue({ allowed: false });
    expect((await POST(request())).status).toBe(429);
    expect(authenticateAdmin).not.toHaveBeenCalled();
  });

  it('does not issue a cookie when session signing is unavailable', async () => {
    jest.mocked(createAdminSession).mockRejectedValue(new Error('Missing signing key'));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.headers).toBeUndefined();
  });
});
