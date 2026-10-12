# Scribbl3D — Full Code Review Checklist

**Date:** 2026-10-12 · **Commit reviewed:** `804c205` (main) · **Scope:** whole repository, read-only review

**How to use:** each finding has a checkbox. When it is fixed and verified, change `- [ ]` to `- [x]` (GitHub and VS Code preview also let you click the box). Add the fixing commit/PR next to the item if useful, e.g. `- [x] **CR-04 …** (fixed in #123)`.

**Severity:** 🔴 Critical — fix immediately · 🟠 High — fix before next release · 🟡 Medium — schedule soon · ⚪ Low — cleanup / hardening

## Summary

| Severity | Count |
| --- | --- |
| 🔴 Critical | 3 |
| 🟠 High | 18 |
| 🟡 Medium | 36 |
| ⚪ Low | 35 |
| **Total** | **92** |

**Automated checks at review time**

| Check | Result |
| --- | --- |
| `npx tsc --noEmit --incremental false` | ✅ 0 errors |
| `npm run test:ci -- --runInBand` | ✅ 50 suites, 741 passed, 1 skipped |
| `npm run lint` | ❌ 130 errors, ~675 warnings (see CR-56, CR-92) |
| `npm audit --omit=dev` | ❌ 61 vulnerabilities: 4 critical, 17 high (see CR-57) |

**Business decisions needed (do not change without input):** CR-49 (shipping badge wording), CR-61 (filament coupons), CR-28 (GST treatment of discount/shipping), CR-66 (invoice numbering per FY).

---

## 🔴 Critical

- [x] **CR-01 · PhonePe salt key and signatures written to server logs** _(fixed: code fixed — **rotate the PhonePe salt key** still required)_
  - Where: `lib/refund.ts:48-85` (`StringToSign`, `X-VERIFY`, raw payloads), `lib/refundStatus.ts:22`
  - Issue: `stringToSign` contains `SALT_KEY`; every refund prints the merchant secret to logs. Anyone with log access can forge signed PhonePe requests/callbacks.
  - Fix: Delete these debug logs (keep status code + IDs only). **Rotate the PhonePe salt key.**

- [ ] **CR-02 · Hardcoded admin email/password fallback (also in git history)**
  - Where: `lib/auth.ts:41-43` → `app/api/admin/login/route.ts:26`
  - Issue: If `ADMIN_EMAIL`/`ADMIN_PASSWORD` are unset, a literal credential committed in the repo grants full `/ops/control` access (orders, refunds, PII, CMS). Plain `===` compare, single shared account.
  - Fix: Remove the fallbacks and fail closed. **Rotate the admin password and treat the old one as compromised.** Longer term: hashed credential, per-person accounts.

- [x] **CR-03 · Account takeover: registration skips server-side OTP check + Google auto-links by email**
  - Where: `app/api/register/route.ts:14-60`, `app/api/verify-otp/route.ts:69-74`, `app/api/auth/[...nextauth]/options.ts:160-180`, `app/api/profile/update-email/route.ts` + `app/actions/profile-actions.ts:8-26`
  - Issue: `/api/register` creates a password account for any email without proof of OTP verification (OTP is only enforced in the browser). `update-email` changes email with no verification. Google sign-in then links into any existing user with the same email. Attacker pre-registers `victim@gmail.com`; victim later signs in with Google into the attacker's account.
  - Fix: verify-otp issues a short-lived, single-use, email-bound token that `/api/register` requires; verify new email on change (or delete the unused update-email route); only auto-link Google when `emailVerified` is set.

## 🟠 High

### Payments, cart, orders

- [x] **CR-04 · `GET /api/orders/[orderId]` exposes any order (IDOR, PII leak)**
  - Where: `app/api/orders/[orderId]/route.ts:10-50`
  - Issue: No auth; ownership check uses the legacy `lib/session.ts` cookie which customers never have, so it never runs. Returns address, phone, email, UTR, masked card to anyone with the order ID (which appears in URLs/emails).
  - Fix: Require `getServerSession(authOptions)` and `order.userId === session.user.id` (or admin); return only fields the success page needs.

- [x] **CR-05 · Product/variant mismatch lets a premium item be bought at a cheaper variant's price**
  - Where: `app/api/cart/route.ts:69-86`, `app/api/cart/[id]/route.ts:9-140` (duplicate POST, no filament validation), `lib/cart/loadCartItems.ts:143-244`
  - Issue: `resinWeight.resinId`/`resinColour.resinId`/`filamentVariant.filamentId` are never checked against the parent product; pricing uses the variant row.
  - Fix: Validate ownership in POST, delete the duplicate POST in `[id]`, and mark mismatched rows `_orphaned` in `loadCartItems` so `priceCheckout` rejects them.

