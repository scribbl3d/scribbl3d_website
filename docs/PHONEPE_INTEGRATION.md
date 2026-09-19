# PhonePe Integration

This guide describes the current repository implementation, not a certification that the payment flow is secure or production-ready. Read the limitations below before changing or exercising it. Use mocks or an explicitly approved test environment; local development does not automatically select sandbox endpoints.

For project setup and commands, see [README.md](../README.md). For cross-feature constraints, see [AGENTS.md](../AGENTS.md).

## Main checkout flow

1. `app/checkout/components/PhonePePayment.tsx` reads checkout pricing, shipping, and customer details and generates a merchant transaction ID in the browser.
2. It calls `POST /api/create-order`. The handler requires a customer session, supports `cart` and `buynow` modes, checks for an existing transaction ID, and creates an order with `payment_pending` status and JSON item/address snapshots.
3. It calls `POST /api/order` with the order ID, transaction ID, amount, mobile number, and merchant-user identifier. This handler initiates the PhonePe V1 `PAY_PAGE` request and converts the submitted amount to paise using `Math.round(amount * 100)`.
4. Before redirecting to PhonePe's returned payment URL, the browser stores `phonepe_transaction_id`, `phonepe_order_id`, `phonepe_amount`, `phonepe_name`, and `phonepe_mobile` in session storage.
5. PhonePe's configured browser redirect returns to `/payment/status`. That page gets the transaction ID from the query string or session storage and polls `GET /api/check-status/[transactionId]`. Pending/network-error outcomes are retried, with a bounded attempt count.
6. On reported success, the page clears the cart, resets checkout state, records the last payment information, and navigates to `/payment/success`. A success page or browser-stored amount is not proof of verified payment.
7. Independently, PhonePe can call `POST /api/phonepe-callback`. Callback and polling handlers have different side effects; they must be considered together.

Order creation and payment initiation are separate operations. `/api/order` does not create the local Prisma order or generate its transaction ID.

## Route and source map

| Route / source | Current responsibility |
| --- | --- |
| `POST /api/create-order` | Session-gated local order creation, cart/buy-now item handling, shipping-mode checks, and transaction-ID reuse check |
| `POST /api/order` | Payment payload encoding/signing, PhonePe initiation, and limited retries for upstream rate limiting |
| `GET /api/check-status/[transactionId]` | Return success for an already confirmed/shipped order, otherwise query PhonePe; on success, confirm the local order and record discount usage |
| `POST /api/phonepe-callback` | Parse JSON or form-encoded callback data, find the order by merchant transaction ID, and handle success/failure |
| `POST /api/orders/retry-payment` | Require a session and order ownership, allow retries only for `payment_pending`/`payment_failed`, and replace the order's transaction ID |
| `POST /api/update-order-status` | Separate session-gated status mutation; not an authoritative payment-verification endpoint |
| `app/payment/status/page.tsx` | Browser polling, success handling, pending/failure/timeout UI, and retry initiation |
| `providers/CheckoutProvider.tsx` | Checkout steps, addresses, pricing, and shipping state |
| `providers/CartProvider.tsx` | Customer cart and discount state, including cart clearing |

### Callback behavior

The callback reads the encoded `response`, calculates a SHA256 checksum, decodes the payload, and looks up the order by `data.merchantTransactionId`.

For `PAYMENT_SUCCESS`, it skips orders already marked `confirmed` or `shipped`; otherwise it updates payment details and confirms the order, records discount usage if not already recorded, clears the customer's cart, and attempts customer/admin emails through `lib/email/`.

For `PAYMENT_ERROR`, `PAYMENT_DECLINED`, or `PAYMENT_FAILED`, it marks the order `payment_failed`. Other codes currently receive a success acknowledgement without the same state change. Preserve the distinction between acknowledging receipt and confirming payment.

Shipment creation is not part of this callback. Fulfilment is handled through the operations/internal shipping routes and Delhivery helpers.

### Polling and retries

The status handler can mark an order confirmed and record discount usage, but it does not send the callback's confirmation/admin emails or perform its server-side cart clearing. The browser success handler separately clears the cart.

Retry UI generates a new merchant transaction ID, calls `/api/orders/retry-payment`, updates session storage, and invokes `/api/order` again for the existing order. Since the order's transaction ID is replaced, investigate delayed callbacks for earlier attempts when changing reconciliation behavior.

### Other payment paths

