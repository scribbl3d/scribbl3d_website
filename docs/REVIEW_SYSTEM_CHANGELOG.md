# Review System — Changelog

Development log for the review system. Requirements: [`REVIEW_SYSTEM_PRD.md`](./REVIEW_SYSTEM_PRD.md). Kept until the full review system is developed and tested.

## Status

| Stage | Status |
| --- | --- |
| Requirements (PRD) | Done |
| Data model | Done — applied to development DB |
| Delivery-date recording + backfill | Done — applied to development DB |
| Review link + review page (stage 1) | Done |
| Admin Delivered-tab actions + delivered email link (stage 2) | Done — admin UI check by user pending |
| PDP display + JSON-LD (stage 4) | Done — verified with real data |
| Google Merchant product ratings feed | Deferred (later stage, once review volume allows) |
| Public display of order-level reviews | Done — homepage "What Our Customers Say" |
| Coupons + coupon email + My coupons (stage 5) | Done — end-to-end test with a real order pending |
| Admin review management + moderation (stage 3) | Done — admin UI check by user pending |
| Expiry-reminder cron job | Not started (last) |
| Remove old `Review` / `OrderFeedback` | Not started (after consumers replaced) |

## 2026-10-11 — Order-level reviews on the homepage

- Incentivised label removed from public product-page and homepage reviews (user decision); the flag is still stored and shown in admin.

- `lib/reviews/homepageReviews.ts` — approved overall-experience reviews with written text (newest first, up to 20) are mapped to the homepage testimonial card (full name, "Verified customer", initials, rating; no incentivised label on the homepage, per user) and shown **before** the Admin → Landing testimonials (copied from Google reviews, kept in their sort order). `app/page.tsx` merges them; a failure falls back to the managed testimonials only.
- Admin approval controls what appears (any approved rating). Rating-only reviews (no text) are not shown.
- Also this session: review details dialog no longer shows "Delivered email"; share dialog closes after copying; Profile → Coupons "Use in cart" applies the code (`/cart?coupon=`); the cart's coupon modal lists the customer's own personal coupons and always shows the applied coupon; admin Reviews page redesigned (Back link, tabs with icons and counts, All first, low-ratings alert only when > 0, richer cards).
- Tests: `lib/__tests__/homepage-reviews.test.ts` (3), `__tests__/discounts-list-api.test.ts` (3) and updated page/component tests.

## 2026-10-10 — Stage 5: review coupons

### Added
- `lib/reviews/rewards.ts` — `issueReviewReward`: one coupon per order on the first submission of any kind (order-level or product), only within 15 days of the window start (`ReviewRequest.couponWindowStartsAt`; post-launch orders fall back to `deliveredAt`; pre-launch orders never shared have no window). Creates a hidden `Discount` (`REV` + 8 characters, 5%, `maxDiscount` 500, no minimum, `maxUsesPerUser` 1, `userId` = customer, expires 15 days after the review) and a `ReviewReward`; marks all of the order's reviews `isIncentivised` (also later ones). Concurrency-safe via the unique `ReviewReward.orderId`; retries on a code collision. `rewardReviewSubmission` issues + emails and never fails the review. `cancelReviewReward` (C7).
- `lib/email/templates/reviewCoupon.ts` + `sendReviewCouponEmail` — thank-you + coupon email in the user's wording (code, "5% upto 500 rupees", review date, expiry date, **Shop SCRIBBL3D**). Sent to the account email.
- `lib/reviews/customerCoupons.ts`, `app/profile/_components/my-coupons.tsx` — profile **Coupons** tab (`/profile?tab=coupons`, sidebar + mobile nav): code, Active/Used/Expired/Cancelled, value, source order, expiry, **Copy** and **Use in cart**.

### Changed
- `POST /api/review-links/[token]` issues the coupon after the reviews are saved.
- `validateDiscountEligibility` — customer-locked coupons only work for their owner ("Please log in" / "not valid for your account").
- `POST /api/create-order` — re-checks `discountCode` server-side (active, not expired, usage limits, owner) and rejects ineligible codes.
- Order cancel route — cancels the order's review coupon when a refund is initiated.

### Verification
- Tests: `lib/__tests__/review-rewards.test.ts`, `lib/__tests__/discount-owner.test.ts`, `components/__tests__/MyCoupons.test.tsx`, plus route-test updates (29 new). Full suite: 43 suites, 678 passed, 1 skipped (+ 5 in `MyCoupons.test.tsx`). `tsc`: 0 errors.
- Coupon email rendered locally and screenshotted (not sent).
- Not tested end to end (would create a real coupon and send a real email).

