import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReviewForm, type ReviewFormItem } from '@/app/review/[token]/_components/ReviewForm';

jest.mock('next/image', () => ({ __esModule: true, default: (props: any) => <img {...props} /> }));

const items: ReviewFormItem[] = [
  { index: 0, itemType: 'filament', name: 'PLA Silk Gold', image: null, variantLabel: 'Gold · 1.75mm - 1kg', quantity: 2, reviewed: false },
  { index: 1, itemType: 'resin', name: 'Standard Resin', image: null, variantLabel: 'Grey · 1000g', quantity: 1, reviewed: false },
  { index: 2, itemType: 'printer', name: 'Bambu A1', image: null, variantLabel: null, quantity: 1, reviewed: true },
];

const renderForm = (overrides: Partial<React.ComponentProps<typeof ReviewForm>> = {}) =>
  render(<ReviewForm token="tok.sig" orderNumber="ABCD1234" orderReviewed={false} items={items} {...overrides} />);

const respond = (status: number, body: unknown) =>
  ((global.fetch as jest.Mock) = jest.fn().mockResolvedValue({ ok: status < 300, status, json: async () => body }));

const rate = (groupName: string, stars: number) => {
  const group = screen.getByRole('group', { name: groupName });
  fireEvent.click(group.querySelectorAll('button')[stars - 1]);
};
const agree = () => fireEvent.click(screen.getByRole('checkbox'));
const submitButton = () => screen.getByRole('button', { name: 'Submit review' });
const sentBody = () => JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

beforeEach(() => {
  (global.fetch as jest.Mock) = jest.fn();
});

