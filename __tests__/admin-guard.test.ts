/**
 * @jest-environment node
 */
import { cookies, headers } from 'next/headers';
import { requireAdmin } from '@/lib/admin-guard';
import { verifyAdminSession } from '@/lib/admin-session';

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('@/lib/admin-session', () => ({
  ...jest.requireActual('@/lib/admin-session'),
  verifyAdminSession: jest.fn(),
}));

const setRequest = (token: string | undefined, origin?: string) => {
  jest.mocked(cookies).mockResolvedValue({ get: () => (token ? { value: token } : undefined) } as any);
  jest.mocked(headers).mockResolvedValue(new Headers({ host: 'www.scribbl3d.com', ...(origin ? { origin } : {}) }) as any);
};

beforeEach(() => {
  jest.mocked(verifyAdminSession).mockReset().mockImplementation(async (token) => (token === 'signed' ? { email: 'a@b.c', role: 'admin' } : null));
});

it('allows a verified same-origin admin session', async () => {
  setRequest('signed', 'https://www.scribbl3d.com');
  expect(await requireAdmin()).toBeNull();
});

it.each([
  ['no cookie', undefined, undefined],
  ['invalid token', 'forged', 'https://www.scribbl3d.com'],
  ['cross-origin request', 'signed', 'https://evil.example'],
])('rejects %s with 401', async (_label, token, origin) => {
  setRequest(token, origin);
  const res = await requireAdmin();
  expect(res?.status).toBe(401);
});