- [x] **CR-06 · Out-of-stock / inactive printers, resins, prebuilt items are still purchasable**
  - Where: `lib/cart/loadCartItems.ts:176-333`, `lib/checkout/pricing.ts:102-110`
  - Issue: `inStock` is computed only for filaments; `isActive`/`inStock` on Printer, Resin, ResinWeight, ResinColour, PrebuiltProducts/Variants never re-checked at checkout.
  - Fix: Compute availability for every family in `loadCartItems` and add the same checks at add-to-cart.

- [x] **CR-07 · `retry-payment` can revert a confirmed order to `payment_pending`**
  - Where: `app/api/orders/retry-payment/route.ts:33-66`
  - Issue: Non-atomic read-then-update; if the callback confirms the order in between, retry overwrites it and sends the customer to pay again.
  - Fix: `updateMany({ where: { id, userId, status: { in: ["payment_pending","payment_failed"] } } })`; `count === 0` → 409.

- [x] **CR-08 · Per-user / first-order coupon limits bypassable with concurrent pending orders** _(fixed: limits re-checked in `confirmPayment`; violations confirmed and flagged to admins (no reservation))_
  - Where: `lib/checkout/pricing.ts:137-150`, `app/cart/utils/validateDiscountEligibility.ts:50-94`, `lib/payments/confirmPayment.ts:83-98`
  - Issue: Usage recorded only after payment; confirmation doesn't re-check limits; several orders created before paying all get the discount.
  - Fix: Reserve redemption atomically at order creation (release on failure), or at minimum re-validate in `confirmPayment` and flag violations.

### Fulfilment, refunds, documents

- [x] **CR-09 · Customer cancelling a manifested order cancels the shipment but never refunds**
  - Where: `app/profile/orders/[orderId]/CancelOrderButton.tsx:26-50`, `app/api/internal/cancel-shipment/route.ts:96-99`, `lib/orders/cancellation.ts:16`, `app/api/admin/orders/[orderId]/cancel/route.ts:59-70`
  - Issue: Step 1 sets shipment `cancelled`; step 2 eligibility then requires `manifested` → 409. Order stays confirmed, no refund, retry fails forever.
  - Fix: One server-side operation: check eligibility → cancel at Delhivery → refund.

- [x] **CR-10 · Shipment sync flips cancelled/refunded orders back to shipped/delivered**
  - Where: `app/api/internal/sync-shipment/route.ts:16-27,205-215`, `lib/shipment/shouldSync.ts:3`, `app/api/internal/sync-shipments/route.ts:34-84`
  - Issue: `deriveOrderStatus` ignores current status; cancelled shipments keep syncing; customer can receive shipped/delivered emails for a refunded order.
  - Fix: Never overwrite terminal states; exclude cancelled shipments from both sync paths.

- [x] **CR-11 · Refunds not idempotent (double refund / lost refund record)**
  - Where: `app/api/admin/orders/[orderId]/cancel/route.ts:51-110`
  - Issue: Plain read guard, random `RFD_` ID per request, DB write only after PhonePe call.
  - Fix: Atomically claim the order (`updateMany where refundId null`) with a deterministic refund ID and `refundStatus: "requested"`, then call PhonePe.

- [x] **CR-12 · Admin "Cancel & Refund" leaves the Delhivery shipment live** _(fixed: in-transit parcels block the refund (409))_
  - Where: `app/ops/control/orders/page.tsx:428-439` → `cancel/route.ts`
  - Issue: Refunds without cancelling waybills; parcel still delivered.
  - Fix: Cancel non-delivered waybills in the cancel route; block/warn when in transit.

- [ ] **CR-13 · Duplicate Delhivery shipments on concurrent requests or partial failure**
  - Where: `app/api/internal/create-shipment/route.ts:115-254`
  - Issue: Idempotency check before external call, no lock or unique `(orderId, isMaster)`; Delhivery success + DB failure orphans the waybill.
  - Fix: Claim order first (`status: "shipment_creating"`), persist a recoverable record on DB failure.

- [ ] **CR-14 · Bulk shipment sync sends duplicate emails and ignores the sync lock**
  - Where: `app/api/internal/sync-shipments/route.ts:34-143`, called from `CreateShipmentDialog.tsx:225`
  - Issue: Iterates MPS child rows (3 packages → 3 "shipped" emails), no lock, no `take`, no `lastSyncedAt`; will time out over history.
  - Fix: `isMaster: true` + active statuses, shared lock, pagination, email only on master transition (sent flag).

