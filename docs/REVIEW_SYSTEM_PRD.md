# PRD — Product Review System

| | |
| --- | --- |
| Status | Draft — requirements finalised, design/build not started |
| Owner | Riya Gupta |
| Last updated | 2026-10-08 |
| Rollout | Staged; stage order decided during build |

## 1. Background

Scribbl3D currently has two disconnected review stores:

- `Review` (`prisma/schema.prisma`) — links only to prebuilt products and filaments, has no order link, and requires a title. It is written by `POST /api/reviews`, which has no validation or purchase check, and read by the prebuilt-product page.
- `OrderFeedback` — one record per order with per-item ratings stored as JSON, written by the Order Details feedback modal (`app/profile/orders/[orderId]/FeedbackModal.tsx` → `app/api/order/feedback/route.ts`).

Ratings collected from customers never reach product pages, printers and resins cannot be reviewed, and there is no verified-purchase guarantee. The delivered email (`lib/email/templates/orderDelivered.ts`) already asks for a review but links to the logged-in order page.

## 2. Goals

1. Collect verified, per-product reviews from customers with fully delivered orders, with minimal friction (no login).
2. Display trustworthy reviews and ratings on product detail pages (PDPs) and in search/merchant structured data.
3. Give operations a simple way to share review links and moderate reviews.
4. Encourage reviews with a time-limited, customer-specific coupon.

### Non-goals (this release)

- Photo/video uploads in reviews.
- Editing or deleting a review after submission (by the customer).
- Public admin replies, "Helpful" votes, customer-facing sort/filter controls.
- Ratings on listing cards, search results, or homepage sections.
- A "Write a review" entry point on the PDP.
- Automated WhatsApp/SMS sending and review reminders.

## 3. Users

| User | Need |
| --- | --- |
| Customer | Review purchased items quickly from a link, get a reward. |
| Shopper | See honest reviews and ratings from verified buyers. |
| Operations admin | Share links, track review status per order, approve/hide reviews. |

## 4. Requirements

### 4.1 Eligibility

| ID | Requirement |
| --- | --- |
| E1 | Only **fully delivered** orders are eligible. |
| E2 | Only verified purchases: a customer can review only products in that order. |
| E3 | One review per product line in an order, regardless of quantity. |
| E4 | Orders that are refunded or returned cannot be reviewed. |
| E5 | A customer may review some items now and the remaining items later. |
| E6 | A submitted review cannot be edited or deleted by the customer. |

### 4.2 Review link

| ID | Requirement |
| --- | --- |
| L1 | Each eligible order has one secure, tokenised review link that works **without login**. |
| L2 | The token grants access only to that order's reviewable items. It is an HMAC signature of the order ID with a server secret: unguessable, nothing secret stored in the database, and the same link is regenerated on every share. |
| L3 | The same link is reused on every share ("Share again" does not create a new one). |
| L4 | The link is valid for **30 days from delivery**. A link shared by admin for an older order (including orders delivered before launch) still works. |
| L5 | The link is included automatically in the delivered email, replacing the current "Leave a Review" button. |
| L6 | Admin can copy the link and share message from the Delivered tab to send manually on WhatsApp. No automated sending. |
| L7 | No reminders. No limit on the number of shares. For orders delivered after launch, the Share button is hidden once 30 days have passed since delivery. |
| L8 | Share message: a shorter version of the delivered-email review text, including the coupon offer. Final wording TBD. |

### 4.3 Review page (customer)

| ID | Requirement |
| --- | --- |
| R1 | Same UI and behaviour as the existing Order Details feedback modal, presented as a page: per-item star rating, review text, and tags (existing global and item-type tags). |
| R2 | Review text maximum 2,000 characters. Field set to be finalised during design. |
| R3 | No photo uploads. |
| R4 | Already-reviewed items are shown as submitted and cannot be changed. Tags are chosen per product. |
| R8 | Items from older orders that cannot be matched to a current product (renamed or deleted) are not shown for review. |
| R5 | After submission: "Thank you for your review" and a button to the homepage. |
| R6 | Expired link, ineligible order, or all items already reviewed: same "Thank you" message and homepage button. |
| R7 | Input validated server-side (rating 1–5, text length, item belongs to order, not already reviewed). |

