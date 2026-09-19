import { announcementSchema, isSafeAnnouncementLink, showStorefrontAnnouncement } from '../announcements';

const valid = { text: 'New materials available', icon: 'tag', linkLabel: 'Explore', linkUrl: '/filament', isActive: true, sortOrder: 2 };

describe('Announcement validation', () => {
  it('trims messages and defaults new announcements to private drafts', () => {
    expect(announcementSchema.parse({ text: '  Hello  ' })).toEqual({ text: 'Hello', icon: 'truck', linkLabel: null, linkUrl: null, isActive: false, sortOrder: 0 });
  });

  it.each(['', '   ', undefined])('accepts link-only announcements with blank or omitted text %#', (text) => {
    expect(announcementSchema.parse({ ...valid, text })).toMatchObject({ text: '', linkLabel: 'Explore', linkUrl: '/filament' });
  });

  it.each([
    {}, { text: '', linkLabel: '', linkUrl: '' }, { ...valid, links: [{ label: 'Second link', url: '/resins' }] },
    { text: '' }, { text: '   ' }, { text: 'a'.repeat(161) },
    { ...valid, icon: 'custom-script' }, { ...valid, sortOrder: -1 },
    { ...valid, sortOrder: 1.5 }, { ...valid, sortOrder: 10000 },
    { ...valid, isActive: 'true' }, { ...valid, linkLabel: 'a'.repeat(33) },
    { ...valid, linkUrl: '' }, { ...valid, linkLabel: null },
    { ...valid, unexpected: 'field' },
  ])('rejects invalid input %#', (data) => {
    expect(announcementSchema.safeParse(data).success).toBe(false);
  });

  it.each(['/filament', '/printers?brand=test#products', 'https://www.scribbl3d.com/shipping-policy'])('allows safe destinations %s', (url) => {
    expect(isSafeAnnouncementLink(url)).toBe(true);
    expect(announcementSchema.safeParse({ ...valid, linkUrl: url }).success).toBe(true);
  });

  it.each(['javascript:alert(1)', 'data:text/html,bad', '//evil.example', '/\\evil.example', '/%5cevil.example', '/%2fevil.example', 'http://example.com', 'https://user:password@example.com', 'https://example.com\n', 'invalid', '/%zz'])('rejects unsafe destinations %s', (url) => {
    expect(isSafeAnnouncementLink(url)).toBe(false);
  });

  it.each(['/ops/control', '/ops/control/announcements', '/admin', '/checkout', '/checkout/payment', '/payment/status'])('hides the storefront bar on %s', (path) => {
    expect(showStorefrontAnnouncement(path)).toBe(false);
  });

  it.each(['/', '/filament', '/terms-conditions', '/profile', '/checkout-guide'])('allows storefront announcements on %s', (path) => {
    expect(showStorefrontAnnouncement(path)).toBe(true);
  });
});