- [ ] **CR-15 · Credit-note download broken for admins and creates notes as a side effect**
  - Where: `app/api/admin/credit-notes/[creditNoteId]/route.ts:160-247`
  - Issue: Requires admin session *and* that the customer session owns the order → admins get 401. GET falls back to creating a credit note (consumes counter, full amount) without checking cancellation.
  - Fix: Admin-session auth only; make GET read-only (404 if none).

### Accounts, forms, catalogue

- [x] **CR-16 · Session resolves user by email; `userId: undefined` can match ALL orders**
  - Where: `app/api/auth/[...nextauth]/options.ts:115-130`, `app/profile/page.tsx:66`
  - Issue: After an email change the session gets `user.id` undefined (or maps to a new owner of the old email). Prisma ignores undefined filters, so `order.findMany({ where: { userId: undefined } })` returns every order and triggers syncs for all of them.
  - Fix: Set `session.user.id = token.id` and look up by ID; guard `session?.user?.id` before every `userId` query.

- [ ] **CR-17 · Public design-file uploads: guessable names, overwrite each other, weak validation**
  - Where: `app/api/form-responses/route.ts:28-34` (`public_id: file.name`, `unique_filename: false`), `app/api/prototyping-request/route.ts:31-33`, `app/api/small-batch-manufacturing/route.ts:29-31`, `lib/validation.ts:122-125`
  - Issue: Customer files overwrite each other and are publicly fetchable at predictable URLs. Extensionless files skip the allowlist; no content check; no total count/size cap (small-batch allows 50 × 50MB buffered in memory).
  - Fix: Random IDs with `overwrite: false`, consider authenticated/private delivery; reject empty extension, check magic bytes, cap count and total size before buffering.

- [ ] **CR-18 · Personalise form submissions always fail with 400**
  - Where: `app/personalise/personalise-form.tsx:58-68,168-176` vs `app/api/personalise-form/route.ts:23`, `lib/validations/api-schemas.ts:18-30`
  - Issue: Client sends nested `contactDetails` etc.; API validates a different schema (top-level `name`, `quantity`, `material`). No leads saved; `userId` always null.
  - Fix: Schema matching the real form and `PersonaliseFormResponse` model; take `userId` from the session; add a form↔API contract test.

- [x] **CR-19 · Customer login: no brute-force limit, account enumeration** _(fixed: in-memory limits per instance)_
  - Where: `app/api/auth/[...nextauth]/options.ts:61-96`, `app/api/check-email/route.ts`, `app/api/auth/forgot-password/route.ts:46-53`
  - Issue: Unlimited password guesses; distinct `NO_ACCOUNT` / `GOOGLE_ACCOUNT` / `WRONG_PASSWORD` errors; public `check-email`; forgot-password returns `isGoogleUser`.
  - Fix: Per-email + per-IP limits in `authorize` (shared store), single generic error, remove/limit `check-email`, uniform forgot-password response.

- [ ] **CR-20 · Public `GET /api/test-email` sends real emails and returns stack traces**
  - Where: `app/api/test-email/route.ts:4-39`
  - Issue: No auth or rate limit; can be triggered cross-site to flood the inbox and drain ZeptoMail quota.
  - Fix: Delete it, or move under `/api/admin/` without stack output.

- [ ] **CR-21 · `/[category]` pages crash (500) whenever the category has products**
  - Where: `app/[category]/page.tsx:54-56,166-174`, `components/enhanced-product-tile.tsx:227`
  - Issue: `findMany` has no `include`; `PrebuiltProducts` has no `price`/`images`; `images[0]` throws. Also duplicates `/prebuilt-products/category/*`.
  - Fix: Redirect these slugs to `/prebuilt-products/category/<slug>` in `next.config.mjs`, or include images/variants.

## 🟡 Medium

### Payments, cart, orders

- [x] **CR-22 · `PAYMENT_REVIEW` / timeout shows "Retry payment" → possible double charge**
  - Where: `app/api/check-status/[transactionId]/route.ts:74-103`, `app/payment/status/page.tsx`, `retry-payment`
  - Fix: Distinct review status that blocks retry; client handles `PAYMENT_REVIEW` without a Retry button; check old transaction server-side before allowing retry.

