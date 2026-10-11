/**
 * @jest-environment node
 */
import {
  createReviewToken,
  isPreLaunchOrder,
  isReviewLinkOpen,
  reviewLinkUrl,
  verifyReviewToken,
} from '@/lib/reviews/link';

const DAY = 24 * 60 * 60 * 1000;
const env = { ...process.env };

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret';
  delete process.env.REVIEW_LINK_SECRET;
  delete process.env.REVIEW_LAUNCH_AT;
});
afterAll(() => {
  process.env = env;
});

describe('review link tokens', () => {
  it('round-trips the order ID and is stable across shares', () => {
    const token = createReviewToken('clorder123');
    expect(createReviewToken('clorder123')).toBe(token);
    expect(verifyReviewToken(token)).toBe('clorder123');
  });

  it('rejects tampered, swapped or malformed tokens', () => {
    const token = createReviewToken('clorder123');
    const signature = token.split('.')[1];
    expect(verifyReviewToken(`clorder999.${signature}`)).toBeNull();
    expect(verifyReviewToken(`${token}x`)).toBeNull();
    expect(verifyReviewToken('clorder123')).toBeNull();
    expect(verifyReviewToken('')).toBeNull();
    expect(verifyReviewToken(123)).toBeNull();
    expect(verifyReviewToken(`../etc.${signature}`)).toBeNull();
  });

  it('invalidates links when the signing secret changes', () => {
    const token = createReviewToken('clorder123');
    process.env.REVIEW_LINK_SECRET = 'rotated';
    expect(verifyReviewToken(token)).toBeNull();
  });

  it('builds the public URL without exposing the secret', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.scribbl3d.com/';
    const url = reviewLinkUrl('clorder123');
    expect(url).toMatch(/^https:\/\/www\.scribbl3d\.com\/review\/clorder123\.[A-Za-z0-9_-]+$/);
    expect(url).not.toContain('test-secret');
  });
});

describe('review link window', () => {
  const launch = new Date('2026-11-01T00:00:00Z');
  const now = new Date('2026-12-15T00:00:00Z');

  it('treats undated, pre-launch, or not-yet-launched orders as pre-launch', () => {
    expect(isPreLaunchOrder(null, launch)).toBe(true);
    expect(isPreLaunchOrder(new Date('2026-10-01T00:00:00Z'), launch)).toBe(true);
    expect(isPreLaunchOrder(new Date('2026-11-02T00:00:00Z'), null)).toBe(true);
    expect(isPreLaunchOrder(new Date('2026-11-02T00:00:00Z'), launch)).toBe(false);
  });

  it('keeps pre-launch links open indefinitely (L4)', () => {
    expect(isReviewLinkOpen(new Date('2025-01-01T00:00:00Z'), now, launch)).toBe(true);
    expect(isReviewLinkOpen(null, now, launch)).toBe(true);
  });

  it('closes post-launch links 30 days after delivery', () => {
    const delivered = new Date(now.getTime() - 30 * DAY);
    expect(isReviewLinkOpen(delivered, now, launch)).toBe(true);
    expect(isReviewLinkOpen(new Date(delivered.getTime() - 1), now, launch)).toBe(false);
  });
});
