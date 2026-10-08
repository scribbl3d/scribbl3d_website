import { render } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { AdminSessionWatcher } from '@/app/ops/control/_components/AdminSessionWatcher';
import { toast } from '@/components/ui/use-toast';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(() => ({ id: 'expired' })),
  useToast: () => ({ toasts: [] }),
}));

const respond = (status: number) => Promise.resolve({ status } as Response);

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(toast).mockClear();
  (usePathname as jest.Mock).mockReturnValue('/ops/control/orders');
});

afterEach(() => {
  jest.useRealTimers();
});

async function call(path: string, status: number) {
  (global.fetch as jest.Mock) = jest.fn(() => respond(status));
  const { unmount } = render(<AdminSessionWatcher />);
  await window.fetch(path);
  jest.advanceTimersByTime(600);
  unmount();
}

describe('AdminSessionWatcher', () => {
  it('shows a session-expired toast when an ops API call returns 401', async () => {
    await call('/api/admin/orders', 401);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Your admin session has expired' }));
  });

  it('ignores successful calls and other errors', async () => {
    await call('/api/admin/orders', 200);
    await call('/api/admin/orders', 500);
    expect(toast).not.toHaveBeenCalled();
  });

  it('ignores a wrong password on the login API', async () => {
    await call('/api/admin/login', 401);
    expect(toast).not.toHaveBeenCalled();
  });

  it('does nothing on the login page', async () => {
    (usePathname as jest.Mock).mockReturnValue('/ops/control/login');
    await call('/api/admin/orders', 401);
    expect(toast).not.toHaveBeenCalled();
  });

  it('restores the original fetch on unmount', () => {
    const original = jest.fn();
    (global.fetch as unknown) = original;
    const { unmount } = render(<AdminSessionWatcher />);
    expect(window.fetch).not.toBe(original);
    unmount();
    expect(window.fetch).toBe(original);
  });
});
