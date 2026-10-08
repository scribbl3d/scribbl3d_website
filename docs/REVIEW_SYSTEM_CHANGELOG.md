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

## 2026-10-08 — Admin and internal API security

### Fixed
- `app/api/admin/orders/[orderId]/route.ts` — PATCH (status update, which now also sets `deliveredAt`) and DELETE had no admin check. Both now require a verified admin session (`isAdminRequest`) and return 401 before any database access. Only the ops dashboard calls them.
- `__tests__/admin-order-api.test.ts` — 2 tests (401 without admin; verified admin marks delivered and sets `deliveredAt` once).

### Fixed — all `/api/admin` and `/api/internal` routes
- `middleware.ts` — every `/api/admin/*` and `/api/internal/*` route now requires a verified, same-origin admin session (401 otherwise). Exceptions that check access themselves:
  - `/api/admin/login`, `/api/admin/logout` — public.
  - `/api/admin/orders/[orderId]/cancel` — admin, or the owning customer while the order is cancellable. `cancelledBy` is decided server-side (no longer from the request body). A second cancel returns 409 so no duplicate PhonePe refund is sent. Previously anyone could cancel any order and trigger a refund.
  - `/api/internal/cancel-shipment` — owning customer (existing) plus the same cancellable-stage rule.
  - `/api/internal/calculate-shipping` — signed-in customer or admin.
  - `/api/internal/sync-shipment` — internal token or admin. `lib/shipment/triggerSync.ts` and `app/api/admin/orders/route.ts` send the token.
- `lib/internal-auth.ts` — server-to-server token derived from `NEXTAUTH_SECRET` (HMAC; the secret itself is never sent).
- `lib/orders/cancellation.ts` — server mirror of the customer cancel rule on `app/profile/orders/[orderId]/page.tsx`.
- Tests: `__tests__/admin-api-protection.test.ts` (25), `__tests__/order-cancel-api.test.ts` (6).

### Verification
- Full Jest suite: 27 suites, 474 passed, 1 skipped. `npx tsc --noEmit --incremental false`: 0 errors. Lint not run: ESLint 9 cannot read the legacy `.eslintrc.json` (known tooling issue).
- Local dev server, anonymous requests: all 14 tested admin/internal routes returned 401; `/api/announcements` returned 200. `sync-shipment` with the internal token for a non-existent order returned `{"skipped":true}` (no writes).
- Not tested: signed-in admin flows in the ops dashboard and a signed-in customer cancel (no credentials used).

### Known issues (not fixed)
- Pre-existing Next.js 15 warning: `/api/admin/orders/[orderId]/cancel` reads `params.orderId` without awaiting `params`.
- `/api/status` and `/api/status/[id]` (legacy PhonePe status redirects, no database writes) left unchanged.

### Fixed — management routes outside `/api/admin`
- `middleware.ts` — per-method admin rules (`ADMIN_METHODS_OUTSIDE_ADMIN_API`). Customer/public methods stay open.

| Route | Admin-only | Still public |
| --- | --- | --- |
| `/api/discounts` | POST, GET `?admin=true` (listed hidden codes) | GET (cart coupon list) |
| `/api/discounts/[id]` | all (`/apply` excluded) | `/api/discounts/apply` |
| `/api/about-hero`, `/api/partners` | writes; `/api/partners/[id]` all | GET |
| `/api/available-colors`, `/api/upload` | writes | GET (available-colors) |
| `/api/form-responses`, `/api/personalise-form`, `/api/prototyping-request`, `/api/small-batch-manufacturing` | GET (listed customer submissions), `[id]` all | POST (customer forms) |
| `/api/stock-notifications` | GET, PATCH, DELETE | POST (customer subscribe) |

Previously anyone could create/edit/delete discount codes, list hidden codes, and read all customer form submissions.

### Added — admin session-expired toast
- `app/ops/control/_components/AdminSessionWatcher.tsx`, mounted in `app/ops/control/layout.tsx`. When an ops-page API call returns 401 (not the login API), shows one persistent toast: "Your admin session has expired" with a **Log in again** button that opens the login page in a new tab, so unsaved work is kept. Shown 500 ms after the response so it replaces the page's own generic error toast (toast limit is 1).
- Tests: `components/__tests__/AdminSessionWatcher.test.tsx` (5); `__tests__/admin-api-protection.test.ts` extended to 54.

### Verification
- Full Jest suite: 28 suites, 508 passed, 1 skipped. `tsc`: 0 errors.
- Local dev server, anonymous: 12 management actions returned 401; public GETs for discounts, about-hero, partners returned 200.
- Toast verified manually in the browser by the user (deleted `admin_token`, then triggered an action): shown as expected.

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
