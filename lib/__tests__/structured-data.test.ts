import { buildBreadcrumbJsonLd, buildProductJsonLd, jsonLdString } from '../metadata';

const base = {
  name: 'PLA Silk Gold',
  url: 'https://www.scribbl3d.com/filament/pla-silk-gold',
  returnPolicy: 'standard' as const,
};

describe('buildProductJsonLd', () => {
  it('omits the Product when no variant has a positive price', () => {
    expect(buildProductJsonLd({ ...base, offers: [{ price: 0, inStock: true }, { price: null, inStock: true }] })).toBeNull();
  });

  it('omits an empty image list', () => {
    expect(buildProductJsonLd({ ...base, images: [], offers: [{ price: 100, inStock: true }] })).not.toHaveProperty('image');
  });

  it('publishes a single Product with one Offer for one priced variant', () => {
    const data: any = buildProductJsonLd({ ...base, sku: 'p1', offers: [{ price: 899, inStock: true, sku: 'v1' }, { price: 0, inStock: true }] });
    expect(data['@type']).toBe('Product');
    expect(data.offers).toMatchObject({ '@type': 'Offer', price: 899, priceCurrency: 'INR', availability: 'https://schema.org/InStock' });
  });

  it('publishes variants as a ProductGroup with per-variant offers', () => {
    const data: any = buildProductJsonLd({
      ...base,
      sku: 'fil1',
      color: 'Gold',
      variesBy: ['size'],
      offers: [
        { price: 899, inStock: true, sku: 'v1', size: '1.75mm 1Kg' },
        { price: 2699, inStock: false, sku: 'v2', size: '1.75mm 3Kg' },
        { price: 0, inStock: true, sku: 'v3', size: 'broken' },
      ],
    });
    expect(data['@type']).toBe('ProductGroup');
    expect(data.productGroupID).toBe('fil1');
    expect(data.variesBy).toEqual(['https://schema.org/size']);
    expect(data.hasVariant).toHaveLength(2);
    expect(data.hasVariant[0]).toMatchObject({ '@type': 'Product', sku: 'v1', size: '1.75mm 1Kg', offers: { price: 899 } });
    expect(data.hasVariant[1].offers.availability).toBe('https://schema.org/OutOfStock');
    expect(data.hasVariant[0]).not.toHaveProperty('color');
  });

  it('adds free shipping within India to every offer', () => {
    const data: any = buildProductJsonLd({ ...base, offers: [{ price: 100, inStock: true }] });
    expect(data.offers.shippingDetails).toMatchObject({
      shippingRate: { value: 0, currency: 'INR' },
      shippingDestination: { addressCountry: 'IN' },
      deliveryTime: {
        handlingTime: { minValue: 0, maxValue: 2, unitCode: 'DAY' },
        transitTime: { minValue: 3, maxValue: 5, unitCode: 'DAY' },
      },
    });
  });

  it.each([
    ['standard', 'https://schema.org/MerchantReturnFiniteReturnWindow'],
    ['printer', 'https://schema.org/MerchantReturnNotPermitted'],
    ['customised', 'https://schema.org/MerchantReturnNotPermitted'],
  ] as const)('maps the %s return policy', (returnPolicy, category) => {
    const data: any = buildProductJsonLd({ ...base, returnPolicy, offers: [{ price: 100, inStock: true }] });
    expect(data.offers.hasMerchantReturnPolicy).toMatchObject({ applicableCountry: 'IN', returnPolicyCategory: category });
    if (returnPolicy === 'standard') expect(data.offers.hasMerchantReturnPolicy.merchantReturnDays).toBe(10);
    else expect(data.offers.hasMerchantReturnPolicy).not.toHaveProperty('merchantReturnDays');
  });

  it('includes a rating only when reviews exist', () => {
    const offers = [{ price: 100, inStock: true }];
    expect(buildProductJsonLd({ ...base, offers, rating: { average: null, count: 0 } })).not.toHaveProperty('aggregateRating');
    const data: any = buildProductJsonLd({ ...base, offers, rating: { average: 4.333, count: 3 } });
    expect(data.aggregateRating).toMatchObject({ ratingValue: 4.3, reviewCount: 3, bestRating: 5 });
  });

  it('drops empty properties and defaults the brand', () => {
    const data: any = buildProductJsonLd({ ...base, offers: [{ price: 100, inStock: true }], properties: [{ name: 'Finish', value: '' }, { name: 'Material', value: 'PLA' }] });
    expect(data.additionalProperty).toEqual([{ '@type': 'PropertyValue', name: 'Material', value: 'PLA' }]);
    expect(data.brand).toEqual({ '@type': 'Brand', name: 'Scribbl3D' });
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('resolves relative URLs against the site base URL', () => {
    const data = buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Printers', url: 'https://www.scribbl3d.com/printers' }]);
    const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');
    expect(data.itemListElement[0]).toMatchObject({ position: 1, item: `${siteUrl}/` });
    expect(data.itemListElement[1]).toMatchObject({ position: 2, item: 'https://www.scribbl3d.com/printers' });
  });
});

describe('jsonLdString', () => {
  it('escapes "<" so stored content cannot close the script tag', () => {
    const out = jsonLdString({ description: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(JSON.parse(out).description).toBe('</script><script>alert(1)</script>');
  });
});