- [x] **CR-23 · Stored order snapshot can differ from what was priced and charged**
  - Where: `app/api/create-order/route.ts:94-110` vs `132-245`
  - Issue: Second independent cart read; pricing clamps quantity but snapshot stores raw value.
  - Fix: `priceCheckout` returns its normalized items; build the snapshot from them.

- [x] **CR-24 · Add-to-cart POST does not validate quantity**
  - Where: `app/api/cart/route.ts:36,143-162`, `app/api/cart/[id]/route.ts:31,110-129`
  - Issue: Negative, zero, fractional, string or huge values accepted.
  - Fix: Positive integer with a sane max, as PUT already does.

- [x] **CR-25 · Tax invoices can be generated for unpaid/failed orders**
  - Where: `app/api/orders/[orderId]/invoice/route.ts:24-41`, `lib/invoice/generateInvoicePdf.ts:144-160`
  - Issue: Ownership-only check; allocates a permanent GST invoice number and prints "Received ₹total".
  - Fix: Only paid statuses (`confirmed`/`processing`/`shipped`/`delivered`/cancelled-after-payment); else 409.

- [x] **CR-26 · Legacy unauthenticated `/api/status` routes poll PhonePe for ~25 min per request** _(fixed: routes return 410; files can be deleted)_
  - Where: `app/api/status/route.ts`, `app/api/status/[id]/route.ts:35-55`, `utils/payment-status.ts`
  - Issue: No callers; anonymous requests tie up workers, risk PhonePe rate limits, log raw payloads, look up any transaction.
  - Fix: Delete both routes and `utils/payment-status.ts` if unused.

### Fulfilment, refunds, documents

- [ ] **CR-27 · Credit-note creation trusts client amount; unlimited notes per invoice**
  - Where: `app/api/admin/credit-notes/route.ts:42-111`
  - Fix: Derive amount server-side (≤ invoice total − prior credits), require cancelled/refunded order, reject duplicates.

- [ ] **CR-28 · Invoice/credit-note GST figures disagree with stored order pricing** *(confirm with business)*
  - Where: `lib/invoice/generateInvoicePdf.ts:222-224,381-394,527-566`, `app/api/admin/credit-notes/[creditNoteId]/route.ts:299-334`
  - Issue: Hardcoded 18% on pre-discount prices; stored `order.tax` unused; credit-note lines don't sum to its total.
  - Fix: Build tax lines from the stored `subtotal`/`discountAmount`/`tax`/`shippingPrice` snapshot.

- [x] **CR-29 · Failed refunds are never recorded and cannot be retried**
  - Where: `app/api/internal/sync-refunds/route.ts:28-57`, `cancel/route.ts:52`
  - Fix: Branch on `code` regardless of `success`; add an admin "retry refund" path for `refundStatus = failed`.

- [x] **CR-30 · Refund status uses undocumented `PHONEPE_URL`; refunds always hit production** _(fixed: new `PHONEPE_REFUND_URL`)_
  - Where: `lib/refundStatus.ts:5`, `lib/refund.ts:4`
  - Issue: Unset env → `undefined/v3/...` and silent failures; local/dev cancellations send real refunds.
  - Fix: Single base-URL config in `lib/payments/phonepe.ts`, fail fast when missing; add to `.env.example`.

- [x] **CR-31 · `cancel-shipment` marks shipments cancelled even when Delhivery refused** _(fixed: `cancel-shipment` retired (410); logic in `lib/shipment/cancelShipments.ts`)_
  - Where: `app/api/internal/cancel-shipment/route.ts:80-115`
  - Fix: Check response body per waybill; update DB only on confirmed cancel; non-2xx if any failed.

- [ ] **CR-32 · Shipment sync lock never released if the function is killed**
  - Where: `app/api/internal/sync-shipment/route.ts:72-84,267-275`, `lib/shipment/shouldSync.ts:4`
  - Fix: Lock expiry (e.g. `syncStartedAt` older than 5 min = unlocked).

- [ ] **CR-33 · HTML injection in transactional and admin emails**
  - Where: `lib/email/templates/layout.ts:72-102`, `lib/email/templates/adminNotification.ts:38-100`, `orderConfirmation.ts:28-41,133`, `app/api/admin/orders/[orderId]/send-email/sendStatusEmail.ts:70-80,163-171`
  - Issue: Contact-form input renders as live HTML inside trusted admin emails (phishing); same for names/addresses.
  - Fix: `escapeHtml` inside the template helpers for every interpolated value; allow only http/https in `href`.

