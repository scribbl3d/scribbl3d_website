# Large File Analysis & Refactoring Plan

## Files with Highest Line Counts

| File | Lines | Extractable Components |
|------|-------|----------------------|
| `app/cart/shopping-cart.tsx` | 1980 | 8+ components, 6+ utils |
| `app/prebuilt-products/[slug]/page.tsx` | 1924 | 7+ components |
| `app/ops/control/printers/new/page.tsx` | 1779 | Form sections |
| `app/ops/control/printers/[id]/edit/page.tsx` | 1773 | Form sections |
| `app/services/_component/Form3d.tsx` | 1551 | Form fields |
| `app/ops/control/resins/new/page.tsx` | 1397 | Form sections |
| `app/resins/[slug]/page.tsx` | 1212 | Multiple components |
| `app/printers/[slug]/page.tsx` | 1194 | Multiple components |
| `components/prebuilt-products/PrebuiltProductGrid.tsx` | 1143 | Grid logic |

## Extraction Opportunities

### Priority 1: shopping-cart.tsx (1980 lines → Target: 800 lines)

**Extractable Utilities** (~100 lines):
- `safeNum()`, `formatINR()`, `safeLineTotal()`, `safeSubtotal()` → `lib/cart-utils.ts`
- `getPDPUrl()` → `lib/product-utils.ts`
- `buildValueLabel()`, `buildDescription()` → `lib/discount-utils.ts`

**Extractable Components** (~900 lines):
1. `DiscountAmountDisplay` → `app/cart/components/DiscountAmountDisplay.tsx`
2. `CouponCard` → `app/cart/components/CouponCard.tsx`
3. `CouponModal` → `app/cart/components/CouponModal.tsx`
4. `ProductSuggestionCard` → `app/cart/components/ProductSuggestionCard.tsx`
5. `ProductCarousel` → `app/cart/components/ProductCarousel.tsx`
6. `CartItemCard` → `app/cart/components/CartItemCard.tsx`

**Expected Reduction**: 1000+ lines saved

### Priority 2: prebuilt-products/[slug]/page.tsx (1924 lines → Target: 600 lines)

**Extractable Components** (~800 lines):
1. `Shimmer` → Use existing or create `components/shared/Shimmer.tsx`
2. `PDPSkeleton` → `components/shared/PDPSkeleton.tsx`
3. `ShieldCheckIcon`, `TruckIcon` → `components/shared/icons.tsx`
4. `NotifyMeModal` → Already exists in shared
5. `SimilarProductCard` → `app/prebuilt-products/components/SimilarProductCard.tsx`
6. `SimilarProductsCarousel` → `app/prebuilt-products/components/SimilarProductsCarousel.tsx`

**Expected Reduction**: 800+ lines saved

### Priority 3: Product Detail Pages (Combined ~3600 lines → Target: 1800 lines)

**Common Pattern**: All 3 product detail pages share similar structure
- `app/resins/[slug]/page.tsx` (1212 lines)
- `app/printers/[slug]/page.tsx` (1194 lines)
- `app/prebuilt-products/[slug]/page.tsx` (1924 lines)

**Shared Components to Create**:
1. `ProductImageGallery` component
2. `ProductPricing` component
3. `ProductVariantSelector` component
4. `ProductActions` component (Add to Cart, Wishlist)
5. `ProductInfo` component
6. `SimilarProducts` carousel

**Expected Reduction**: 1200+ lines saved

### Priority 4: Form Pages (Combined ~8000 lines → Target: 4000 lines)

**Admin Form Pages** (all share similar patterns):
- OPS control forms for printers, resins, products
- Service request forms

**Shared Form Components to Create**:
1. `FormSection` wrapper
2. `ImageUploadField`
3. `RichTextEditor` wrapper
4. `AttributeManager` component
5. `VariantManager` component

**Expected Reduction**: 2000+ lines saved

## Implementation Strategy

### Phase 1: Cart Refactoring (Immediate)
- Extract cart utilities
- Extract cart components
- Reduce shopping-cart.tsx to ~800 lines

### Phase 2: Product Pages (Next)
- Extract common PDP components
- Refactor all 3 product detail pages
- Create shared product components library

### Phase 3: Form Consolidation (Future)
- Create shared form component library
- Refactor admin forms
- Refactor service forms

## Expected Total Impact

| Metric | Before | After | Saved |
|--------|--------|-------|-------|
| Total Lines (Top 10 files) | 14,550 | 8,800 | 5,750 |
| Largest File Size | 1,980 lines | 800 lines | 1,180 lines |
| Reusable Components | Few | 40+ | - |
| Code Duplication | High | Minimal | - |

## Benefits

✅ **Readability**: Easier to understand each file's purpose  
✅ **Maintainability**: Changes in one place affect all uses  
✅ **Testability**: Smaller components easier to test  
✅ **Reusability**: Components can be used across the app  
✅ **Performance**: Better code splitting opportunities  