### 4.4 Admin — Delivered tab

| ID | Requirement |
| --- | --- |
| A1 | Each delivered order shows one review-status action: **Share link** (never shared) → **Share again** (shared, nothing reviewed) → **Partially reviewed** → **Reviewed** (all items reviewed). |
| A2 | Share link / Share again copies the link and share message, and records the share time and count. |
| A3 | Admin can view the order's submitted reviews and share history. |
| A4 | Buttons live on the Delivered tab only. |

### 4.5 Admin — Reviews management

| ID | Requirement |
| --- | --- |
| M1 | New reviews are **pending** and are published only after admin approval. |
| M2 | Admin can hide a published review. No delete, no editing of customer text. |
| M3 | A separate "All reviews" admin page lists reviews with status, rating, product, and order. |
| M4 | 1–2★ reviews are flagged on the admin dashboard. |
| M5 | No public admin replies. |

### 4.6 PDP display

| ID | Requirement |
| --- | --- |
| P1 | Applies to all four families: printers, filaments, resins, prebuilt products. |
| P2 | Reviews are pooled at product level: filaments across the colour group, resins across colours and weights, prebuilt products across variants. Each review shows the variant bought. |
| P3 | Only approved, non-hidden reviews count and are shown. |
| P4 | Review section appears at **2+** reviews. Average rating, review count and rating breakdown (5★–1★ bars) appear at **5+** reviews. |
| P5 | Each review shows the customer's full name, rating, text, tags, variant, date, a **Verified purchase** badge, and an **Incentivised** label on every review from an order that earned a coupon. |
| P6 | Sorted newest first; no customer sort control. "Load more" pagination. |
| P7 | No "Helpful" button and no "Write a review" button. |

### 4.7 SEO

| ID | Requirement |
| --- | --- |
| S1 | Add `aggregateRating` (and reviews) to product JSON-LD only when the 5+ threshold is met, using the same approved reviews shown on the page. |
| S2 | Add product ratings to the Google Merchant feed. |
| S3 | Keep the existing `GoogleCustomerReviews` component. |
| S4 | Update the `AGENTS.md` rule that currently keeps ratings out of JSON-LD. |

### 4.8 Review coupon

| ID | Requirement |
| --- | --- |
| C1 | One coupon **per order**, issued when the first item in that order is reviewed. |
| C2 | Issued only if that first review is submitted within **15 days of delivery**. Reviews after day 15 (and up to day 30) are accepted without a coupon. |
| C3 | Value: **5% off the whole cart**, capped at **₹500**, no minimum order value. |
| C4 | Single use, valid for **15 days** from issue. |
| C5 | Locked to the reviewing customer's account; rejected for anyone else at checkout. |
| C6 | Cannot be combined with any other code (existing one-code-per-order behaviour). |
| C7 | Cancelled if the reviewed order is refunded. |
| C8 | Coupon does not depend on the rating given. |
| C9 | Shown in the customer's profile under **My coupons**. |
| C10 | Thank-you email with the coupon code sent on issue; reminder email **3 days before expiry**. |

### 4.9 Emails

All sent through the existing ZeptoMail sender (`lib/email/`). Generic wording, to be drafted and approved.

| Email | Trigger |
| --- | --- |
| Delivered email (updated) | Existing delivery trigger; review button uses the tokenised link. |
| Thank-you + coupon | Coupon issued (C1–C2). |
| Coupon expiry reminder | 3 days before coupon expiry, if unused. |

## 5. User flows

**Customer:** order delivered → delivered email (or WhatsApp link from admin) → review page → rate items → submit → "Thank you" + homepage button → if within 15 days and first review on the order, coupon email → coupon visible in My coupons → reminder 3 days before expiry.