- [ ] **CR-34 · Delhivery create/waybill/label calls have no timeout; dimensions not validated**
  - Where: `lib/delhivery/client.ts:26,91,143`, `app/api/internal/generate-label/route.ts:43-197`, `create-shipment/route.ts:61-79`
  - Fix: 5–15s timeouts; require positive finite numbers for weight/dimensions.

### Auth & abuse protection

- [ ] **CR-35 · Wishlist items can be modified/deleted by any signed-in user (IDOR)**
  - Where: `app/api/wishlist/[id]/route.ts:22-34,54-56`
  - Fix: Scope with `wishlist: { userId: session.user.id }` via `updateMany`/`deleteMany`; validate variant IDs.

- [ ] **CR-36 · Password reset/change does not revoke existing JWT sessions (message says it does)**
  - Where: `app/api/auth/reset-password/route.ts:55-73`, `app/api/profile/change-password/route.ts:57-64`
  - Fix: `passwordChangedAt`/`tokenVersion` claim checked in the `jwt` callback (needs approved migration).

- [x] **CR-37 · Anyone can lock the single admin account out indefinitely** _(fixed: in-memory per instance)_
  - Where: `app/api/admin/login/route.ts:22-29`, `lib/login-rate-limit.ts`
  - Fix: Key on email + IP in a shared store; exponential backoff instead of a hard lockout.

- [ ] **CR-38 · Shared rate limiter mixes counters across endpoints and windows last 2× too long** _(partial: per-route keys and window fixed; still in-memory per instance)_
  - Where: `lib/rate-limit.ts:27-60`, `lib/api-helpers.ts:75-82`
  - Issue: Keyed by IP only (coupon tries can block password reset); `resetTime < now - windowMs`; in-memory per instance; trusts `x-forwarded-for`.
  - Fix: Namespace keys per route, compare `resetTime < now`, shared store in production.

- [x] **CR-39 · OTP endpoints: email-bombing, weak RNG, Prisma disconnect, racy attempt counter**
  - Where: `app/api/send-otp/route.ts:10-123`, `app/api/verify-otp/route.ts:51-65`
  - Fix: Per-email limit + cooldown, `crypto.randomInt`, remove `prisma.$disconnect()`, atomic `updateMany` with `attempts: { lt: 3 }`, no error stack in responses.

- [x] **CR-40 · Open redirect after login via `callbackUrl`**
  - Where: `app/login/_components/LoginForm.tsx:80,86,146`
  - Fix: Accept only paths starting with `/` (not `//`); fall back to `/profile`.

### Catalogue, SEO, content

- [ ] **CR-41 · Redirect loop on two blog posts**
  - Where: `next.config.mjs:120,131-139`
  - Issue: `trailingSlash: false` strips the slash that these redirects add → `ERR_TOO_MANY_REDIRECTS`.
  - Fix: Remove the two redirects.

- [ ] **CR-42 · Merchant feed publishes zero-price offers and `/filament/null` links**
  - Where: `app/api/google-merchant-feed/route.ts:141-327`
  - Fix: Skip `price <= 0`; use `slug || id` for filaments; skip slugless prebuilts.

- [ ] **CR-43 · Resin availability ignores colour stock (JSON-LD, feed, llms-full)**
  - Where: `app/resins/[slug]/page.tsx:117-119`, `app/api/google-merchant-feed/route.ts:193-238`, `app/llms-full.txt/route.ts:122`
  - Fix: Also require `colours.some(c => c.inStock)`.

- [ ] **CR-44 · Legacy `/api/reviews` accepts unmoderated reviews; prebuilt PDP ships them with `userId`**
  - Where: `app/api/reviews/route.ts:13-30`, `app/prebuilt-products/[slug]/page.tsx:21,95,144`, `app/api/prebuilt-products/[slug]/route.ts:18-24`
  - Fix: Delete/410 the legacy route; remove `reviews` from both includes (PDP already uses `getPdpReviews`).

- [ ] **CR-45 · Wishlist "Add to cart" for filaments always fails (no variant)**
  - Where: `app/api/wishlist/route.ts:164-181`, `app/profile/_components/wishlist-card.tsx:44-47`
  - Fix: Include default in-stock `filamentVariantId`, or `requiresOptions: true`.

- [ ] **CR-46 · `/api/recommendations` POST has no input limits; shows out-of-stock items**
  - Where: `app/api/recommendations/route.ts:281-340`
  - Fix: Zod (limit 1–12, ≤ 5 groups), filter `inStock: true`.

