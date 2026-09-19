import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AnnouncementsAdmin from '@/app/ops/control/announcements/page';
import type { Announcement } from '@/lib/announcements';

const fetchMock = global.fetch as jest.Mock;
let records: Announcement[];
const saved: Announcement = { id: 'clx12345678901234567890123', text: 'Materials update', icon: 'tag', linkLabel: 'Explore', linkUrl: '/filament', isActive: false, sortOrder: 2 };

beforeEach(() => {
  records = [];
  fetchMock.mockReset().mockImplementation(async (_url: string, init?: RequestInit) => {
    const method = init?.method || 'GET';
    if (method === 'POST') records = [{ id: saved.id, ...JSON.parse(init?.body as string) }];
    if (method === 'PATCH') records = [{ id: saved.id, ...JSON.parse(init?.body as string) }];
    if (method === 'DELETE') records = [];
    return { ok: true, json: async () => method === 'GET' ? records : records[0] || { success: true } };
  });
  HTMLElement.prototype.scrollIntoView = jest.fn();
  jest.spyOn(window, 'confirm').mockReturnValue(false);
});

afterEach(() => jest.restoreAllMocks());

async function mount() {
  render(<AnnouncementsAdmin />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled());
}

describe('Announcement administration', () => {
  it('starts empty, loads private admin data, and saves a draft with validated fields', async () => {
    await mount();
    expect(fetchMock).toHaveBeenCalledWith('/api/announcements?admin=true', { cache: 'no-store' });
    expect(screen.getByText('No announcements yet')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Message (optional)'), { target: { value: 'Materials update' } });
    fireEvent.change(screen.getByLabelText('Link text (optional)'), { target: { value: 'Explore' } });
    fireEvent.change(screen.getByLabelText('Link destination (optional)'), { target: { value: '/filament' } });
    expect(screen.queryByLabelText('Display order')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await screen.findByRole('button', { name: 'Publish' });
    expect(records[0]).toMatchObject({ text: 'Materials update', isActive: false, linkLabel: 'Explore', linkUrl: '/filament', sortOrder: 0 });
    expect(screen.getByLabelText('Message (optional)')).toHaveValue('');
  });

  it('previews, saves, and edits a link-only announcement', async () => {
    await mount();
    expect(screen.getByLabelText('Message (optional)')).not.toBeRequired();
    fireEvent.change(screen.getByLabelText('Link text (optional)'), { target: { value: 'Shop filaments' } });
    fireEvent.change(screen.getByLabelText('Link destination (optional)'), { target: { value: '/filament' } });
    expect(screen.getByText('Shop filaments')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Shop filaments' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await screen.findByRole('button', { name: 'Edit Shop filaments' });
    expect(records[0]).toMatchObject({ text: '', linkLabel: 'Shop filaments', linkUrl: '/filament' });
    fireEvent.click(screen.getByRole('button', { name: 'Edit Shop filaments' }));
    expect(screen.getByLabelText('Message (optional)')).toHaveValue('');
    expect(screen.getByLabelText('Link text (optional)')).toHaveValue('Shop filaments');
    fireEvent.change(screen.getByLabelText('Link text (optional)'), { target: { value: 'Browse filaments' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByRole('button', { name: 'Edit Browse filaments' });
    fireEvent.click(screen.getByRole('button', { name: 'Delete Browse filaments' }));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Browse filaments'));
  });

  it('saves a text-only announcement and rejects a completely empty one', async () => {
    await mount();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter announcement text or add a link');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText('Message (optional)'), { target: { value: 'An important update' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await screen.findByRole('button', { name: 'Edit An important update' });
    expect(records[0]).toMatchObject({ text: 'An important update', linkLabel: null, linkUrl: null });
  });

  it('keeps legacy order values internal and explains automatic ordering', async () => {
    records = [saved];
    await mount();
    expect(screen.getByText(/automatic newest-first order/)).toBeInTheDocument();
    expect(screen.queryByText(/Order 2/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit Materials update' }));
    expect(screen.queryByLabelText('Display order')).not.toBeInTheDocument();
  });

  it('edits saved messages and allows publishing and unpublishing', async () => {
    records = [saved];
    await mount();
    fireEvent.click(screen.getByRole('button', { name: 'Edit Materials update' }));
    expect(screen.getByLabelText('Message (optional)')).toHaveValue(saved.text);
    fireEvent.change(screen.getByLabelText('Message (optional)'), { target: { value: 'Updated message' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByRole('button', { name: 'Edit Updated message' });
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
    await screen.findByRole('button', { name: 'Unpublish' });
    expect(records[0].isActive).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }));
    await screen.findByRole('button', { name: 'Publish' });
    expect(records[0].isActive).toBe(false);
  });

  it('rejects an incomplete CTA before submitting', async () => {
    await mount();
    fireEvent.change(screen.getByLabelText('Message (optional)'), { target: { value: 'Hello' } });
    fireEvent.change(screen.getByLabelText('Link text (optional)'), { target: { value: 'Read more' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Provide both link text and a destination');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('requires confirmation before deletion', async () => {
    records = [saved];
    await mount();
    fireEvent.click(screen.getByRole('button', { name: 'Delete Materials update' }));
    expect(records).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    jest.mocked(window.confirm).mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Delete Materials update' }));
    await screen.findByText('No announcements yet');
    expect(records).toHaveLength(0);
  });

  it('publishes a new message using the compact form footer', async () => {
    await mount();
    fireEvent.change(screen.getByLabelText('Message (optional)'), { target: { value: 'Published update' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Publish on storefront' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create & publish' }));
    await screen.findByRole('button', { name: 'Unpublish' });
    expect(records[0]).toMatchObject({ text: 'Published update', isActive: true });
    expect(screen.getByRole('checkbox', { name: 'Publish on storefront' })).not.toBeChecked();
  });

  it('distinguishes a failed load from an empty list and offers retry', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: 'Announcement migration required' }) });
    render(<AnnouncementsAdmin />);
    await screen.findByRole('button', { name: 'Retry loading' });
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Publish on storefront' })).toBeDisabled();
    expect(screen.queryByText('No announcements yet')).not.toBeInTheDocument();
  });

  it('shows API errors without claiming a save succeeded', async () => {
    await mount();
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: 'Admin sign-in required' }) });
    fireEvent.change(screen.getByLabelText('Message (optional)'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Admin sign-in required');
    expect(screen.queryByText(/Changes saved/)).not.toBeInTheDocument();
  });
});
