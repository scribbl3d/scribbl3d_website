# PhonePe Integration

This guide describes the current repository implementation. Read the remaining limitations below before changing or exercising it. Use mocks or an explicitly approved test; payment initiation and status checks always use PhonePe production, and callbacks go to `NEXT_PUBLIC_APP_URL`, so a real payment cannot complete against `localhost`.

For project setup and commands, see [README.md](../README.md). For cross-feature constraints, see [AGENTS.md](../AGENTS.md).

## Principle

The browser never decides money values. Every amount stored on an order and charged through PhonePe is calculated on the server (`lib/checkout/pricing.ts`), and a payment is only confirmed when a verified PhonePe result reports the stored total.

## Main checkout flow

1. `app/checkout/components/PhonePePayment.tsx` generates a merchant transaction ID and calls `POST /api/create-order` with the shipping mode, address, discount code, transaction ID and the **total the customer saw**.
2. `/api/create-order` (customer session required) prices the order with `priceCheckout`:
   - items from `loadCartItems` (`lib/cart/loadCartItems.ts`, the same data as `GET /api/cart`); orphaned, unknown, zero-priced or out-of-stock items are rejected;
   - discount re-validated (active, expiry, usage limits, customer-locked coupons) and recalculated with `calculateDiscount`;
   - GST 18% included in prices, `round(afterDiscount − afterDiscount / 1.18)`, shipping not taxed;
   - shipping: Surface free; Express = live Delhivery quote per package (`quoteExpressPackages` + `lib/shipping/delhiveryQuote.ts`), no estimate fallback on the server;
   - total = subtotal − discount + shipping.

   If the shown total differs by more than ₹0.01, it returns `409 PRICE_CHANGED` with the server's figures; checkout updates its totals and the customer confirms again. Otherwise it creates the order (`payment_pending`) with the server values. Buy-now mode is rejected (its items came from the browser and no page uses it).
3. The browser calls `POST /api/order` with only `{ orderId }`. The handler requires the order owner's session and a `payment_pending` order, then initiates PhonePe V1 `PAY_PAGE` with the **stored** `totalAmount` (`toPaise`, exactly once) and the **stored** transaction ID.
4. The browser stores transaction/order details in session storage (used only for the status page and retry, never as payment proof) and redirects to PhonePe.
5. PhonePe redirects to `/payment/status`, which polls `GET /api/check-status/[transactionId]` (owner session required).
6. Independently, PhonePe calls `POST /api/phonepe-callback`.

## Confirmation (callback and polling)

Both paths call `confirmPayment` (`lib/payments/confirmPayment.ts`):

- the reported amount (paise) must equal `toPaise(order.totalAmount)`; otherwise the order is **not** confirmed and admins get a `payment-review` email;
- the order moves to `confirmed` with one atomic `updateMany` from `payment_pending`/`payment_failed`; only the caller that wins performs the side effects (discount usage, cart clearing, customer and admin emails), so they run exactly once whichever path is first;
- already paid orders are left alone.

The callback rejects requests whose `x-verify` is missing or does not equal `sha256(response + salt) + "###" + index` (`isValidCallbackChecksum`, timing-safe) with `401`, before decoding. Failure codes (`PAYMENT_ERROR`, `PAYMENT_DECLINED`, `PAYMENT_FAILED`) go through `failPayment`, which only changes `payment_pending` orders, so a late failure cannot undo a confirmed payment. A verified success for a transaction no order has (for example, one replaced by a retry) triggers a `payment-review` admin email.

The status route asks PhonePe's status API (production) server-to-server and applies a success through `confirmPayment`; an amount mismatch is reported to the page as `PAYMENT_REVIEW`.

## Retry

`/payment/status` generates a new transaction ID, calls `POST /api/orders/retry-payment` (owner, `payment_pending`/`payment_failed` only, transaction-ID format checked), then `POST /api/order` with the order ID. The amount is the stored order total.

## Route and source map

| Route / source | Responsibility |
| --- | --- |
| `lib/checkout/pricing.ts` | Server pricing (`priceCheckout`, `gstIncluded`, `discountFor`) |
| `lib/cart/loadCartItems.ts` | Cart items as the customer sees them (shared with `GET /api/cart`) |
| `app/checkout/components/expressShipping.ts` | Express package rules (shared by browser and server) |
| `lib/shipping/delhiveryQuote.ts` | Delhivery charge quote (server-only) |
| `lib/payments/phonepe.ts` | Host, signing, callback checksum, paise conversion, instrument mapping |
| `lib/payments/confirmPayment.ts` | Exactly-once confirmation and failure handling |
| `POST /api/create-order` | Session-gated order creation with server pricing |
| `POST /api/order` | Owner-gated PhonePe initiation from the stored order |
| `GET /api/check-status/[transactionId]` | Owner-gated status polling |
| `POST /api/phonepe-callback` | Signed server-to-server callback |
| `POST /api/orders/retry-payment` | Owner-gated retry preparation |
| `POST /api/update-order-status` | Admin-only (middleware); not used by the site |

## Configuration

| Variable | Purpose |
| --- | --- |
| `PHONEPE_MERCHANT_ID` | Merchant identifier (initiation and status) |
| `PHONEPE_SALT_KEY` | Server-only signing credential |
| `PHONEPE_KEY_INDEX` | Key (salt) index for signing payments, status checks, refunds and callback verification. Falls back to `PHONEPE_SALT_INDEX`, then `1`. **Must match the key index configured with PhonePe**, or every callback is rejected |
| `NEXT_PUBLIC_APP_URL` | Base for `/payment/status` and `/api/phonepe-callback` |
| `DELHIVERY_TOKEN` | Server-side Express quotes |

`PHONEPE_ENV` is no longer read by the active flow; initiation and status checks both use production (`PHONEPE_HOST`). Never place signing credentials in public environment variables, browser code, documentation, or logs.

## Remaining limitations

- **Legacy status routes:** `app/api/status/route.ts`, `app/api/status/[id]/route.ts` and `utils/payment-status.ts` hardcode their own values and redirect to missing routes. They are not part of the active flow; trace callers before removing.
- **Status API response:** the status route trusts PhonePe's TLS response without verifying a response checksum.
- **Retry reconciliation:** a late success for a replaced transaction ID is alerted to admins, not attached to the order automatically.
- **Express quote timing:** the browser and server quote Delhivery separately; a price change is caught by `PRICE_CHANGED`, not prevented.
- **Logging:** payload and checksum logging was removed from the active routes; keep it that way.

## Verification checklist

Automated: `lib/__tests__/checkout-pricing.test.ts`, `lib/__tests__/payments.test.ts`, `__tests__/payment-routes.test.ts`, `__tests__/create-order-discount.test.ts`. Mock HTTP, Prisma, authentication and email; do not initiate payments, refunds, shipments or real emails without explicit approval.

Before release, on a deployed environment: one real low-value payment (success), one cancelled/failed payment, a retry after failure, an Express order, an order with a coupon, and confirmation that duplicate callbacks/polling send only one set of emails.
