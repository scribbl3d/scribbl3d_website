import { getPDPUrl } from '../product-utils';

describe('product-utils', () => {
  describe('getPDPUrl', () => {
    describe('printer type', () => {
      it('should return printer URL with slug', () => {
        expect(getPDPUrl('printer', 'elegoo-mars-3', 'id123')).toBe(
          '/printers/elegoo-mars-3'
        );
      });

      it('should return printer URL with slug (case insensitive)', () => {
        expect(getPDPUrl('PRINTER', 'elegoo-mars-3', 'id123')).toBe(
          '/printers/elegoo-mars-3'
        );
      });

      it('should return printer URL with slug (mixed case)', () => {
        expect(getPDPUrl('Printer', 'elegoo-mars-3', 'id123')).toBe(
          '/printers/elegoo-mars-3'
        );
      });

      it('should return null when no slug for printer', () => {
        expect(getPDPUrl('printer', null, 'id123')).toBeNull();
      });

      it('should return null when empty slug for printer', () => {
        expect(getPDPUrl('printer', '', 'id123')).toBeNull();
      });
    });

    describe('product type', () => {
      it('should return product URL with slug', () => {
        expect(getPDPUrl('product', 'pla-filament', 'id123')).toBe(
          '/products/pla-filament'
        );
      });

      it('should return product URL with id when no slug', () => {
        expect(getPDPUrl('product', null, 'id123')).toBe('/products/id123');
      });

      it('should return product URL with id when empty slug', () => {
        expect(getPDPUrl('product', '', 'id123')).toBe('/products/id123');
      });

      it('should return product URL with slug (case insensitive)', () => {
        expect(getPDPUrl('PRODUCT', 'pla-filament', 'id123')).toBe(
          '/products/pla-filament'
        );
      });

      it('should return null when no slug and no id', () => {
        expect(getPDPUrl('product', null, undefined)).toBeNull();
      });
    });

    describe('resin type', () => {
      it('should return resin URL with slug', () => {
        expect(getPDPUrl('resin', 'abs-like-resin', 'id123')).toBe(
          '/resins/abs-like-resin'
        );
      });

      it('should return resin URL with id when no slug', () => {
        expect(getPDPUrl('resin', null, 'id123')).toBe('/resins/id123');
      });

      it('should return resin URL with id when empty slug', () => {
        expect(getPDPUrl('resin', '', 'id123')).toBe('/resins/id123');
      });

      it('should return resin URL with slug (case insensitive)', () => {
        expect(getPDPUrl('RESIN', 'abs-like-resin', 'id123')).toBe(
          '/resins/abs-like-resin'
        );
      });

      it('should return null when no slug and no id', () => {
        expect(getPDPUrl('resin', null, undefined)).toBeNull();
      });
    });

    describe('prebuilt type', () => {
      it('should return prebuilt URL with slug', () => {
        expect(getPDPUrl('prebuilt', 'custom-miniature', 'id123')).toBe(
          '/prebuilt-products/custom-miniature'
        );
      });

      it('should return prebuilt URL with id when no slug', () => {
        expect(getPDPUrl('prebuilt', null, 'id123')).toBe(
          '/prebuilt-products/id123'
        );
      });

      it('should return prebuilt URL with id when empty slug', () => {
        expect(getPDPUrl('prebuilt', '', 'id123')).toBe('/prebuilt-products/id123');
      });

      it('should return prebuilt URL (case insensitive)', () => {
        expect(getPDPUrl('PREBUILT', 'custom-miniature', 'id123')).toBe(
          '/prebuilt-products/custom-miniature'
        );
      });

      it('should return null when no slug and no id', () => {
        expect(getPDPUrl('prebuilt', null, undefined)).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should return null for unknown item type', () => {
        expect(getPDPUrl('unknown', 'some-slug', 'id123')).toBeNull();
      });

      it('should return null for undefined item type', () => {
        expect(getPDPUrl(undefined, 'some-slug', 'id123')).toBeNull();
      });

      it('should return null for empty item type', () => {
        expect(getPDPUrl('', 'some-slug', 'id123')).toBeNull();
      });

      it('should return null when all parameters are undefined', () => {
        expect(getPDPUrl(undefined, undefined, undefined)).toBeNull();
      });

      it('should return null when slug and id are both undefined', () => {
        expect(getPDPUrl('product', undefined, undefined)).toBeNull();
      });

      it('should handle special characters in slug', () => {
        expect(getPDPUrl('product', 'item-with-special_chars', 'id123')).toBe(
          '/products/item-with-special_chars'
        );
      });

      it('should handle numbers in slug', () => {
        expect(getPDPUrl('product', 'item-123', 'id456')).toBe('/products/item-123');
      });

      it('should handle UUID as id', () => {
        const uuid = '550e8400-e29b-41d4-a716-446655440000';
        expect(getPDPUrl('product', null, uuid)).toBe(`/products/${uuid}`);
      });
    });
  });
});