### Follow-up (2026-10-10)
- Coupon email: "We’ve attached your SCRIBBL3D coupon to this email." → "We’ve added your SCRIBBL3D coupon below." (user-approved).
- `POST /api/create-order` now recalculates the discount from server-side item prices (same rules as `CartProvider` + `calculateDiscount`, including item-type scoping) and rejects the order if the submitted `discountAmount` differs by more than ₹0.01, or if an amount is sent without a code. Tests: `__tests__/create-order-discount.test.ts` (7). Full suite: 45 suites, 690 passed, 1 skipped. `tsc`: 0 errors.
- Release paused by the user until dev testing is complete (`REVIEW_LAUNCH_AT` to be set then).

### Known gaps
- `create-order` still trusts the browser's `subtotal`, `shippingPrice`, `tax` and `totalAmount`; only the discount is now verified. (Buy-now items also come from the browser; that flow appears unused.)
- Coupon expiry reminder (C10, 3 days before) needs the cron job (last stage).

## 2026-10-10 — Stage 4: reviews on product pages

### Added
- `lib/reviews/productReviews.ts` — approved-only review scope per family; filament reviews pooled across the colour group (`"<material> <finishType>"`, the same category the PDP uses for colour swatches); `summarize` (list from 2, average/count/breakdown from 5); newest-first pages of 5 with only public fields (no order/user/product IDs); `reviewsJsonLd` + `pdpJsonLdRating` (rating and visible reviews in JSON-LD only from 5).
- `GET /api/product-reviews?type=&id=&page=` — public "Load more"; empty below the 2-review threshold.
- `components/reviews/ProductReviews.tsx` — **Customer reviews** section (`#reviews`): average, "Based on N reviews" and 5★–1★ bars from 5 reviews; each review shows full name, Verified purchase, Incentivised label (when set), stars, date, "Bought: <variant>", tags and text; **Load more reviews**. `RatingSummaryInline` — "★ 4.6 (12 reviews)" under the product title from 5 reviews, linking to the section.
- `lib/metadata.ts` — `buildProductJsonLd` accepts `reviews` (emitted only with `aggregateRating`).

### Changed
- Printer, filament, resin and prebuilt PDPs fetch reviews server-side and pass `ratingSummary` / `reviewsSection` slots to their client components (reviews sit above "Similar products").
- Prebuilt PDP: removed the old `Review`-table average and review list (it showed an average from a single review).

### Verification
- Tests: `lib/__tests__/product-reviews.test.ts`, `__tests__/product-reviews-api.test.ts`, `components/__tests__/ProductReviews.test.tsx` (25). Full suite: 41 suites, 658 passed, 1 skipped. `tsc`: 0 errors.
- Local server: one PDP per family returns 200 with Product JSON-LD, no review section and no `aggregateRating` (no approved reviews yet).
- Visual check on the live database (user-approved): 6 approved 4–5★ test reviews added to one prebuilt product, page and JSON-LD checked (inline "4.7 (6 reviews)", section with breakdown and Load more, `aggregateRating` 4.7/6 with 5 `Review` entries), screenshots at 1280px and 500px, then all 6 deleted (0 `ProductReview` rows left; page back to no section/no rating).
- Deferred by user: Google Merchant product ratings feed (S2); public display of order-level reviews (stored only).

## 2026-10-10 — Stage 3: review moderation

