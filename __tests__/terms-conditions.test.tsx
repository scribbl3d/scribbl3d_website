import { render, screen, within } from '@testing-library/react';
import TermsAndConditions, { metadata } from '@/app/(policies)/terms-conditions/page';
import PolicyLayout from '@/components/PolicyLayout';
import Footer from '@/components/footer';
import ShippingPolicy, { metadata as shippingMetadata } from '@/app/(policies)/shipping-policy/page';
import ReturnsPolicy, { metadata as returnsMetadata } from '@/app/(policies)/return-policy/page';
import RefundPolicy, { metadata as refundMetadata } from '@/app/(policies)/refund-policy/page';
import PrivacyPolicy, { metadata as privacyMetadata } from '@/app/(policies)/privacy-policy/page';

describe('Policy emphasis', () => {
  it.each([
    { name: 'Terms', Page: TermsAndConditions, phrases: ['An account is required', 'binding upon confirmation by SCRIBBL3D', 'You retain ownership', 'obtain the customer’s permission'] },
    { name: 'Returns', Page: ReturnsPolicy, phrases: ['within 10 days from the date of delivery', 'must be unused', 'except where the Product is defective or damaged', 'applicable warranty or service process'] },
    { name: 'Refunds', Page: RefundPolicy, phrases: ['has not already been dispatched', 'within 5–7 business days after approval', 'within 48 hours of delivery', 'original payment method'] },
    { name: 'Privacy', Page: PrivacyPolicy, phrases: ['We do not sell your personal information', 'control cookies through your browser settings', 'verify your identity', 'unsubscribe option'] },
    { name: 'Shipping', Page: ShippingPolicy, phrases: ['generally delivered within 7 days', 'included in the displayed Product price', 'within 48 hours of delivery', 'Order number'] },
  ])('highlights key points sparingly in $name', ({ Page, phrases }) => {
    render(<Page />);
    const article = screen.getByRole('article');
    phrases.forEach((phrase) => {
      expect(within(article).getByText(phrase, { selector: 'strong' })).toBeInTheDocument();
    });
    const boldText = Array.from(article.querySelectorAll('strong')).map((element) => element.textContent).join(' ');
    expect(boldText.length / article.textContent!.length).toBeLessThan(0.2);
  });
});

