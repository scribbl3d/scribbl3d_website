import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import AnnouncementBanner from '@/app/landingpage/AnnouncementBanner';
import { AnnouncementContent } from '@/components/announcement-content';

let mockPathname = '/';
let reducedMotion = false;
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }));

const first = { id: 'first', text: 'First announcement', icon: 'truck', linkLabel: 'Shop now', linkUrl: '/filament', isActive: true, sortOrder: 0 };
const second = { ...first, id: 'second', text: 'Second announcement', linkLabel: 'Read more', linkUrl: '/shipping-policy', sortOrder: 1 };
const fetchMock = global.fetch as jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
  mockPathname = '/';
  reducedMotion = false;
  fetchMock.mockReset();
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  window.matchMedia = jest.fn().mockImplementation(() => ({ matches: reducedMotion, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  global.ResizeObserver = jest.fn().mockImplementation((callback) => ({ observe: () => callback(), disconnect: jest.fn(), unobserve: jest.fn() }));
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ height: 40 } as DOMRect);
});

afterEach(() => {
  cleanup();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

async function mount(data: unknown = [first, second]) {
  fetchMock.mockResolvedValue({ ok: true, json: async () => data });
  let result!: ReturnType<typeof render>;
  await act(async () => { result = render(<AnnouncementBanner />); });
  return result;
}

describe('Announcement content modes', () => {
  it('renders the left icon, divider, and one hyperlink with a decorative arrow', () => {
    const { container } = render(<AnnouncementContent announcement={{ ...first, icon: 'truck', text: 'Explore our', linkLabel: 'filaments' }} />);
    expect(container.textContent).toBe('Explore our filaments');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    const link = screen.getByRole('link', { name: 'filaments' });
    expect(link).toHaveAttribute('href', '/filament');
    const arrow = link.querySelector('.lucide-arrow-right');
    expect(arrow).toHaveAttribute('aria-hidden', 'true');
    expect(arrow?.closest('a')).toBe(link);
    expect(arrow).toHaveClass('pointer-events-none');
    expect(link).toHaveClass('cursor-pointer');
    expect(container.querySelector('.lucide-truck')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('renders text-only content with no link', () => {
    const { container } = render(<AnnouncementContent announcement={{ ...first, icon: 'none', linkLabel: null, linkUrl: null }} />);
    expect(container.textContent).toBe('First announcement');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container.querySelector('span[aria-hidden="true"]')).toBeNull();
    expect(container.querySelector('.lucide-arrow-right')).toBeNull();
  });

  it('renders a non-interactive link-only preview without leading whitespace', () => {
    const { container } = render(<AnnouncementContent announcement={{ ...first, icon: 'none', text: '' }} interactive={false} />);
    expect(container.textContent).toBe('Shop now');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container.querySelector('span[aria-hidden="true"]')).toBeNull();
    expect(container.querySelector('.lucide-arrow-right')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Announcement banner', () => {
  it('renders a link-only published announcement', async () => {
    await mount([{ ...first, text: '' }]);
    expect(screen.getByRole('link', { name: 'Shop now' })).toHaveAttribute('href', '/filament');
    expect(screen.getByRole('region')).toHaveTextContent('Shop now');
  });
  it('renders a published message and CTA without a close button', async () => {
    await mount([first]);
    expect(screen.getByRole('region', { name: 'Store announcements' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shop now' })).toHaveAttribute('href', '/filament');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue('--announcement-height')).toBe('40px');
  });

  it('waits four seconds and keeps looping from the last announcement back to the first', async () => {
    await mount();
    act(() => { jest.advanceTimersByTime(3999); });
    expect(screen.getByRole('link', { name: 'Shop now' })).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(1); });
    expect(screen.getByRole('link', { name: 'Read more' })).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(4000); });
    expect(screen.getByRole('link', { name: 'Shop now' })).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(4000); });
    expect(screen.getByRole('link', { name: 'Read more' })).toBeInTheDocument();
  });

  it('rotates at four seconds and pauses on hover or focus without visible controls', async () => {
    await mount();
    expect(screen.getByRole('link', { name: 'Shop now' })).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(4000); });
    expect(screen.getByRole('link', { name: 'Read more' })).toBeInTheDocument();
    const banner = screen.getByRole('region');
    fireEvent.mouseEnter(banner);
    act(() => { jest.advanceTimersByTime(12000); });
    expect(screen.getByRole('link', { name: 'Read more' })).toBeInTheDocument();
    fireEvent.mouseLeave(banner);
    fireEvent.focus(screen.getByRole('link', { name: 'Read more' }));
    act(() => { jest.advanceTimersByTime(4000); });
    expect(screen.getByRole('link', { name: 'Read more' })).toBeInTheDocument();
    fireEvent.blur(screen.getByRole('link', { name: 'Read more' }), { relatedTarget: null });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(4000); });
    expect(screen.getByRole('link', { name: 'Shop now' })).toBeInTheDocument();
  });

  it('disables autoplay and entrance animation for reduced motion while allowing keyboard browsing', async () => {
    reducedMotion = true;
    await mount();
    act(() => { jest.advanceTimersByTime(12000); });
    expect(screen.getByRole('link', { name: 'Shop now' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: '1 of 2' })).not.toHaveClass('motion-safe:animate-[announcement-drop_650ms_ease-out_both]');
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
    expect(screen.getByRole('link', { name: 'Read more' })).toBeInTheDocument();
  });

  it('animates only the current slide and supports arrow keys when the bar itself is focused', async () => {
    await mount();
    const banner = screen.getByRole('region');
    expect(banner).toHaveAttribute('tabindex', '0');
    expect(banner).toHaveAccessibleDescription(/Focus or hover over this bar to pause/);
    expect(screen.getByRole('group', { name: '1 of 2' })).toHaveClass('motion-safe:animate-[announcement-drop_650ms_ease-out_both]');
    fireEvent.focus(banner);
    fireEvent.keyDown(banner, { key: 'ArrowRight' });
    expect(screen.getByRole('group', { name: '2 of 2' })).toHaveClass('motion-safe:animate-[announcement-drop_650ms_ease-out_both]');
    fireEvent.keyDown(screen.getByRole('link', { name: 'Read more' }), { key: 'ArrowLeft' });
    expect(screen.getByRole('link', { name: 'Read more' })).toBeInTheDocument();
    fireEvent.keyDown(banner, { key: 'ArrowLeft' });
    expect(screen.getByRole('link', { name: 'Shop now' })).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(4000); });
    expect(screen.getByRole('link', { name: 'Shop now' })).toBeInTheDocument();
  });

  it.each(['/ops/control', '/checkout', '/payment/status'])('does not fetch or reserve space on %s', async (path) => {
    mockPathname = path;
    await mount();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue('--announcement-height')).toBe('0px');
  });

  it.each([[], [{ ...first, isActive: false }], [{ ...first, linkUrl: 'javascript:alert(1)' }], { invalid: true }])('leaves no gap for empty, private, or invalid data %#', async (data) => {
    await mount(data);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue('--announcement-height')).toBe('0px');
  });

  it('handles network failure without breaking navigation', async () => {
    fetchMock.mockRejectedValue(new Error('Offline'));
    await act(async () => { render(<AnnouncementBanner />); });
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('refreshes publication changes and resets layout on unmount', async () => {
    const { unmount } = await mount();
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });
    await act(async () => { window.dispatchEvent(new Event('focus')); });
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue('--announcement-height')).toBe('0px');
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
