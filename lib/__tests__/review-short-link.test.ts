/**
 * @jest-environment node
 */
import { prisma } from '@/lib/prisma';
import { ensureReviewShortCode, resolveReviewShortCode, reviewShortUrl } from '@/lib/reviews/shortLink';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    reviewRequest: { findUnique: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
  },
}));

const rr = prisma.reviewRequest as unknown as Record<string, jest.Mock>;
const duplicate = () => Object.assign(new Error('dup'), { code: 'P2002' });

beforeEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = 'https://www.scribbl3d.com/';
  Object.values(rr).forEach((fn) => fn.mockReset());
});

describe('ensureReviewShortCode', () => {
  it('reuses the stored code on every share', async () => {
    rr.findUnique.mockResolvedValue({ shortCode: 'Ab3xK9Qz' });
    await expect(ensureReviewShortCode('order_1')).resolves.toBe('Ab3xK9Qz');
    expect(rr.create).not.toHaveBeenCalled();
    expect(rr.updateMany).not.toHaveBeenCalled();
  });

  it('fills only an empty code on an existing request', async () => {
    rr.findUnique.mockResolvedValue({ shortCode: null });
    rr.updateMany.mockResolvedValue({ count: 1 });
    const code = await ensureReviewShortCode('order_1');
    expect(code).toMatch(/^[2-9A-HJ-NP-Za-km-z]{8}$/);
    expect(rr.updateMany).toHaveBeenCalledWith({ where: { orderId: 'order_1', shortCode: null }, data: { shortCode: code } });
  });

  it('creates the request when none exists', async () => {
    rr.findUnique.mockResolvedValue(null);
    rr.create.mockResolvedValue({});
    const code = await ensureReviewShortCode('order_1');
    expect(rr.create).toHaveBeenCalledWith({ data: { orderId: 'order_1', shortCode: code } });
  });

  it('keeps the code set by a concurrent share', async () => {
    rr.findUnique.mockResolvedValueOnce({ shortCode: null }).mockResolvedValueOnce({ shortCode: 'Winner22' });
    rr.updateMany.mockResolvedValue({ count: 0 });
    await expect(ensureReviewShortCode('order_1')).resolves.toBe('Winner22');
  });

  it('retries after a code collision', async () => {
    rr.findUnique.mockResolvedValue({ shortCode: null });
    rr.updateMany.mockRejectedValueOnce(duplicate()).mockResolvedValueOnce({ count: 1 });
    await expect(ensureReviewShortCode('order_1')).resolves.toMatch(/^[A-Za-z0-9]{8}$/);
    expect(rr.updateMany).toHaveBeenCalledTimes(2);
  });

  it('rethrows other database errors', async () => {
    rr.findUnique.mockResolvedValue(null);
    rr.create.mockRejectedValue(new Error('db down'));
    await expect(ensureReviewShortCode('order_1')).rejects.toThrow('db down');
  });

  it('builds a short public URL', async () => {
    rr.findUnique.mockResolvedValue({ shortCode: 'Ab3xK9Qz' });
    await expect(reviewShortUrl('order_1')).resolves.toBe('https://www.scribbl3d.com/r/Ab3xK9Qz');
  });
});

describe('resolveReviewShortCode', () => {
  it('returns the order for a known code', async () => {
    rr.findUnique.mockResolvedValue({ orderId: 'order_1' });
    await expect(resolveReviewShortCode('Ab3xK9Qz')).resolves.toBe('order_1');
    expect(rr.findUnique).toHaveBeenCalledWith({ where: { shortCode: 'Ab3xK9Qz' }, select: { orderId: true } });
  });

  it('rejects unknown or malformed codes without trusting input', async () => {
    rr.findUnique.mockResolvedValue(null);
    await expect(resolveReviewShortCode('Zz9zZz9z')).resolves.toBeNull();
    for (const bad of ['', 'short', 'Ab3xK9Qz1', '../etc/x', 123, null]) {
      await expect(resolveReviewShortCode(bad)).resolves.toBeNull();
    }
    expect(rr.findUnique).toHaveBeenCalledTimes(1);
  });
});
