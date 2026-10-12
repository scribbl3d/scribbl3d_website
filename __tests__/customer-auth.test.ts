/**
 * @jest-environment node
 */
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createRegistrationToken, verifyRegistrationToken } from '@/lib/auth/registrationToken';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data }) },
}));
jest.mock('@/lib/auth/prismaAdapter', () => ({ CustomPrismaAdapter: () => ({}) }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    account: { findFirst: jest.fn(), create: jest.fn() },
    onetimep: { findFirst: jest.fn(), updateMany: jest.fn(), deleteMany: jest.fn() },
  },
}));

process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { authOptions } = require('@/app/api/auth/[...nextauth]/options');
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { POST: registerPOST } = require('@/app/api/register/route');
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { POST: verifyPOST } = require('@/app/api/verify-otp/route');

const p = prisma as any;
const jsonReq = (body: unknown, ip = '203.0.113.9') =>
  ({ json: async () => body, headers: new Headers({ 'x-forwarded-for': ip }) }) as any;

beforeEach(() => {
  Object.values(p).forEach((m: any) => Object.values(m).forEach((fn: any) => fn.mockReset()));
});

describe('registration token', () => {
  it('is bound to the email (any case) and expires', () => {
    const now = Date.now();
    const token = createRegistrationToken('Me@Example.com', now);
    expect(verifyRegistrationToken(token, 'me@example.com', now)).toBe(true);
    expect(verifyRegistrationToken(token, 'victim@example.com', now)).toBe(false);
    expect(verifyRegistrationToken(token, 'me@example.com', now + 16 * 60 * 1000)).toBe(false);
    expect(verifyRegistrationToken(token.replace(/.$/, 'x'), 'me@example.com', now)).toBe(false);
    expect(verifyRegistrationToken(undefined, 'me@example.com', now)).toBe(false);
  });
});

describe('POST /api/register', () => {
  const form = { firstName: 'Asha', lastName: 'Rao', email: 'asha@example.com', password: 'Str0ng!pass' };

  it('refuses to create an account without OTP proof for that email', async () => {
    expect((await registerPOST(jsonReq(form))).status).toBe(403);
    const otherEmailToken = createRegistrationToken('attacker@example.com');
    expect((await registerPOST(jsonReq({ ...form, registrationToken: otherEmailToken }))).status).toBe(403);
    expect(p.user.create).not.toHaveBeenCalled();
  });

  it('creates a verified account with a valid token', async () => {
    p.user.findFirst.mockResolvedValue(null);
    p.user.create.mockResolvedValue({ id: 'u1', email: form.email, name: 'Asha Rao' });
    const res = await registerPOST(jsonReq({ ...form, registrationToken: createRegistrationToken(form.email) }));
    expect(res.status).toBe(201);
    expect(p.user.create).toHaveBeenCalledWith({ data: expect.objectContaining({ email: 'asha@example.com', emailVerified: expect.any(Date) }) });
  });
});

describe('POST /api/verify-otp', () => {
  it('counts attempts atomically and returns a registration token on success', async () => {
    const otpHash = await bcryptjs.hash('123456', 4);
    p.onetimep.findFirst.mockResolvedValue({ id: 'otp1', otp: otpHash, attempts: 0 });
    p.onetimep.updateMany.mockResolvedValue({ count: 1 });
    const res = await verifyPOST(jsonReq({ email: 'New@Example.com', otp: '123456' }));
    const body = await res.json();
    expect(p.onetimep.updateMany).toHaveBeenCalledWith({ where: { id: 'otp1', attempts: { lt: 3 } }, data: { attempts: { increment: 1 } } });
    expect(verifyRegistrationToken(body.registrationToken, 'new@example.com')).toBe(true);
  });

  it('stops once the attempt limit is used up', async () => {
    p.onetimep.findFirst.mockResolvedValue({ id: 'otp1', otp: 'x', attempts: 3 });
    p.onetimep.updateMany.mockResolvedValue({ count: 0 });
    const res = await verifyPOST(jsonReq({ email: 'limit@example.com', otp: '123456' }, '203.0.113.10'));
    expect(res.status).toBe(400);
    expect((await res.json()).registrationToken).toBeUndefined();
  });
});

