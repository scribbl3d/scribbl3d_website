/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import { verifyAdminSession } from '@/lib/admin-session';
import { canCustomerCancelOrder, pickDisplayShipment } from '@/lib/orders/cancellation';
import { internalRequestHeaders, isInternalRequest } from '@/lib/internal-auth';

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn().mockResolvedValue(null) }));
jest.mock('@/lib/admin-session', () => ({
  ...jest.requireActual('@/lib/admin-session'),
  verifyAdminSession: jest.fn(),
}));

const BASE = 'http://localhost:3000';
const req = (path: string, init: { method?: string; origin?: string; cookie?: boolean } = {}) =>
  new NextRequest(`${BASE}${path}`, {
    method: init.method || 'GET',
    headers: {
      host: 'localhost:3000',
      ...(init.origin ? { origin: init.origin } : {}),
      ...(init.cookie ? { cookie: 'admin_token=signed' } : {}),
    },
  });

beforeEach(() => {
  jest.mocked(verifyAdminSession).mockReset().mockResolvedValue(null);
});

describe('admin API middleware gate', () => {
  const adminOnly = [
    '/api/admin/orders',
    '/api/admin/printers/abc',
    '/api/admin/blogs',
    '/api/admin/landingPage/hero-banners/1',
    '/api/admin/orders/abc/send-email',
    '/api/internal/create-shipment',
    '/api/internal/sync-shipments',
    '/api/internal/sync-refunds',
    '/api/internal/generate-label',
    '/api/internal/request-pickup',
    '/api/internal/pickup-status',
  ];

  it.each(adminOnly)('rejects %s without an admin session', async (path) => {
    const res = await middleware(req(path, { method: 'POST' }));
    expect(res.status).toBe(401);
  });

  it('allows admin-only routes with a verified admin session from the same origin', async () => {
    jest.mocked(verifyAdminSession).mockResolvedValue({ email: 'ops@example.com', role: 'admin' });
    const res = await middleware(req('/api/admin/orders', { cookie: true, origin: BASE }));
    expect(res.status).not.toBe(401);
  });

  it('rejects a valid admin session sent from another origin', async () => {
    jest.mocked(verifyAdminSession).mockResolvedValue({ email: 'ops@example.com', role: 'admin' });
    const res = await middleware(req('/api/admin/orders', { method: 'POST', cookie: true, origin: 'https://evil.example' }));
    expect(res.status).toBe(401);
  });

  it.each([
    '/api/admin/login',
    '/api/admin/logout',
    '/api/admin/orders/abc/cancel',
    '/api/internal/cancel-shipment',
    '/api/internal/calculate-shipping',
    '/api/internal/sync-shipment',
  ])('leaves self-checked route %s to its own handler', async (path) => {
    const res = await middleware(req(path, { method: 'POST' }));
    expect(res.status).not.toBe(401);
  });

  it('does not gate non-admin APIs', async () => {
    const res = await middleware(req('/api/announcements'));
    expect(res.status).not.toBe(401);
  });
});

describe('management routes outside /api/admin', () => {
  it.each([
    ['POST', '/api/discounts'],
    ['GET', '/api/discounts?admin=true'],
    ['GET', '/api/discounts/abc'],
    ['PUT', '/api/discounts/abc'],
    ['DELETE', '/api/discounts/abc'],
    ['POST', '/api/about-hero'],
    ['POST', '/api/partners'],
    ['DELETE', '/api/partners/abc'],
    ['POST', '/api/available-colors'],
    ['DELETE', '/api/available-colors'],
    ['GET', '/api/form-responses'],
    ['GET', '/api/personalise-form'],
    ['GET', '/api/prototyping-request'],
    ['DELETE', '/api/prototyping-request/abc'],
    ['GET', '/api/small-batch-manufacturing'],
    ['DELETE', '/api/small-batch-manufacturing/abc'],
    ['GET', '/api/stock-notifications'],
    ['PATCH', '/api/stock-notifications'],
    ['DELETE', '/api/stock-notifications?id=abc'],
    ['POST', '/api/upload'],
  ])('rejects %s %s without an admin session', async (method, path) => {
    expect((await middleware(req(path, { method }))).status).toBe(401);
  });

  it.each([
    ['GET', '/api/discounts'],
    ['GET', '/api/discounts/apply?code=SAVE'],
    ['GET', '/api/about-hero'],
    ['GET', '/api/partners'],
    ['POST', '/api/form-responses'],
    ['POST', '/api/personalise-form'],
    ['POST', '/api/prototyping-request'],
    ['POST', '/api/small-batch-manufacturing'],
    ['POST', '/api/stock-notifications'],
  ])('keeps customer/public %s %s open', async (method, path) => {
    expect((await middleware(req(path, { method }))).status).not.toBe(401);
  });
});

describe('canCustomerCancelOrder', () => {
  it('allows confirmed orders and manifested shipments', () => {
    expect(canCustomerCancelOrder('confirmed')).toBe(true);
    expect(canCustomerCancelOrder('shipped')).toBe(true);
    expect(canCustomerCancelOrder('shipped', 'manifested')).toBe(true);
  });

  it('blocks unpaid, cancelled, picked-up and delivered orders', () => {
    expect(canCustomerCancelOrder('payment_pending')).toBe(false);
    expect(canCustomerCancelOrder('payment_failed')).toBe(false);
    expect(canCustomerCancelOrder('cancelled')).toBe(false);
    expect(canCustomerCancelOrder('shipped', 'in transit')).toBe(false);
    expect(canCustomerCancelOrder('delivered', 'delivered')).toBe(false);
    expect(canCustomerCancelOrder('delivered')).toBe(false);
  });

  it('prefers the master shipment', () => {
    expect(pickDisplayShipment([{ isMaster: false, status: 'a' }, { isMaster: true, status: 'b' }])?.status).toBe('b');
    expect(pickDisplayShipment([])).toBeNull();
  });
});

describe('internal request token', () => {
  const OLD = process.env.NEXTAUTH_SECRET;
  beforeAll(() => { process.env.NEXTAUTH_SECRET = 'test-secret'; });
  afterAll(() => { process.env.NEXTAUTH_SECRET = OLD; });

  it('accepts the derived token and rejects missing or wrong tokens', () => {
    const ok = new Request(`${BASE}/api/internal/sync-shipment`, { headers: internalRequestHeaders() });
    const wrong = new Request(`${BASE}/api/internal/sync-shipment`, { headers: { 'x-internal-token': 'nope' } });
    expect(isInternalRequest(ok)).toBe(true);
    expect(isInternalRequest(wrong)).toBe(false);
    expect(isInternalRequest(new Request(BASE))).toBe(false);
  });

  it('never sends the raw secret', () => {
    expect(Object.values(internalRequestHeaders())).not.toContain('test-secret');
  });
});