**Admin:** Delivered tab → Share link (copy, send on WhatsApp) → status updates as customer reviews → All reviews page → approve / hide → 1–2★ reviews flagged on dashboard.

**Shopper:** PDP → (2+ approved reviews) review list → (5+) average, count, breakdown.

## 6. Technical considerations

To be detailed in the design stage. Known points from the current code:

- **Data model** (added to `prisma/schema.prisma`, migration not yet run):
  - `Order.deliveredAt`; `Discount.userId` (customer-locked codes, enforced at checkout).
  - `ReviewRequest` — one per order: email/share history and `couponWindowStartsAt`.
  - `ProductReview` — one per order line (`@@unique([orderId, orderItemIndex])`): product FK by family, variant text snapshot, rating, content (≤2,000), tags, reviewer name, incentivised flag, `PENDING`/`APPROVED`/`HIDDEN` status.
  - `ReviewReward` — one coupon per order, linked to its `Discount`, with reminder and cancellation timestamps.
  - Link validity, admin review state and the 1–2★ flag are computed, not stored. Pre-launch is defined by a fixed launch date (`REVIEW_LAUNCH_AT`).
  - `Review` and `OrderFeedback` are dropped only after their consumers are replaced.
- **Order item product IDs:** order item snapshots (`app/api/create-order/route.ts`) store no product or variant IDs. New orders must save `productId`/`variantId` (resolved server-side for buy-now). Old orders are matched by item type + name (+ colour for filaments) when the review page loads, without altering order snapshots; a dry run reports unmatched items before launch.
- **Delivery date:** `Order` has no delivered timestamp. Add a nullable `Order.deliveredAt`, set once (first transition to delivered) in both shipment sync routes (`app/api/internal/sync-shipment/route.ts`, `app/api/internal/sync-shipments/route.ts`) and in the admin status change (`app/api/admin/orders/[orderId]/route.ts`).
- **Backfill for existing delivered orders:** a one-time script, run first as a dry run that reports counts only (no customer data), then applied with approval. Date sources in priority order:
  1. Single-package shipment: delivered status/scan time from `Shipment.rawResponse` (Delhivery tracking JSON).
  2. Multi-package shipment: latest delivered time across master and child waybills.
  3. No date in tracking data: `Shipment.lastSyncedAt` (approximate; sync stops after delivery).
  4. Admin-marked delivered with no shipment: left empty.
- **Coupon window for pre-launch orders (C2 exception):** for every order delivered before launch — with or without a backfilled delivery date — the 15-day coupon window starts from the **first admin share** of the review link instead of the delivery date. The review link itself always works for these orders (L4). Orders delivered after launch follow C2 (15 days from delivery).
- **Coupons:** reuse `Discount` (`valueType` percentage, `value` 5, `maxDiscount` 500, `maxUsesPerUser` 1, `isHidden`, `expiresAt`). Checkout validation (`app/cart/utils/validateDiscountEligibility.ts`, `lib/discount-utils.ts`) must enforce the user binding. Refund flow must deactivate the coupon.
- **Scheduled job:** the expiry reminder needs a scheduled trigger; no existing mechanism has been confirmed.
- **Security:** the token endpoint must rate-limit, check eligibility server-side, and never expose other orders or customer data. The current unauthenticated-purchase `POST /api/reviews` must be replaced.
- **Migrations:** run on the current development database, each with explicit approval.

## 7. Open items

| # | Item | Decide by |
| --- | --- | --- |
| 1 | Exact review form fields (stars, text, title, tags) | Design stage |
| 2 | Share message and email wording | Before email stage |
| 3 | Stage order | During build |
## 8. Success metrics (suggested)

- Share of delivered orders with at least one review.
- Share of products with 2+ and 5+ approved reviews.
- Review coupon redemption rate.
- Repeat-purchase rate of reviewing customers vs. non-reviewing.
