import { salePriceError } from '@/lib/admin/priceValidation';

describe('salePriceError', () => {
  it('requires the price to be lower than the MRP when an MRP is set', () => {
    expect(salePriceError('499', '699')).toBeNull();
    expect(salePriceError('699', '699')).toMatch(/lower than the original price/);
    expect(salePriceError('799', '699')).toMatch(/lower than the original price/);
  });

  it('ignores an empty or zero MRP and an empty price', () => {
    expect(salePriceError('499', '')).toBeNull();
    expect(salePriceError('499', 0)).toBeNull();
    expect(salePriceError('', '699')).toBeNull();
  });
});
