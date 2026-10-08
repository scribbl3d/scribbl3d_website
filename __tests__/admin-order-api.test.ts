import type { NextRequest } from 'next/server';
import { PATCH, DELETE } from '@/app/api/admin/orders/[orderId]/route';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data }) },
}));
jest.mock('@/lib/admin-session', () => ({ isAdminRequest: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: { order: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn(), delete: jest.fn() } } }));
jest.mock('@/lib/email/sendEmail', () => ({ sendEmail: jest.fn() }));
jest.mock('@/app/api/admin/orders/[orderId]/send-email/sendStatusEmail', () => jest.fn());

const orderId = 'order_1';
const context = { params: { orderId } };
const request = (body: unknown = { status: 'delivered' }) => ({ json: jest.fn().mockResolvedValue(body) }) as unknown as NextRequest;

beforeEach(() => {
  jest.mocked(isAdminRequest).mockReset().mockResolvedValue(false);
  Object.values(prisma.order).forEach((method) => (method as jest.Mock).mockReset());
});

describe('Admin order API', () => {
  it('rejects status updates and deletes before database access without a verified admin', async () => {
    expect((await PATCH(request(), context)).status).toBe(401);
    expect((await DELETE(request(), context)).status).toBe(401);
    Object.values(prisma.order).forEach((method) => expect(method).not.toHaveBeenCalled());
  });

  it('lets a verified admin mark an order delivered and records deliveredAt once', async () => {
    jest.mocked(isAdminRequest).mockResolvedValue(true);
    (prisma.order.update as jest.Mock).mockResolvedValue({ id: orderId, status: 'delivered', user: null });
    (prisma.order.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    expect((await PATCH(request(), context)).status).toBe(200);
    expect(prisma.order.updateMany).toHaveBeenCalledWith({
      where: { id: orderId, deliveredAt: null },
      data: { deliveredAt: expect.any(Date) },
    });
  });
});
