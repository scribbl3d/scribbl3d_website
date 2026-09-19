import type { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { GET, POST } from '@/app/api/announcements/route';
import { PATCH, DELETE } from '@/app/api/announcements/[id]/route';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number; headers?: Record<string, string> } = {}) => ({ status: options.status || 200, headers: options.headers, json: async () => data }) },
}));
jest.mock('@/lib/admin-session', () => ({ isAdminRequest: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: { announcement: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() } } }));

const id = 'clx12345678901234567890123';
const context = { params: Promise.resolve({ id }) };
const data = { text: 'New products', icon: 'tag', linkLabel: 'Shop now', linkUrl: '/prebuilt-products', isActive: true, sortOrder: 1 };
const request = (body: unknown = data, query = '') => ({ url: `https://www.scribbl3d.com/api/announcements${query}`, nextUrl: new URL(`https://www.scribbl3d.com/api/announcements${query}`), json: jest.fn().mockResolvedValue(body) }) as unknown as NextRequest;

beforeEach(() => {
  jest.mocked(isAdminRequest).mockReset().mockResolvedValue(false);
  Object.values(prisma.announcement).forEach((method) => (method as jest.Mock).mockReset());
});

describe('Announcement API', () => {
  it('returns only published records in automatic newest-first order without caching', async () => {
    jest.mocked(prisma.announcement.findMany).mockResolvedValue([]);
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(prisma.announcement.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true }, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }] }));
    expect(response.headers).toEqual({ 'Cache-Control': 'private, no-store' });
  });

  it('rejects private listing, create, edit and delete before database access without a verified admin', async () => {
    expect((await GET(request(null, '?admin=true'))).status).toBe(401);
    expect((await POST(request())).status).toBe(401);
    expect((await PATCH(request(), context)).status).toBe(401);
    expect((await DELETE(request(), context)).status).toBe(401);
    Object.values(prisma.announcement).forEach((method) => expect(method).not.toHaveBeenCalled());
  });

  it('allows a verified admin to list drafts and published messages', async () => {
    jest.mocked(isAdminRequest).mockResolvedValue(true);
    jest.mocked(prisma.announcement.findMany).mockResolvedValue([]);
    expect((await GET(request(null, '?admin=true'))).status).toBe(200);
    expect(prisma.announcement.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {}, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }] }));
  });

  it('validates writes and supports create, edit, publish and delete', async () => {
    jest.mocked(isAdminRequest).mockResolvedValue(true);
    (prisma.announcement.create as jest.Mock).mockResolvedValue({ id, ...data });
    (prisma.announcement.update as jest.Mock).mockResolvedValue({ id, ...data, isActive: false });
    (prisma.announcement.delete as jest.Mock).mockResolvedValue({ id });
    expect((await POST(request())).status).toBe(201);
    expect(prisma.announcement.create).toHaveBeenCalledWith(expect.objectContaining({ data }));
    expect((await PATCH(request({ ...data, isActive: false }), context)).status).toBe(200);
    expect(prisma.announcement.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id }, data: { ...data, isActive: false } }));
    expect((await DELETE(request(), context)).status).toBe(200);
  });

  it.each([null, { text: ' ' }, { ...data, linkUrl: 'javascript:alert(1)' }, { ...data, sortOrder: -1 }])('rejects invalid data %# without database mutations', async (body) => {
    jest.mocked(isAdminRequest).mockResolvedValue(true);
    expect((await POST(request(body))).status).toBe(400);
    expect((await PATCH(request(body), context)).status).toBe(400);
    expect(prisma.announcement.create).not.toHaveBeenCalled();
    expect(prisma.announcement.update).not.toHaveBeenCalled();
  });

  it('creates link-only content and allows switching it to text-only', async () => {
    jest.mocked(isAdminRequest).mockResolvedValue(true);
    const linkOnly = { ...data, text: '' };
    (prisma.announcement.create as jest.Mock).mockResolvedValue({ id, ...linkOnly });
    expect((await POST(request(linkOnly))).status).toBe(201);
    expect(prisma.announcement.create).toHaveBeenCalledWith(expect.objectContaining({ data: linkOnly }));
    const textOnly = { ...data, linkLabel: null, linkUrl: null };
    (prisma.announcement.update as jest.Mock).mockResolvedValue({ id, ...textOnly });
    expect((await PATCH(request(textOnly), context)).status).toBe(200);
    expect(prisma.announcement.update).toHaveBeenCalledWith(expect.objectContaining({ data: textOnly }));
  });

  it('returns 400 for malformed JSON and invalid IDs', async () => {
    jest.mocked(isAdminRequest).mockResolvedValue(true);
    const malformed = request();
    jest.mocked(malformed.json).mockRejectedValue(new SyntaxError('Invalid JSON'));
    expect((await POST(malformed)).status).toBe(400);
    const invalid = { params: Promise.resolve({ id: 'invalid' }) };
    expect((await PATCH(request(), invalid)).status).toBe(400);
    expect((await DELETE(request(), invalid)).status).toBe(400);
  });

  it('returns 404 for missing records and safe errors on database failure', async () => {
    jest.mocked(isAdminRequest).mockResolvedValue(true);
    const missing = new Prisma.PrismaClientKnownRequestError('Missing', { code: 'P2025', clientVersion: 'test' });
    jest.mocked(prisma.announcement.update).mockRejectedValue(missing);
    jest.mocked(prisma.announcement.delete).mockRejectedValue(missing);
    expect((await PATCH(request(), context)).status).toBe(404);
    expect((await DELETE(request(), context)).status).toBe(404);
    jest.mocked(prisma.announcement.findMany).mockRejectedValue(new Error('Private database details'));
    const response = await GET(request());
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain('Private database details');
  });
});