describe('ReviewForm', () => {
  it('shows the header, products, verified badges, progress and already-reviewed items', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: 'Share your experience' })).toBeInTheDocument();
    expect(screen.getByText('Order #ABCD1234')).toBeInTheDocument();
    expect(screen.getByText('Gold · 1.75mm - 1kg • Qty 2')).toBeInTheDocument();
    expect(screen.getAllByText('Verified Purchase')).toHaveLength(3);
    expect(screen.getByText('1 of 3 products reviewed')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Products reviewed' })).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByText('Reviewed')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Rating for Bambu A1' })).not.toBeInTheDocument();
  });

  it('expands the first unreviewed product and collapses the rest', () => {
    renderForm();
    expect(screen.getByLabelText('Collapse review for PLA Silk Gold')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Expand review for Standard Resin')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getAllByLabelText('What did you like about this product?')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Review this product' }));
    expect(screen.getAllByLabelText('What did you like about this product?')).toHaveLength(2);
  });

  it('shows the status badge beside Verified Purchase and the arrow in the card corner', () => {
    renderForm();
    rate('Rating for PLA Silk Gold', 4);
    const rated = screen.getByText('Rated');
    expect(rated.parentElement).toContainElement(screen.getAllByText('Verified Purchase')[0]);
    expect(screen.getByLabelText('Collapse review for PLA Silk Gold').className).toContain('absolute');
  });

  it('expands a collapsed product when its stars are clicked', () => {
    renderForm();
    rate('Rating for Standard Resin', 2);
    expect(screen.getByLabelText('Collapse review for Standard Resin')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Thanks for letting us know')).toBeInTheDocument();
  });

  it('offers tags that match the star rating and drops ones that no longer fit', () => {
    renderForm();
    expect(screen.queryByText('What stood out?')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fast delivery' })).not.toBeInTheDocument();
    rate('Overall experience rating', 5);
    expect(screen.getAllByText('What stood out?').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Fast delivery' }));
    expect(screen.getByRole('button', { name: 'Fast delivery' })).toHaveAttribute('aria-pressed', 'true');

    rate('Overall experience rating', 1);
    expect(screen.getByText('What went wrong?')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fast delivery' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Late delivery' })).toHaveAttribute('aria-pressed', 'false');

    rate('Overall experience rating', 3);
    expect(screen.getByText('What could be better?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delivery took a while' })).toBeInTheDocument();
  });

  it('uses product-type tags per rating band', () => {
    renderForm();
    rate('Rating for PLA Silk Gold', 2);
    expect(screen.getByRole('button', { name: 'Frequent clogging' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Smooth extrusion' })).not.toBeInTheDocument();
  });

  it('pre-selects the overall rating chosen in the email', () => {
    renderForm({ initialRating: 4 });
    expect(screen.getByText('Great to hear!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fast delivery' })).toBeInTheDocument();
  });

  it('needs a rating and consent before submitting', () => {
    renderForm();
    expect(submitButton()).toBeDisabled();
    expect(screen.getByText('Rate your overall experience or a product to submit.')).toBeInTheDocument();
    rate('Overall experience rating', 4);
    expect(screen.getByText('Great to hear!')).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
    agree();
    expect(submitButton()).toBeEnabled();
  });

  it('links the consent text to the Terms page in a new tab', () => {
    renderForm();
    expect(screen.getByLabelText(/my review may be displayed on SCRIBBL3D/)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Learn more' });
    expect(link).toHaveAttribute('href', '/terms-conditions');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('submits an order-level review on its own with consent', async () => {
    respond(201, { submitted: 0, orderReviewed: true, remaining: 2 });
    renderForm();
    rate('Overall experience rating', 5);
    fireEvent.click(screen.getByRole('button', { name: 'Fast delivery' }));
    fireEvent.change(screen.getByLabelText('What did you like about your experience?'), { target: { value: ' Packed well ' } });
    agree();
    fireEvent.click(submitButton());
    expect(await screen.findByRole('heading', { name: 'Thank you for your review' })).toBeInTheDocument();
    expect(sentBody()).toEqual({ consent: true, order: { rating: 5, content: 'Packed well', tags: ['Fast delivery'] } });
  });

  it('submits order and product reviews together', async () => {
    respond(201, { submitted: 1, orderReviewed: true, remaining: 1 });
    renderForm();
    rate('Overall experience rating', 4);
    rate('Rating for PLA Silk Gold', 5);
    fireEvent.click(screen.getByRole('button', { name: 'Smooth extrusion' }));
    fireEvent.change(screen.getByLabelText('What did you like about this product?'), { target: { value: ' Great spool ' } });
    agree();
    fireEvent.click(submitButton());
    expect(await screen.findByRole('link', { name: 'Back to homepage' })).toHaveAttribute('href', '/');
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('/api/review-links/tok.sig');
    expect(sentBody()).toEqual({
      consent: true,
      order: { rating: 4, content: null, tags: [] },
      reviews: [{ index: 0, rating: 5, content: 'Great spool', tags: ['Smooth extrusion'] }],
    });
  });

  it('blocks text without a star rating instead of dropping it', () => {
    renderForm();
    rate('Overall experience rating', 4);
    fireEvent.change(screen.getByLabelText('What did you like about this product?'), { target: { value: 'Nice' } });
    expect(screen.getByText('Add a star rating to include this review.')).toBeInTheDocument();
    agree();
    fireEvent.click(submitButton());
    expect(screen.getByRole('alert')).toHaveTextContent('no star rating');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('hides the overall rating once the order is reviewed and sends products only', async () => {
    respond(201, { submitted: 1, orderReviewed: true, remaining: 1 });
    renderForm({ orderReviewed: true });
    expect(screen.getByText('Overall experience already reviewed')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Overall experience rating' })).not.toBeInTheDocument();
    rate('Rating for PLA Silk Gold', 3);
    agree();
    fireEvent.click(submitButton());
    await screen.findByRole('heading', { name: 'Thank you for your review' });
    expect(sentBody()).toEqual({ consent: true, reviews: [{ index: 0, rating: 3, content: null, tags: [] }] });
  });

  it('shows the thank-you view when the link has closed meanwhile', async () => {
    respond(409, { error: 'This review link has expired.', state: 'expired' });
    renderForm();
    rate('Rating for PLA Silk Gold', 3);
    agree();
    fireEvent.click(submitButton());
    expect(await screen.findByRole('heading', { name: 'Thank you for your review' })).toBeInTheDocument();
  });

  it('shows an error and keeps the form when saving fails', async () => {
    respond(500, { error: 'Could not save your review. Please try again.' });
    renderForm();
    rate('Rating for PLA Silk Gold', 3);
    agree();
    fireEvent.click(submitButton());
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not save your review'));
    expect(submitButton()).toBeEnabled();
  });
});