- [ ] **CR-47 · Public search runs `CREATE EXTENSION`, has no query-length cap, leaks DB errors**
  - Where: `app/api/search/route.ts:7-19,543-561`
  - Fix: Extension via migration; cap `q` (~100 chars); drop `details` from 500 responses.

- [ ] **CR-48 · Blog HTML stored and rendered without sanitisation (stored XSS on main origin)**
  - Where: `app/blog/_components/blog-post-layout.tsx:693`, `app/api/admin/blogs/route.ts:26-37`
  - Fix: Sanitise with an allowlist (sanitize-html/DOMPurify) on save, ideally also on render.

- [ ] **CR-49 · Filament PDP "Free shipping over ₹1000" contradicts Shipping Policy and JSON-LD** *(business wording needed)*
  - Where: `app/filament/[id]/_components/FilamentDetailClient.tsx:514`
  - Fix: Get the correct wording from the business before changing.

- [ ] **CR-50 · 3D-request form advertises file types the server rejects**
  - Where: `app/services/_component/Form3d.tsx:498,725,729,1143` vs `lib/validation.ts:113-128`
  - Fix: One shared allowlist for client and server.

- [ ] **CR-51 · Form text is HTML-encoded before storage → double-encoded in dashboard/CSV**
  - Where: `lib/validation.ts:9-27`
  - Fix: Store trimmed plain text; escape only at HTML-email output.

- [ ] **CR-52 · Root layout session fetch makes every page dynamic + DB query per request**
  - Where: `app/layout.tsx:62-72`, `options.ts:115-128`
  - Fix: Read session client-side (or only where needed); keep needed fields in the JWT.

- [ ] **CR-53 · About and catalogue listings stay blank until every image (incl. lazy ones) loads**
  - Where: `hooks/useAutoImageLoader.ts:10-41`, `app/about/AboutContent.tsx:16,36-41`, listing page clients
  - Fix: Remove the global gate or limit it to above-the-fold hero images with a short cap.

### Cross-cutting

- [ ] **CR-54 · Customer PII and secrets in logs** _(partial: auth adapter, send-otp, payment success page and profile logs cleaned; Delhivery/contact/email logs remain)_
  - Where: `lib/auth/prismaAdapter.ts:21,38,52,67` (OAuth `access_token`/`id_token`), `lib/delhivery/client.ts:84,136,149`, `app/api/internal/generate-label/route.ts:58-61`, `sync-shipment/route.ts:120-136`, `app/api/contact/route.ts:47`, `app/api/send-otp/route.ts:16,27,68`, `app/api/personalise-form/route.ts:58`, `lib/email/sendEmail-zeptomail.ts:84,88`, `app/profile/page.tsx:82-96`, `app/payment/success/page.tsx` (email console logs)
  - Fix: Remove or redact (log order ID / waybill / status only; reuse `maskEmail` from `lib/email/safe-send.ts`).

- [ ] **CR-55 · Error details returned to clients** _(partial: invoice, send-otp, verify-otp fixed; test-email and search remain)_
  - Where: `app/api/orders/[orderId]/invoice/route.ts:52` (`err.message`), `app/api/send-otp`, `app/api/test-email`, `app/api/search`
  - Fix: Generic error messages; log details server-side only.

- [ ] **CR-56 · Conditional React hook call (rules-of-hooks lint error)**
  - Where: `app/landingpage/product-grid.tsx:46` (`useInView` called conditionally)
  - Fix: Call unconditionally — or delete the file, it appears unused (see CR-90).

- [ ] **CR-57 · Dependency vulnerabilities: 4 critical, 17 high**
  - Where: `npm audit --omit=dev` — critical in `next`, `@auth/core`; high in `axios`, `form-data`, `sharp`, `postcss`, `nanoid`, `prosemirror-view`, `linkify-it`, `braces`, etc.
  - Fix: Review each advisory for real exposure; apply patch/minor upgrades in a separate, tested change.

## ⚪ Low

### Payments, cart, orders