describe('credentials sign-in', () => {
  const provider = authOptions.providers.find((x: any) => x.id === 'credentials');
  const authorize = (email: string, password: string, ip = '198.51.100.20') =>
    (provider.options?.authorize ?? provider.authorize)({ email, password }, { headers: { 'x-forwarded-for': ip } });

  it('uses one generic error for unknown, Google-only and wrong-password accounts', async () => {
    p.user.findFirst.mockResolvedValueOnce(null);
    await expect(authorize('nobody@example.com', 'whatever1')).rejects.toThrow('INVALID_CREDENTIALS');
    p.user.findFirst.mockResolvedValueOnce({ id: 'g', email: 'g@example.com', password: 'google_abc' });
    await expect(authorize('g@example.com', 'whatever1')).rejects.toThrow('INVALID_CREDENTIALS');
    p.user.findFirst.mockResolvedValueOnce({ id: 'u', email: 'u@example.com', password: await bcryptjs.hash('right-pass', 4) });
    await expect(authorize('u@example.com', 'wrong-pass')).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('locks an account+client after repeated failures', async () => {
    p.user.findFirst.mockResolvedValue(null);
    for (let i = 0; i < 5; i++) {
      await expect(authorize('target@example.com', 'guess-123', '198.51.100.30')).rejects.toThrow('INVALID_CREDENTIALS');
    }
    await expect(authorize('target@example.com', 'guess-123', '198.51.100.30')).rejects.toThrow(/TOO_MANY_ATTEMPTS/);
  });

  it('signs in with the right password', async () => {
    p.user.findFirst.mockResolvedValue({ id: 'u', email: 'ok@example.com', name: 'Ok', password: await bcryptjs.hash('right-pass', 4) });
    await expect(authorize('ok@example.com', 'right-pass', '198.51.100.40')).resolves.toEqual({ id: 'u', email: 'ok@example.com', name: 'Ok' });
  });
});

describe('session callback', () => {
  it('takes the user ID from the token, not an email lookup', async () => {
    p.user.findUnique.mockResolvedValue({ name: 'New Name', email: 'new@example.com', image: null });
    const session = await authOptions.callbacks.session({ session: { user: { email: 'old@example.com' } }, token: { id: 'u1' } });
    expect(session.user.id).toBe('u1');
    expect(p.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'u1' } }));
  });
});

describe('Google sign-in linking', () => {
  const account = { provider: 'google', type: 'oauth', providerAccountId: 'g-1' };

  it('revokes a password that was never email-verified when the real owner links Google', async () => {
    p.account.findFirst.mockResolvedValue(null);
    p.user.findFirst.mockResolvedValue({ id: 'squatter', emailVerified: null });
    const user: any = { email: 'victim@gmail.com' };
    expect(await authOptions.callbacks.signIn({ user, account, profile: { email_verified: true } })).toBe(true);
    expect(p.user.update).toHaveBeenCalledWith({
      where: { id: 'squatter' },
      data: { emailVerified: expect.any(Date), password: expect.stringMatching(/^google_/) },
    });
  });

  it('keeps the password of a verified account', async () => {
    p.account.findFirst.mockResolvedValue(null);
    p.user.findFirst.mockResolvedValue({ id: 'owner', emailVerified: new Date() });
    expect(await authOptions.callbacks.signIn({ user: { email: 'me@gmail.com' }, account, profile: { email_verified: true } })).toBe(true);
    expect(p.user.update).not.toHaveBeenCalled();
  });

  it('rejects Google profiles without a verified email', async () => {
    expect(await authOptions.callbacks.signIn({ user: { email: 'x@example.com' }, account, profile: { email_verified: false } })).toBe(false);
    expect(p.account.create).not.toHaveBeenCalled();
  });
});