describe('Terms & Conditions', () => {
  it('renders the supplied terms as 20 addressable, numbered sections', () => {
    render(<TermsAndConditions />);

    expect(screen.getByRole('heading', { level: 1, name: 'Terms & Conditions' })).toBeInTheDocument();
    const article = screen.getByRole('article');
    const sections = article.querySelectorAll('section');
    expect(sections).toHaveLength(20);
    sections.forEach((section, index) => {
      expect(section.id).toBeTruthy();
      expect(within(section).getByRole('heading', { level: 2 }).textContent).toMatch(new RegExp(`^${index + 1}\\.`));
    });
    expect(within(article).getByText('07BVCPJ4441C1Z1')).toBeInTheDocument();
    expect(within(article).getByText(/Before the product is dispatched/)).toBeInTheDocument();
    expect(within(article).getByText(/Nothing in this section limits any statutory rights/)).toBeInTheDocument();
  });

  it('keeps machine-readable dates without adding another navbar or footer', () => {
    const { container } = render(<TermsAndConditions />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(container.querySelectorAll('time[datetime="2026-09-19"]')).toHaveLength(2);
  });

  it('links to the correct policies and contact methods', () => {
    render(<TermsAndConditions />);
    const article = within(screen.getByRole('article'));
    expect(article.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy-policy');
    expect(article.getByRole('link', { name: 'Shipping Policy' })).toHaveAttribute('href', '/shipping-policy');
    article.getAllByRole('link', { name: 'Returns Policy' }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/return-policy');
    });
    article.getAllByRole('link', { name: 'Refund Policy' }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/refund-policy');
    });
    article.getAllByRole('link', { name: 'supplychain@scribbl3d.com' }).forEach((link) => {
      expect(link).toHaveAttribute('href', 'mailto:supplychain@scribbl3d.com');
    });
    expect(article.getAllByRole('link', { name: '+91 9599523434' })).toHaveLength(2);
    expect(metadata.alternates).toEqual({ canonical: '/terms-conditions' });
  });

  it('retains the existing layout API for policies not yet rebuilt', () => {
    render(<PolicyLayout title="Existing policy" lastUpdated="January 9, 2025"><p>Existing content</p></PolicyLayout>);
    expect(screen.getByRole('heading', { level: 1, name: 'Existing policy' })).toBeInTheDocument();
    expect(screen.getByText('Existing content')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('gives returns and shipping distinct links in the site footer', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Shipping Policy' })).toHaveAttribute('href', '/shipping-policy');
    expect(screen.getByRole('link', { name: 'Returns Policy' })).toHaveAttribute('href', '/return-policy');
  });
});

describe('Returns Policy', () => {
  it('renders all nine supplied sections using the shared policy layout', () => {
    const { container } = render(<ReturnsPolicy />);
    expect(screen.getByRole('heading', { level: 1, name: 'Returns Policy' })).toBeInTheDocument();
    const headings = within(screen.getByRole('article')).getAllByRole('heading', { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      '1. Return Period',
      '2. Return Eligibility',
      '3. Sale and Discounted Products',
      '4. Defective, Damaged or Incorrect Products',
      '5. Customised and Personalised Products',
      '6. Filaments, Resins and Other Consumables',
      '7. 3D Printers and Electronics',
      '8. Return Process',
      '9. Important',
    ]);
    expect(container.querySelectorAll('time[datetime="2026-09-19"]')).toHaveLength(2);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('uses delivery-based deadlines and includes sale products and statutory exceptions', () => {
    render(<ReturnsPolicy />);
    const article = screen.getByRole('article');
    expect(article).toHaveTextContent('Eligible Products may be returned or exchanged within 10 days from the date of delivery.');
    expect(screen.getByText(/Once 10 days have passed from delivery.*except where required under applicable law/)).toBeInTheDocument();
    expect(article).toHaveTextContent('Products purchased during a sale or promotional offer are eligible for return or exchange subject to the same conditions applicable to other eligible Products.');
    expect(screen.getByText('Nothing in this Returns Policy is intended to exclude or restrict any rights or remedies that cannot legally be excluded or restricted under applicable law.')).toBeInTheDocument();
    expect(screen.queryByText(/10 days from the date of your purchase/)).not.toBeInTheDocument();
  });

  it('preserves category-specific restrictions, exceptions, and return instructions', () => {
    render(<ReturnsPolicy />);
    expect(screen.getByText('Customised, personalised or made-to-order Products are not eligible for return or exchange unless they are:')).toBeInTheDocument();
    expect(screen.getByText('incorrectly manufactured; or')).toBeInTheDocument();
    const article = screen.getByRole('article');
    expect(article).toHaveTextContent('Opened or used consumables are generally not eligible for return or exchange, except where the Product is defective or damaged.');
    expect(article).toHaveTextContent('3D printers and other applicable electronic Products are not eligible for return or exchange after delivery.');
    expect(article).toHaveTextContent('Any manufacturing defect or functional issue will be handled through the applicable warranty or service process.');
    expect(screen.getByText('Order number', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('Photographs or videos where relevant.')).toBeInTheDocument();
    expect(screen.getByText('Once the returned Product is received and inspected, we will notify you whether the return or exchange has been approved.')).toBeInTheDocument();
  });

  it('links to refunds, standalone shipping, and support without embedding shipping terms', () => {
    render(<ReturnsPolicy />);
    const refundLinks = screen.getAllByRole('link', { name: 'Refund Policy' });
    expect(refundLinks).toHaveLength(2);
    refundLinks.forEach((link) => expect(link).toHaveAttribute('href', '/refund-policy'));
    expect(screen.getByRole('link', { name: 'Shipping Policy' })).toHaveAttribute('href', '/shipping-policy');
    const emailLinks = screen.getAllByRole('link', { name: 'supplychain@scribbl3d.com' });
    expect(emailLinks).toHaveLength(2);
    emailLinks.forEach((link) => expect(link).toHaveAttribute('href', 'mailto:supplychain@scribbl3d.com'));
    expect(screen.queryByText(/Orders are delivered within 5 days/)).not.toBeInTheDocument();
    expect(returnsMetadata.alternates).toEqual({ canonical: '/return-policy' });
    expect(returnsMetadata.title).toBe('Returns Policy');
  });
});

describe('Refund & Cancellation Policy', () => {
  it('renders eight numbered sections and both dates without duplicate navigation', () => {
    const { container } = render(<RefundPolicy />);
    expect(screen.getByRole('heading', { level: 1, name: 'Refund & Cancellation Policy' })).toBeInTheDocument();
    expect(screen.getAllByText('Order ID', { selector: 'strong' })).toHaveLength(3);
    const headings = within(screen.getByRole('article')).getAllByRole('heading', { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      '1. Order Cancellation',
      '2. Refunds for Cancelled Orders',
      '3. Damaged, Defective or Incorrect Products',
      '4. 3D Printers and Warranty Products',
      '5. Customised and Made-to-Order Products',
      '6. Failed or Refused Deliveries',
      '7. Refund Method',
      '8. Contact Us',
    ]);
    expect(container.querySelectorAll('time[datetime="2026-09-19"]')).toHaveLength(2);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('uses the supplied cancellation conditions and refund processing timeframe', () => {
    render(<RefundPolicy />);
    const article = screen.getByRole('article');
    expect(article).toHaveTextContent('Customers may request cancellation of an order provided the order has not already been dispatched.');
    expect(article).toHaveTextContent('For customised, personalised or made-to-order Products, cancellation may not be available once production has commenced.');
    expect(article).toHaveTextContent('Refunds will be processed within 5–7 business days after approval. The time taken for the amount to appear in your account may depend on your bank, card issuer or payment provider.');
    expect(article).toHaveTextContent('Approved refunds will generally be issued to the original payment method used for the transaction.');
    expect(screen.getByText('If the original payment method cannot receive the refund, SCRIBBL3D may contact the Customer to arrange an appropriate alternative method.')).toBeInTheDocument();
    expect(screen.queryByText(/within 2 days of placing the order/)).not.toBeInTheDocument();
  });

  it('preserves reporting requirements, product exceptions, and statutory rights', () => {
    render(<RefundPolicy />);
    expect(screen.getByText(/within 48 hours of delivery/)).toBeInTheDocument();
    expect(screen.getByText('photographs or videos of the Product and packaging; and')).toBeInTheDocument();
    expect(screen.getByText('3D printers and other Products covered by a manufacturer or SCRIBBL3D warranty are not eligible for ordinary return or refund after delivery.')).toBeInTheDocument();
    expect(screen.getByText('Customised, personalised and made-to-order Products are generally not eligible for cancellation or refund once production has commenced, except where the Product is defective, damaged, incorrectly manufactured or otherwise covered by applicable law.')).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveTextContent('Any applicable shipping, return or re-delivery charges may be deducted from the refundable amount.');
    expect(screen.getByText('Nothing in this Policy is intended to exclude or restrict any rights or remedies that cannot legally be excluded or restricted under applicable law.')).toBeInTheDocument();
  });

  it('replaces placeholders with working support, returns, and customer orders links', () => {
    const { container } = render(<RefundPolicy />);
    const emailLinks = screen.getAllByRole('link', { name: 'supplychain@scribbl3d.com' });
    expect(emailLinks).toHaveLength(3);
    emailLinks.forEach((link) => expect(link).toHaveAttribute('href', 'mailto:supplychain@scribbl3d.com'));
    expect(screen.getByRole('link', { name: '+91 9599523434' })).toHaveAttribute('href', 'tel:+919599523434');
    expect(screen.getByRole('link', { name: 'orders section' })).toHaveAttribute('href', '/profile?tab=orders');
    expect(screen.getByRole('link', { name: 'Returns Policy' })).toHaveAttribute('href', '/return-policy');
    expect(container.textContent).not.toMatch(/\[SUPPORT EMAIL\]|\[PHONE NUMBER\]|\[LINK:/);
    expect(refundMetadata.alternates).toEqual({ canonical: '/refund-policy' });
    expect(refundMetadata.title).toBe('Refund & Cancellation Policy');
  });
});

describe('Privacy Policy', () => {
  it('renders all 14 sections, collection subheadings, and policy dates', () => {
    const { container } = render(<PrivacyPolicy />);
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
    const article = screen.getByRole('article');
    expect(within(article).getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      '1. Information We Collect',
      '2. How We Use Your Information',
      '3. Cookies and Similar Technologies',
      '4. How We Share Your Information',
      '5. Customer-Submitted Files and Custom Manufacturing',
      '6. Data Security',
      '7. Data Retention',
      '8. Your Rights and Requests',
      '9. Marketing Communications',
      '10. Third-Party Websites',
      '11. Children’s Information',
      '12. Changes to This Privacy Policy',
      '13. Grievance Officer',
      '14. Contact Us',
    ]);
    expect(within(article).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Information you provide to us', 'Payment information', 'Information collected automatically',
    ]);
    const sections = article.querySelectorAll('section');
    expect(sections).toHaveLength(14);
    expect(new Set(Array.from(sections, (section) => section.id)).size).toBe(14);
    expect(container.querySelectorAll('time[datetime="2026-09-19"]')).toHaveLength(2);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('preserves payment, sharing, custom-file, and security disclosures', () => {
    render(<PrivacyPolicy />);
    const article = screen.getByRole('article');
    expect(article).toHaveTextContent('We do not ask you to provide passwords, PINs, OTPs or other confidential payment credentials through email, phone or customer support.');
    expect(article).toHaveTextContent('We do not sell your personal information to third parties for their independent commercial use.');
    expect(article).toHaveTextContent('Where required to fulfil your order, Customer Materials may be accessed by relevant employees, contractors, manufacturing partners or service providers.');
    expect(article).toHaveTextContent('However, no method of transmitting or storing information over the internet can be guaranteed to be completely secure.');
    expect(screen.getByRole('link', { name: 'Terms & Conditions' })).toHaveAttribute('href', '/terms-conditions');
    expect(article).not.toHaveTextContent('biometric information');
  });

  it('preserves qualified rights, retention, marketing, and children’s information wording', () => {
    render(<PrivacyPolicy />);
    const article = screen.getByRole('article');
    expect(article).toHaveTextContent('Subject to applicable law, you may request to:');
    expect(article).toHaveTextContent('withdraw consent where processing is based on consent; and');
    expect(article).toHaveTextContent('We may need to verify your identity before processing certain requests.');
    expect(article).toHaveTextContent('Certain information may need to be retained for longer periods where required by law or necessary to establish, exercise or defend legal claims.');
    expect(article).toHaveTextContent('Transactional and service-related communications, such as order confirmations, shipping updates and important account notifications, may continue where necessary.');
    expect(article).toHaveTextContent('We do not knowingly collect personal information from children in circumstances where such collection is prohibited by applicable law.');
    expect(article).toHaveTextContent('Where required by applicable law, we will provide additional notice of material changes.');
  });

  it('fills contact placeholders and provides grievance details and page metadata', () => {
    const { container } = render(<PrivacyPolicy />);
    expect(screen.getByText('Mr. Sparsh Jain')).toBeInTheDocument();
    expect(screen.getByText('Founder')).toBeInTheDocument();
    expect(screen.getByText('Monday–Saturday, 9:00 AM–6:00 PM')).toBeInTheDocument();
    expect(screen.getAllByText('Plot No. 685, Saini Mohalla, Nangloi, New Delhi – 110041')).toHaveLength(2);
    const emailLinks = screen.getAllByRole('link', { name: 'supplychain@scribbl3d.com' });
    expect(emailLinks).toHaveLength(3);
    emailLinks.forEach((link) => expect(link).toHaveAttribute('href', 'mailto:supplychain@scribbl3d.com'));
    const phoneLinks = screen.getAllByRole('link', { name: '+91 9599523434' });
    expect(phoneLinks).toHaveLength(2);
    phoneLinks.forEach((link) => expect(link).toHaveAttribute('href', 'tel:+919599523434'));
    expect(container.textContent).not.toMatch(/\[DD MONTH YYYY\]|\[LEGAL ENTITY NAME\]|\[EMAIL ADDRESS\]|\[PRIVACY \/ GRIEVANCE EMAIL\]|\[LINK:/);
    expect(privacyMetadata.alternates).toEqual({ canonical: '/privacy-policy' });
    expect(privacyMetadata.title).toBe('Privacy Policy');
  });
});

describe('Shipping Policy', () => {
  it('renders all nine sections and dates without duplicate navigation', () => {
    const { container } = render(<ShippingPolicy />);
    expect(screen.getByRole('heading', { level: 1, name: 'Shipping Policy' })).toBeInTheDocument();
    const article = screen.getByRole('article');
    expect(within(article).getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      '1. Delivery Locations',
      '2. Order Processing and Delivery',
      '3. Shipping Charges',
      '4. Tracking',
      '5. Failed or Undelivered Orders',
      '6. Damaged Shipments',
      '7. Delivery Delays',
      '8. Custom Orders',
      '9. Contact',
    ]);
    const sections = article.querySelectorAll('section');
    expect(sections).toHaveLength(9);
    expect(new Set(Array.from(sections, (section) => section.id)).size).toBe(9);
    expect(container.querySelectorAll('time[datetime="2026-09-19"]')).toHaveLength(2);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('uses the seven-day estimate, India delivery coverage, and qualified shipping charges', () => {
    render(<ShippingPolicy />);
    const article = screen.getByRole('article');
    expect(article).toHaveTextContent('We currently ship Products to locations within India.');
    expect(article).toHaveTextContent('Standard orders are generally delivered within 7 days from order confirmation and/or payment, subject to product availability, location and courier service conditions.');
    expect(article).toHaveTextContent('Delivery timelines are estimates and may vary depending on the destination and circumstances affecting the shipment.');
    expect(article).toHaveTextContent('Standard shipping charges are included in the displayed Product price, unless otherwise stated.');
    expect(article).toHaveTextContent('Customers requesting faster or expedited shipping, including air shipping, may be required to pay additional shipping charges.');
    expect(article).toHaveTextContent('Any applicable additional charges will be communicated before the expedited shipment is processed.');
    expect(article).not.toHaveTextContent('5 days');
  });

  it('preserves failed-delivery conditions, damage reporting, and custom-order timelines', () => {
    render(<ShippingPolicy />);
    const article = screen.getByRole('article');
    expect(article).toHaveTextContent('Customers are responsible for ensuring that their delivery address and contact information are accurate.');
    expect(article).toHaveTextContent('A refund will not automatically be issued for an undelivered or refused shipment unless there is a valid reason for the refund and the claim is supported by the applicable courier or logistics policy.');
    expect(article).toHaveTextContent('For products damaged during transit, please contact supplychain@scribbl3d.com within 48 hours of delivery with:');
    expect(screen.getByText('Order number', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('photographs/videos of the package and Product; and')).toBeInTheDocument();
    expect(article).toHaveTextContent('Where a delay occurs, we will make reasonable efforts to assist the Customer and coordinate with the relevant logistics partner.');
    expect(article).toHaveTextContent('Customised Products, prototypes and manufacturing orders may have production and delivery timelines different from standard Products.');
    expect(article).toHaveTextContent('The applicable timeline will be communicated in the relevant quotation, order confirmation or project communication.');
  });

  it('fills placeholders and links to returns, refunds, and shipping support', () => {
    const { container } = render(<ShippingPolicy />);
    const emailLinks = screen.getAllByRole('link', { name: 'supplychain@scribbl3d.com' });
    expect(emailLinks).toHaveLength(2);
    emailLinks.forEach((link) => expect(link).toHaveAttribute('href', 'mailto:supplychain@scribbl3d.com'));
    expect(screen.getByRole('link', { name: '+91 9599523434' })).toHaveAttribute('href', 'tel:+919599523434');
    expect(screen.getByRole('link', { name: 'Returns Policy' })).toHaveAttribute('href', '/return-policy');
    expect(screen.getByRole('link', { name: 'Refund Policy' })).toHaveAttribute('href', '/refund-policy');
    expect(container.textContent).not.toMatch(/\[DD MONTH YYYY\]|\[SUPPORT EMAIL\]|\[PHONE NUMBER\]|\[LINK:/);
    expect(shippingMetadata.alternates).toEqual({ canonical: '/shipping-policy' });
    expect(shippingMetadata.title).toBe('Shipping Policy');
  });
});