- [ ] **CR-58 · Discount usage write failure is swallowed; no unique constraint on `DiscountUsage`** _(partial: usage written in the confirmation transaction; `@@unique([orderId, discountId])` needs an approved migration)_ — `lib/payments/confirmPayment.ts:84-98`. Fix: write inside the status-transition transaction; `@@unique([orderId, discountId])` (approved migration).
- [x] **CR-59 · Confirmation clears the whole live cart, including items added later** — `lib/payments/confirmPayment.ts:101-106`. Fix: delete only snapshotted cart items.
- [x] **CR-60 · Coupon lookup not rate-limited; returns full record incl. hidden codes** — `app/api/discounts/apply/route.ts:10-54`. Fix: `RateLimits.COUPON`, return minimal fields.
- [ ] **CR-61 · Item-type coupons can never apply to filaments (`ItemType` enum lacks `filament`)** *(business decision)* — `prisma/schema.prisma:735-740`, `lib/checkout/pricing.ts:75-80`.
- [ ] **CR-62 · Dead/broken checkout paths** _(partial: cart debug retired, duplicate POST/GET removed from `cart/[id]`, buy-now prebuilt no longer ₹0, ops tracking link repointed; unused `CheckoutButton.tsx` and `app/order/[orderId]/tracking` page still need deleting)_ — `components/CheckoutButton.tsx:25` (nonexistent `/api/initiate-payment`), `app/order/[orderId]/tracking/page.tsx:36` (nonexistent API), `/api/buynow` returns `price: 0` for prebuilt, `app/api/cart/debug/route.ts` ("TEMPORARY"), duplicate GET + `legacyDeleteAllCart` in `app/api/cart/[id]/route.ts`. Fix: remove or repoint.
- [x] **CR-63 · Discount spinner can stay stuck after a failed cart request** — `providers/CartProvider.tsx:300-327`. Fix: reset flag on non-OK response.

### Fulfilment, refunds, documents

- [ ] **CR-64 · Printer weight unit guessed from value (≤ 1000 treated as kg)** — `app/checkout/components/expressShipping.ts:81-85`; feed always labels weight `g` (`google-merchant-feed/route.ts`). Fix: confirm stored unit (admin form stores grams) and convert consistently.
- [ ] **CR-65 · Prebuilt products always ship as 750 g, ignoring stored weight** — `expressShipping.ts:4,118`.
- [ ] **CR-66 · Invoice/credit-note numbering edge cases** — FY computed in UTC not IST, global counter (confirm per-FY reset), P2002 race → 500, helpers duplicated in 3 files. `app/api/admin/credit-notes/route.ts:7-36`, `lib/invoice/generateInvoicePdf.ts:98-115`.
- [ ] **CR-67 · Refund amount converted by hand instead of `toPaise`; ignores prior credits** _(partial: uses `toPaise`; prior credit notes not subtracted (no partial-refund flow exists))_ — `cancel/route.ts:95`.
- [x] **CR-68 · Next.js 15 route `params` read synchronously** — `app/api/admin/orders/[orderId]/cancel/route.ts:13-14`, `app/api/admin/orders/[orderId]/route.ts:23,78`. Fix: `await params`.

### Auth & config

- [ ] **CR-69 · Most admin APIs rely only on middleware regex for auth** — 34 of 41 `app/api/admin/**` files plus `internal/*`. Fix: in-handler `isAdminRequest(req)` guard or shared wrapper (defence in depth).
- [x] **CR-70 · `withApiProtection({ requireAuth: true })` is a no-op placeholder** _(fixed: option removed)_ — `lib/api-helpers.ts:126-133`. Fix: implement or remove the option.
- [x] **CR-71 · Hardcoded fallback JWT secret in legacy session module** — `lib/session.ts:5-7`. Fix: fail closed or delete the legacy module and stub actions in `app/actions.ts`.
- [ ] **CR-72 · One secret reused for admin JWT and internal token; no revocation** — `lib/admin-session.ts:8`, `lib/internal-auth.ts:12-14`. Fix: dedicated secrets; consider session version for admin tokens.
- [x] **CR-73 · CORS allows credentialed requests from `localhost:3000` in production** — `middleware.ts:87-106`. Fix: only when `NODE_ENV === "development"`.

### Catalogue, SEO

