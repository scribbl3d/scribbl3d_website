# Review System — Changelog

Development log for the review system. Requirements: [`REVIEW_SYSTEM_PRD.md`](./REVIEW_SYSTEM_PRD.md). Kept until the full review system is developed and tested.

## Status

| Stage | Status |
| --- | --- |
| Requirements (PRD) | Done |
| Data model | Done — applied to development DB |
| Delivery-date recording + backfill | Done — applied to development DB |
| Review link page + admin Delivered-tab actions | Not started |
| PDP display + SEO | Not started |
| Coupons + emails + My coupons | Not started |
| Admin review management + moderation | Not started |
| Expiry-reminder cron job | Not started (last) |
| Remove old `Review` / `OrderFeedback` | Not started (after consumers replaced) |

## 2026-10-08 — Delivery date

### Added
- `lib/reviews/deliveredAt.ts` — reads the delivered time from Delhivery tracking JSON (`DeliveryDate` → Delivered status time → latest Delivered scan); timestamps without an offset are treated as IST.
- `scripts/backfill-delivered-at.ts` — one-time backfill of `Order.deliveredAt`. Dry run by default (counts only); `--apply` writes. Sources: tracking data (latest across MPS waybills) → `lastSyncedAt` → `updatedAt`; orders without shipments stay empty. Rejects dates before the order or in the future.
- `lib/__tests__/review-delivered-at.test.ts` — 8 tests.

### Changed
- `Order.deliveredAt` is now set once (only while empty) when an order becomes delivered:
  - `app/api/internal/sync-shipment/route.ts` and `app/api/internal/sync-shipments/route.ts` — Delhivery delivered time, falling back to now.
  - `app/api/admin/orders/[orderId]/route.ts` — time of the admin status change.

### Verification
- Focused tests: 8/8 passed. `npx tsc --noEmit --incremental false`: 0 errors.
- Backfill dry run on development DB: 2 delivered orders missing `deliveredAt`, both resolvable from tracking data; 0 rejected.
- IST assumption checked against data: Delhivery delivered times read as IST fall minutes to ~1.5 h before our UTC `lastSyncedAt`; read as UTC they would be after it.
- Backfill applied (`--apply`) on development DB: 2 orders updated. Re-run dry run: 2 with `deliveredAt`, 0 missing.

### Notes
- Development and production share one database, so the schema change and backfill are already applied to production.
- `scripts/backfill-delivered-at.ts` removed after the run (it was never committed). Orders delivered between the backfill and the deploy may lack `deliveredAt`; they are treated like pre-launch orders (coupon window from first admin share).
- Testing approach: same database; before each test step, list exactly what will be written, then clean it up.

## 2026-10-08 — Data model

### Added
- `docs/REVIEW_SYSTEM_PRD.md` — finalised requirements, user flows, technical considerations.
- Prisma schema (`prisma/schema.prisma`), additive only:
  - `Order.deliveredAt` (nullable).
  - `Discount.userId` (nullable) + index — customer-locked coupons.
  - Enums `ReviewStatus` (`PENDING`, `APPROVED`, `HIDDEN`) and `ReviewItemType` (`printer`, `filament`, `resin`, `prebuilt`).
  - Models `ReviewRequest`, `ProductReview`, `ReviewReward`.
- Cart-flow order item snapshots now store `productId`, `variantId` (filament variant / prebuilt variant / resin weight) and `colourId` (resin) — `app/api/create-order/route.ts`.

### Database
- Applied to the development database with `prisma db push` (no migration file). Pre-check confirmed no drift and an additive-only diff.

### Notes
- Buy-now flow (`mode=buynow`) left unchanged: no caller links to it and its items carry no `itemType`. Its items will fall back to name matching like legacy orders.
- Production will need the same schema applied (`db push` or a migration created at that time).