`app/api/status/route.ts`, `app/api/status/[id]/route.ts`, and `utils/payment-status.ts` contain additional status/redirect/polling logic. They are not the main `/payment/status` polling path. Some redirects target missing routes such as `/payment/failed` and `/payment/pending`; do not use those implementations as templates without checking callers and destinations.

Additional UI routes include `/payment/failure`, `/payment/status/failure`, `/payment/status/success`, and `/order-confirmation`. Their existence does not make them interchangeable with the active checkout return path.

## Configuration and environment selection

| Variable | Consumer / purpose |
| --- | --- |
| `PHONEPE_MERCHANT_ID` | Merchant identifier used by initiation and status requests |
| `PHONEPE_SALT_KEY` | Server-only signing credential |
| `PHONEPE_SALT_INDEX` | Callback/check-status checksum suffix |
| `PHONEPE_ENV` | `/api/check-status/[transactionId]` selects its production URL only for the value `prod`; otherwise it selects its preproduction URL |
| `NEXT_PUBLIC_APP_URL` | Base for `/payment/status` and `/api/phonepe-callback` URLs constructed during initiation |
| `DATABASE_URL` | Local order persistence and reconciliation |
| Customer auth/email configuration | Needed for session-gated checkout and email side effects; see the README |

Important inconsistencies in the current source:

- `/api/order` hardcodes a production PhonePe endpoint and salt index `1`; it does not use `PHONEPE_ENV` or `PHONEPE_SALT_INDEX` to select those values.
- The main status route uses environment-dependent URL construction and `PHONEPE_SALT_INDEX`; callback checksum calculation also uses that index.
- The older status helpers have their own hardcoded production URLs/index values.
- `/api/order` throws at module initialization if merchant ID or salt key is missing, which can affect build/startup as well as requests.

Do not assume setting `PHONEPE_ENV` alone creates a consistent test environment. Confirm all participating handlers and the merchant's approved gateway configuration before live testing. Never place signing credentials in public environment variables, browser code, documentation, or logs.

## Known limitations and required review

These are existing behaviors to investigate, not patterns to preserve in new implementation:

- **Callback authenticity:** the callback currently continues when `x-verify` is absent or mismatched. Calculating a hash without rejecting invalid requests is not signature verification.
- **Authorization and amounts:** `/api/order` does not perform its own session/ownership check and uses submitted amounts. Local order creation also accepts submitted pricing with limited validation. Financial authority must come from server-validated order data, not browser state.
- **Direct status mutation:** `/api/update-order-status` checks a session but currently does not check order ownership or validate allowed status transitions before accepting the supplied status.
- **Reconciliation races:** polling can confirm an order before the callback, causing the callback's early return to skip its emails/cart cleanup. Failure callbacks also need review so stale events cannot regress a later successful state.
- **Idempotency:** existing transaction/status/discount-usage checks do not establish atomic exactly-once processing across concurrent callbacks, polling, retries, or email sends.
- **Sensitive logging:** several payment handlers log payloads, checksums, or provider responses. Do not expose these logs in bug reports or copy that logging pattern into new code.
- **Legacy redirects:** additional status handlers reference missing destinations and differ from the active flow. Trace their callers before cleanup or consolidation.

Documentation updates do not fix these issues. Scope implementation changes explicitly and cover them with regression tests rather than treating this guide as evidence of payment safety.

## Verification checklist

Mock HTTP, Prisma, authentication, and email boundaries as appropriate. Do not initiate payments, refunds, shipments, or real email delivery without explicit approval.

- Order creation: session handling, ownership, cart/buy-now mode, item/variant validity, trusted pricing, shipping rules, and transaction reuse.
- Initiation: rupee-to-paise conversion exactly once, valid gateway response, error/rate-limit handling, and consistent environment/index selection.
- Callback: JSON and form-encoded payloads, malformed input, absent/invalid signature, unknown transaction, pending/failure/success, replay, and late events.
- Reconciliation: concurrent polling/callbacks, duplicate discount usage, cart cleanup, email behavior, and preventing success-to-failure regression.
- Retry: owned pending/failed orders only, a new transaction ID, and delayed responses for earlier attempts.
- Browser: redirect/return behavior, lost session storage, bounded polling, timeout/retry UI, and success navigation/back behavior. jsdom alone does not verify real browser navigation.

Use the Jest and type-check commands in [README.md](../README.md#commands-and-verification). Existing utility/component tests are not proof of end-to-end payment coverage. Any approved gateway test needs a confirmed non-production target and an explicit plan for external side effects.