- [ ] **CR-74 · Merchant feed emits only one additional image (key overwritten in loop)** — `google-merchant-feed/route.ts:184-186`.
- [ ] **CR-75 · Feed variants indistinguishable; landing page preselects different price** — `google-merchant-feed/route.ts:141-188,291-326`. Fix: diameter + weight in `g:size`, variant query param honoured by PDP.
- [ ] **CR-76 · Feed URLs not XML-escaped** — `google-merchant-feed/route.ts:154-155,172,259,273`.
- [ ] **CR-77 · Wishlist prices arbitrary (unordered resin weights) or ₹0 when filament variants are out of stock** — `app/api/wishlist/route.ts:47-166`.
- [ ] **CR-78 · Default variant can be out of stock / fallback selects a different variant than displayed** — `PrebuiltProductDetailClient.tsx:492-500,621-631`, `FilamentDetailClient.tsx:150-152`. Fix: start on first active in-stock variant; exact match or disable CTA.
- [ ] **CR-79 · Category slug normalisation differs between sitemap, category page and `[category]`** — `app/sitemap.ts:153-163`, `app/prebuilt-products/category/[category]/page.tsx:13-18`, `app/[category]/page.tsx:25-40`.
- [ ] **CR-80 · Admin upload endpoints have no MIME/size check (SVG accepted)** — `app/api/upload/route.ts:16-49` and admin product/hero uploads.
- [ ] **CR-81 · Each PDP queries its product twice (metadata + page)** — filament/printer/resin/prebuilt `page.tsx`. Fix: wrap loaders in React `cache()`.
- [ ] **CR-82 · Catalogue listing APIs accept unbounded/NaN `limit`** — `app/api/filaments/route.ts:28-30`, `printers/route.ts:15-17`, `resins/route.ts:10-11`, `printers/similar/route.ts:11`, `prebuilt-products/route.ts:21`. Fix: clamp 1–48.
- [ ] **CR-83 · Review link does one product lookup per order item (N+1)** — `lib/reviews/reviewableItems.ts:147-153`.
- [ ] **CR-84 · Dead/inconsistent JSON-LD code** — `components/StructuredData.tsx` unused (uses `next/script`); `components/seo/ServiceSchema.tsx:54`, `LocalBusinessSchema.tsx:134` skip `jsonLdString`.
- [ ] **CR-85 · Schema comment says printer price is in paise (prices are whole rupees)** — `prisma/schema.prisma` Printer `price`. Fix comment only; `priceDisplay` unchanged unless requested.

### Account, content, UI

- [ ] **CR-86 · Each blog post page downloads every post's full content for prev/next** — `blog-post-layout.tsx:91-94`, `app/api/blogs/route.ts:20`. Fix: compute on server with narrow `select`.
- [x] **CR-87 · Registration OTP toasts never show (`sonner` not mounted); failed resend still starts cooldown** — `app/register/_components/otp-verification.tsx:13,76-98`, `app/register/page.tsx:106-131`.
- [ ] **CR-88 · Possible hydration mismatch on order dates (no time zone)** — `app/profile/_components/overview.tsx:78`, `orders.tsx:270,354`. Fix: `timeZone: "Asia/Kolkata"`.
- [ ] **CR-89 · Video `loadeddata` listener never removed; cached video never marked loaded** — `app/services/_component/herovid.tsx:23,36`.
- [ ] **CR-90 · Dead/legacy code that misleads** — `app/profile/_components/{AddressManager,AddressForm,saved-addresses,password-reset,otp-verification}.tsx`, `app/profile/_actions/address-actions.ts`, `app/actions/otp-actions.ts`, `app/api/auth/logout/route.ts`, `app/ops/control/form-responses/page.tsx`, `app/landingpage/{product-grid,herosectionimage,image-carousel}.tsx`, `hooks/{useWishlist,use-products,use-fetch,use-variant-selection}.ts`. Fix: confirm unused, then delete.
- [ ] **CR-91 · Ops "new" and "edit" editors are near-duplicate copies** — `app/ops/control/printers/new` vs `printers/[id]/edit` (~1,770 lines, 30 differ); same for resins, filaments-new. Fix: shared form component with `mode`, like `PrebuiltProductForm.tsx`.
- [ ] **CR-92 · Lint fails with 130 errors** — 88 unused vars, 22 unescaped entities, 8 `<a>` instead of `<Link>`, 7 `prefer-const`, 3 `ban-ts-comment`, 1 rules-of-hooks (CR-56). Fix: clean up incrementally; `next.config.mjs` skips lint during build, so these aren't caught in CI.

---

## Verified as sound (no action)

- Server-side pricing via `priceCheckout`; `/api/order` charges stored `totalAmount` via `toPaise`.
- `confirmPayment` atomic transition, callback checksum (401 on bad `x-verify`), ownership checks in `/api/order`, `check-status`, `create-order`.
- Middleware gates `/api/admin/**`, `/api/internal/**`, `/ops/control`; Next.js 15.5.15 not affected by the middleware-bypass CVE.
- `buildProductJsonLd` drops zero prices; `jsonLdString` escapes `<`; `pdpJsonLdRating` uses approved reviews with 5+ threshold.
- Review links: HMAC token with timing-safe compare, validation, PENDING default, noindex.
- Announcement banner, announcement APIs and admin gating.
- robots named-crawler groups in sync with `*`.