### Added
- `lib/reviews/moderation.ts` — one newest-first list across `OrderReview` and `ProductReview` (filters: status, type, rating incl. "low" = 1–2★; 20 per page; product name from the order snapshot), `moderateReview` (approve: pending/hidden → approved; hide: → hidden; sets `moderatedAt`; never edits or deletes customer text), `getReviewModerationCounts`.
- Admin APIs (admin session required): `GET /api/admin/reviews`, `PATCH /api/admin/reviews/moderate` (`approve` | `hide` only).
- `/ops/control/reviews` — "All reviews" page: Pending / Approved / Hidden / All tabs, type and rating filters, review cards (stars, status, Overall/Product, **Low rating**, Incentivised, reviewer, order #, date, tags, text), **Approve** / **Hide** / **Show again**, pagination.
- Dashboard (`/ops/control`): **Reviews** card with the pending count badge and a red "N low ratings to review" line; `/api/admin/notification-counts` returns `reviews-pending` and `reviews-low-rating`.

### Verification
- Tests: `lib/__tests__/review-moderation.test.ts`, `__tests__/admin-review-moderation-api.test.ts`, `components/__tests__/AdminReviewsPage.test.tsx` (25). Full suite: 38 suites, 633 passed, 1 skipped. `tsc`: 0 errors.
- Local server: both new APIs return 401 without an admin session; `/ops/control/reviews` redirects to login.
- Not tested with an admin login.

## 2026-10-10 — Stage 2: sharing the review link

### Added
- `lib/reviews/requests.ts` — `getAdminReviewInfo` (status: `not_shared`, `shared`, `partial`, `reviewed`, `expired`, `not_eligible`, plus share history), `recordReviewShare` (count, first/last shared; sets `couponWindowStartsAt` = first share for pre-launch orders, delivery date for post-launch), `recordReviewEmailSent`, `buildReviewShareMessage` (short version of the delivered email).
- `lib/reviews/reviewableItems.ts` — `loadReviewContext(orderId)` (same rules as the link, for admin use).
- Admin APIs (admin session required): `GET /api/admin/reviews/status?orderIds=` (≤ 50, visible rows only), `POST /api/admin/reviews/share`, `GET /api/admin/reviews/[orderId]` (history + submitted reviews).
- Delivered tab: **Review** column (status badge) and actions — **Share link** / **Share again** / disabled **Reviewed**; hidden when the link is expired or the order is not eligible. Share opens a dialog with the WhatsApp message and **Copy message**. **Review details** dialog: email/share history, overall and product reviews (1–2★ highlighted). `app/ops/control/orders/components/ReviewActions.tsx`.

### Changed
- Delivered email (`lib/email/templates/orderDelivered.ts`) "Leave a Review" now opens the no-login review link instead of `/profile/orders/<id>`.
- Admin status email (`sendStatusEmail.ts`) delivered branch: fixed broken `https://scribbl3d.com/review` link → review link.
- Both record `ReviewRequest.emailSentAt` only when the send succeeded (`ok: true`).

### Verification
- Tests: `lib/__tests__/review-requests.test.ts`, `__tests__/admin-review-api.test.ts`, `components/__tests__/ReviewActions.test.tsx` (36). Full suite: 35 suites, 607 passed, 1 skipped. `tsc`: 0 errors.
- Local server: the three new admin routes return 401 without an admin session.
- Not tested: the Delivered tab with an admin login, and a real delivered email (no emails sent).

### Review request wording (user-supplied)
- WhatsApp message (`buildReviewShareMessage`): "Hi {first name}, / How was your SCRIBBL3D experience? / We’d love to hear your feedback. Leave a review and get a discount coupon for your next purchase. / 👉 {link} / It only takes a minute. Thank you for choosing SCRIBBL3D!"
- Delivered email review block (`reviewRequestBlock` in `orderDelivered.ts`, also used by the admin status email): "How was your experience?", five clickable gold stars, the coupon thank-you sentence, an indigo **Review your order** button, and "It only takes a few minutes." Each star links to `?rating=N`, which pre-selects the overall rating on the review page.
- Both promise a coupon; coupons are live from stage 5, so stage 2 can ship together with stage 5.
- Verified: email rendered locally and screenshotted (not sent); 608 tests pass.

### Notes
- `REVIEW_LAUNCH_AT` must be set at release. While it is unset every order counts as pre-launch, so the coupon window only starts at the first admin share (relevant for stage 5).

## 2026-10-10 — Stage 1: mockup-based redesign and consent

### Changed
- Review page rebuilt to the user's mockup, in site indigo: "Share your experience" header with a stars illustration; overall-experience card (large stars, rating message such as "Great to hear!", order tags, comment); "Review your products (optional)" with a progress bar; collapsible product cards (collapsed: Verified Purchase badge, stars, **Review this product**; expanded: rating left / text right on desktop, tags below); green **Reviewed** badge for submitted items, indigo **Rated** for in-progress ones; consent + centred Submit at the bottom. Text without a star rating is flagged instead of being dropped.
- Rating messages (UI copy, change freely): 1 "We're sorry to hear that", 2 "Thanks for letting us know", 3 "Thanks for your feedback", 4 "Great to hear!", 5 "Awesome, glad you loved it!".

### Added
- Required consent (mockup wording, "Learn more" → `/terms-conditions`). API rejects submissions without `consent: true`; `consentedAt` stored on `ProductReview` and `OrderReview` (additive columns — **needs `npx prisma db push`**, together with `OrderReview`).

### Visual polish (second pass, checked with headless-Chrome screenshots of the local page)
- Tinted page background, bolder 48px heading, header illustration redrawn as a single SVG (bubble with built-in tail, evenly spaced stars, sparkles radiating from the corner, soft indigo circle), extra-large stars for the overall rating (new `xl` size in `components/ui/star-rating.tsx`), softer card shadows, green progress bar, product images on a light tile with `object-contain`, product card as a grid so the expanded panel sits beside the image on desktop and spans full width on mobile (rendered once), indigo-tinted selected tags, button glow.

### Rating-based tags
- Tags now depend on the star rating (`lib/reviews/tags.ts`: `ratingBand`, `getOrderTags`, `getProductTags`): 4–5★ positives ("What stood out?"), 3★ could-be-better ("What could be better?"), 1–2★ problems ("What went wrong?"). Tags appear once a rating is chosen; changing the rating drops tags that no longer fit. The API validates tags against the submitted rating. Tag wording proposed by Claude and approved by the user (2026-10-10), US spelling kept. The old profile feedback modal still uses its original lists.

### Mobile layout fixes
- Expand/collapse arrow moved to each card's top-right corner (all sizes); "Rated"/"Reviewed" badges sit beside "Verified Purchase" instead of on their own row. The tag section ("What stood out?" etc.) is hidden until a star rating is chosen. Checked with headless-Chrome screenshots at 500px (mobile layout) and 1280px.

### Decisions
- Photo/video upload from the mockup deferred (not in this stage). Tags kept. Indigo instead of the mockup's black.

### Verification
- Full Jest suite: 32 suites, 564 passed, 1 skipped. `tsc`: 0 errors. Not yet checked visually or against the database.

## 2026-10-08 — Stage 1: order-level review and redesign

### Added
- `OrderReview` model (one per order: rating, order tags, comment ≤ 2,000, reviewer name, incentivised flag, `PENDING`/`APPROVED`/`HIDDEN`). Additive schema change — **needs `npx prisma db push`**.
- Review page section **1. Your overall experience** (optional): large stars with a label (Poor → Excellent), order tags, comment. Section **2. Your products** with an "x of y rated" counter.
- `POST /api/review-links/[token]` accepts `order`, `reviews`, or both; saved in one transaction. Second order-level review → 409.

### Changed
- Product cards show only product-type tags; the four global tags moved to the order level (`ORDER_TAGS` in `lib/reviews/tags.ts`). The old profile feedback modal is unchanged.
- A link stays open until the order-level review **and** every product are reviewed. Orders with no matchable product can still get an order-level review.
- Redesign in the site's indigo (`#4f46e5`): gradient header with order number and "Verified purchase", larger product images, selected-card highlight, sticky submit bar, "rate some now, the rest later" hint, restyled thank-you page.
- Decision: coupon (stage 5) is issued on the first submission of either kind (PRD C1 updated).

### Verification
- Full Jest suite: 32 suites, 558 passed, 1 skipped. `tsc`: 0 errors.
- Not yet run against the database (needs `db push` first) or checked visually.

## 2026-10-08 — Stage 1: review link and review page

### Added
- `lib/reviews/link.ts` — signed review links `/review/<orderId>.<HMAC>` (same link on every share; key from `REVIEW_LINK_SECRET`, else derived from `NEXTAUTH_SECRET`), launch date (`REVIEW_LAUNCH_AT`; unset = everything pre-launch), 30-day window for post-launch orders, no expiry for pre-launch orders.
- `lib/reviews/reviewableItems.ts` — `loadReviewLink(token)`: eligibility (delivered, no refund), link window, item matching (`productId` for new orders; type + name, + colour for filaments, for old orders; ambiguous/missing hidden), already-reviewed items, reviewer full name (user → address → "Verified buyer").
- `lib/reviews/tags.ts` (tag lists moved out of the feedback modal, which now imports them), `lib/reviews/constants.ts` (2,000-character limit).
- `app/review/[token]/page.tsx` — no-login review page (server component; `noindex`, `no-referrer` so the token is not leaked to image hosts). `_components/ReviewForm.tsx` mirrors the feedback modal per product (stars, then per-product tags and text); `_components/ReviewThankYou.tsx` for submitted, expired, used and invalid links.
- `POST /api/review-links/[token]` — validates and saves reviews as `PENDING` (rating 1–5, text ≤ 2,000, tags must belong to the product type, item must be reviewable and not yet reviewed, duplicate/concurrent submissions → 409), rate-limited 10 per 15 min per client.
- `components/ui/star-rating.tsx` — star buttons now have accessible labels.

### Not included (later stages)
- Order-level "Anything else?" comment from the old modal (no field in the new model) — to confirm.
- Coupon issue, incentivised flag, emails, admin share buttons.

### Verification
- Tests: `lib/__tests__/review-link.test.ts`, `lib/__tests__/review-items.test.ts`, `__tests__/review-link-api.test.ts`, `components/__tests__/ReviewForm.test.tsx` (40). Full suite: 32 suites, 548 passed, 1 skipped. `tsc`: 0 errors.
- Local render check blocked: a second dev server was already running on port 3000, so mine started on 3001 and both shared `.next` (`Cannot find module './vendor-chunks/next-auth.js'`). Stopped mine; to be re-run.
- Local dev server (re-run with only one server): both delivered orders render the form (1 and 3 products, all matched); `noindex` and `no-referrer` present; a forged link shows the thank-you page.
- API on the live database: invalid rating, unknown item and wrong-type tag → 400 (no writes). One test review → 201, saved as `PENDING` with `resinId`, variant "Black · 1000g", tag, not incentivised. Second submission → 409 `completed`; page switched to thank-you. Test row deleted (0 `ProductReview` rows remain); page shows the form again.

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
