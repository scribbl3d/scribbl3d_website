# Payment Event Logging — API and Database Design

Status: **Proposed**, not yet implemented. Architecture and rationale are in [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md).

## 1. Database

### 1.1 Prisma model (addition to `prisma/schema.prisma`)

```prisma
model PaymentEvent {
  id             String   @id @default(cuid())
  createdAt      DateTime @default(now())

  // Correlation
  transactionId  String?            // merchant txn ID (TXN...), null only if unknown (e.g. malformed callback)
  orderId        String?            // no FK on purpose: logs must survive unknown/deleted orders and never block order writes
  userId         String?

  // What happened
  event          String             // see event catalogue (§3); string, matching repo convention for statuses
  source         String             // "server" | "phonepe" | "client"
  route          String?            // e.g. "/api/phonepe-callback"
  level          String   @default("info") // "info" | "warn" | "error"

  // State snapshot
  orderStatus    String?            // Order.status after this step (or at the time of the step)
  previousStatus String?            // for order_status_changed

  // PhonePe response summary (null for non-gateway events)
  providerCode   String?            // e.g. PAYMENT_SUCCESS, PAYMENT_PENDING, PAYMENT_ERROR, BAD_REQUEST
  providerState  String?            // data.state, e.g. COMPLETED / PENDING / FAILED
  providerTxnId  String?            // PhonePe's own data.transactionId
  responseCode   String?            // data.responseCode (failure reason)
  httpStatus     Int?
  checksumValid  Boolean?           // callbacks only; never store checksum values
  amountPaise    Int?               // amount as sent to / reported by PhonePe

  durationMs     Int?
  attempt        Int?               // retry attempt number (429 backoff) or payment retry count
  payload        Json?              // small allowlisted extras only (≤ ~2 KB)
  error          String?            // sanitized message, truncated (~500 chars)

  @@index([transactionId, createdAt])
  @@index([orderId, createdAt])
  @@index([event, createdAt])
  @@index([createdAt])
}
```

Notes:

- The model is additive. No existing model changes, and there is no relation to `Order` or `User` (see SYSTEM_DESIGN §4.9).
- Columns hold what you'll filter or scan on: code, state, checksum result, amount. Everything else goes in the `payload` JSON.
- `amountPaise` is an integer because PhonePe reports paise. Order amounts stay in rupees on `Order`, and the timeline UI converts for display. Never apply `× 100` twice.
- Migration: the SQL for this is a single `CREATE TABLE` plus indexes. Generate it with `prisma migrate dev --create-only` against a development database, review it, and apply it to production only with explicit approval (see SYSTEM_DESIGN §8).

### 1.2 Example query patterns

| Need | Query |
| --- | --- |
| Timeline for one order (all attempts) | `where: { orderId }`, `orderBy: { createdAt: "asc" }` |
| Timeline for a transaction ID the customer reported | Look up `orderId` from the first event with that `transactionId`, then run the order timeline |
| Last polled code, for deduplication | `findFirst({ where: { transactionId, event: "phonepe_status_response" }, orderBy: { createdAt: "desc" }, select: { providerCode: true } })` |
| Checksum failures | `where: { checksumValid: false }` |
| Callbacks for unknown orders | `where: { event: "callback_order_not_found" }` |
| PhonePe success but order not confirmed (investigate) | Events with `providerCode = "PAYMENT_SUCCESS"`, joined in application code to `Order.status != "confirmed"/"shipped"` |

## 2. Server helper contract (`lib/payment-events/`)

```ts
// types.ts
export type PaymentEventSource = "server" | "phonepe" | "client";
export type PaymentEventLevel = "info" | "warn" | "error";
export type PaymentEventName = /* union of names in §3 */ string;

export interface PaymentEventInput {
  event: PaymentEventName;
  source: PaymentEventSource;
  route?: string;
  level?: PaymentEventLevel;
  transactionId?: string | null;
  orderId?: string | null;
  userId?: string | null;
  orderStatus?: string | null;
  previousStatus?: string | null;
  provider?: PhonePeSummary;       // produced only by sanitize.ts
  amountPaise?: number | null;
  durationMs?: number;
  attempt?: number;
  payload?: Record<string, string | number | boolean | null>; // flat, allowlisted
  error?: unknown;                 // converted to a truncated message
}

export interface PhonePeSummary {
  success?: boolean;
  code?: string;
  message?: string;
  state?: string;
  responseCode?: string;
  providerTxnId?: string;
  instrumentType?: string;         // UPI / CARD / NETBANKING ...
  amountPaise?: number;
  httpStatus?: number;
  checksumValid?: boolean | null;
  hasRedirectUrl?: boolean;        // initiation only; never store the URL
}
```

```ts
// log.ts (server-only)
export async function logPaymentEvent(input: PaymentEventInput): Promise<void>;
// - Writes the sanitized record as a single JSON line to stdout (always).
// - Inserts into PaymentEvent via the shared `prisma` client, raced against a ~2s timeout.
// - Catches everything; never throws; never alters caller behaviour.

// sanitize.ts
export function summarizePhonePeResponse(raw: unknown, extra?: { httpStatus?: number; checksumValid?: boolean | null }): PhonePeSummary;
// Allowlist extraction only. Drops payerVpa, maskedCardNumber, redirect URLs, and anything not listed above.
```

```ts
// client.ts (browser)
export function trackPaymentEvent(event: ClientPaymentEventName, data: { transactionId?: string; orderId?: string; meta?: Record<string, string | number | boolean> }): void;
// Uses navigator.sendBeacon, falling back to fetch({ keepalive: true }), so it survives the redirect to PhonePe. Fire-and-forget; swallows errors.
```

## 3. Event catalogue

`S` = server, `P` = PhonePe response or callback (written by the server with `source: "phonepe"`), `C` = client.

| # | Event | Src | Written in | Key fields / payload |
| --- | --- | --- | --- | --- |
| 1 | `checkout_clicked` | C | `PhonePePayment.tsx` | `mode` (cart/buynow), `itemCount`, `shippingMode`, `clientAmount` |
| 2 | `order_create_requested` | S | `/api/create-order` | `mode`, `shippingMode`, `itemCount` |
| 3 | `order_created` | S | `/api/create-order` | `orderId`, `orderStatus=payment_pending`, `totalAmount`, `discountCode` present (bool) |
| 4 | `order_create_reused` | S | `/api/create-order` (idempotency hit) | `orderId`, existing `orderStatus` |
| 5 | `order_create_failed` | S | `/api/create-order` (400 or 500) | `error`, `httpStatus`, validation reason |
| 6 | `payment_init_requested` | S | `/api/order` | `amountPaise`, `attempt` |
| 7 | `phonepe_init_response` | P | `/api/order` | `providerCode`, `success`, `hasRedirectUrl`, `httpStatus`, `durationMs` |
| 8 | `phonepe_init_rate_limited` | P | `/api/order` (429 retry) | `attempt`, `httpStatus=429` |
| 9 | `phonepe_init_error` | P | `/api/order` (final catch) | `httpStatus`, `providerCode`, `message`, `error` |
| 10 | `redirected_to_phonepe` | C | `PhonePePayment.tsx` | — |
| 11 | `checkout_client_error` | C | `PhonePePayment.tsx` catch | sanitized message |
| 12 | `phonepe_callback_received` | P | `/api/phonepe-callback` | `providerCode`, `state`, `responseCode`, `providerTxnId`, `instrumentType`, `amountPaise`, `checksumValid`, `contentType` |
| 13 | `callback_invalid` | S | `/api/phonepe-callback` | reason: missing response, decode failure, or missing transaction ID |
| 14 | `callback_order_not_found` | S | `/api/phonepe-callback` | `transactionId` |
| 15 | `callback_duplicate_ignored` | S | `/api/phonepe-callback` (already confirmed/shipped) | `orderStatus` |
| 16 | `callback_unhandled_code` | S | `/api/phonepe-callback` (any code other than success or the failure set) | `providerCode` |
| 17 | `phonepe_status_response` | P | `/api/check-status/[transactionId]` (deduplicated on `providerCode`) | `providerCode`, `state`, `responseCode`, `providerTxnId`, `instrumentType`, `amountPaise`, `httpStatus`, `durationMs` |
| 18 | `phonepe_status_error` | P | `/api/check-status` catch | `httpStatus`, `providerCode`, timeout (bool), `error` |
| 19 | `status_already_confirmed` | S | `/api/check-status` early return | `orderStatus` (write once per transaction; deduplicate like #17) |
| 20 | `order_status_changed` | S | callback, `check-status` `handlePaymentSuccess`, `update-order-status`, `retry-payment` | `previousStatus`, `orderStatus`, `payload.via` |
| 21 | `discount_usage_recorded` / `discount_usage_failed` | S | callback, `check-status` | `payload.discountCode`, `error` |
| 22 | `cart_cleared` / `cart_clear_failed` | S | callback | `error` |
| 23 | `email_customer_sent` / `email_customer_failed` | S | callback (inside the existing `.then`/`.catch`) | `error` |
| 24 | `email_admin_sent` / `email_admin_failed` | S | callback | `error` |
| 25 | `payment_retry_requested` | S | `/api/orders/retry-payment` | `payload.oldTransactionId`, new `transactionId`, `previousStatus` |
| 26 | `status_polling_started` | C | `/payment/status` | `payload.fromQuery` or `fromSessionStorage` |
| 27 | `status_polling_timeout` | C | `/payment/status` | `attempt` |
| 28 | `retry_clicked` | C | `/payment/status` | — |
| 29 | `final_page_shown` | C | `/payment/status`, `/payment/success`, `/payment/failure` | `payload.result`: `success`/`failure`/`pending`/`timeout` |

Rules:

- Server events #2–#25 are authoritative. Client events (#1, #10, #11, #26–#29) are supporting evidence only.
- Emails are sent fire-and-forget, so their events are written from the promise's `.then` or `.catch`. The callback response is never delayed by them.

## 4. APIs

### 4.1 `POST /api/payment-events` — client event ingest

| Aspect | Rule |
| --- | --- |
| Auth | NextAuth session required (`getServerSession(authOptions)`), otherwise `401`. `userId` is always taken from the session |
| Ownership | If `orderId` or `transactionId` is supplied, check it belongs to the session user (a single `order.findFirst`). If it doesn't, drop the IDs and still store the event with `level: "warn"` |
| Rate limit | `applyRateLimit(getClientIdentifier(req), ~30, 60_000)` from `lib/api-helpers.ts`, otherwise `429` |
| Validation | Zod: `event` ∈ client allowlist; `transactionId` ≤ 64 chars matching `^TXN[\w]+$`; `orderId` ≤ 40 chars; `meta` flat, ≤ 10 keys, each value a primitive ≤ 200 chars; body ≤ 4 KB |
| Behaviour | Calls `logPaymentEvent({ ...validated, source: "client", route: "/api/payment-events" })`. Never changes order state |
| Response | `204 No Content`. Also returns `204` when logging itself fails internally, because the browser has nothing to act on |

Request:

```json
{
  "event": "final_page_shown",
  "transactionId": "TXN1727500000000abc123",
  "orderId": "clx...",
  "meta": { "result": "pending" }
}
```

### 4.2 `GET /api/admin/payment-events` — timeline and search (admin)

| Aspect | Rule |
| --- | --- |
| Auth | `isAdminRequest(req)` from `lib/admin-session.ts`, otherwise `401`. Checked server-side in the handler |
| Query params | One of `orderId`, `transactionId`, `providerTxnId`. Or a search using `event`, `from`, `to` (ISO dates), `checksumValid`, `level` |
| Pagination | `limit` (default 50, max 200) and `cursor` (the last `id`) for search mode. Timeline mode returns every event for the order (bounded by the per-order volume) |
| Resolution | With `transactionId` or `providerTxnId`, find the `orderId` first, then return the full order timeline so all retry attempts are included |

Response (timeline mode):

```json
{
  "order": { "id": "clx...", "status": "confirmed", "totalAmount": 1499, "createdAt": "..." },
  "attempts": [
    {
      "transactionId": "TXN1727...abc",
      "events": [
        { "id": "...", "createdAt": "...", "event": "order_created", "source": "server", "orderStatus": "payment_pending" },
        { "id": "...", "createdAt": "...", "event": "phonepe_init_response", "source": "phonepe", "providerCode": "PAYMENT_INITIATED", "httpStatus": 200, "durationMs": 640 },
        { "id": "...", "createdAt": "...", "event": "phonepe_callback_received", "source": "phonepe", "providerCode": "PAYMENT_SUCCESS", "checksumValid": true, "amountPaise": 149900 }
      ]
    }
  ],
  "summary": {
    "finalOrderStatus": "confirmed",
    "confirmedVia": "phonepe-callback",
    "phonepeLastCode": "PAYMENT_SUCCESS",
    "amountMismatch": false,
    "emailsSent": { "customer": true, "admin": true },
    "flags": []
  }
}
```

The `order` block contains only non-personal fields (ID, status, amounts, dates). Addresses and contact details are not returned by this endpoint.

`summary.flags` are computed on the server and warn about problems, e.g.:

- `CHECKSUM_INVALID`
- `NO_CALLBACK_RECEIVED`
- `PHONEPE_SUCCESS_ORDER_NOT_CONFIRMED`
- `AMOUNT_MISMATCH` (`amountPaise ≠ round(totalAmount × 100)`)
- `CONFIRMED_BY_POLLING_EMAILS_SKIPPED`

### 4.3 `GET /api/admin/payment-events/attention` (optional, later)

- Admin only.
- Lists recent orders that have a warning flag from §4.2, for a "needs attention" panel. It is a read-only aggregation over the last N days.

### 4.4 Existing APIs: no contract changes

`/api/create-order`, `/api/order`, `/api/phonepe-callback`, `/api/check-status/[transactionId]`, `/api/orders/retry-payment` and `/api/update-order-status` keep their current request and response shapes and status codes. They only gain calls to `logPaymentEvent`.

## 5. Ops dashboard UI

- Route: `app/ops/control/payment-logs/page.tsx`. It sits behind the existing `/ops/control` middleware gate, and its data comes from the admin API above, which checks the session itself. A per-order "Payment timeline" button can also be added in `app/ops/control/orders`.
- The page has:
  - a search box (order ID, TXN ID or PhonePe transaction ID);
  - summary chips (final status, confirmed via, warning flags);
  - a vertical timeline grouped by attempt, colour-coded by `source` (client / server / PhonePe) and `level`;
  - an expandable `payload` for each event.
- Amounts are shown in rupees (`amountPaise / 100`) and labelled so the unit is clear.

## 6. Testing plan

| Test | Location |
| --- | --- |
| `summarizePhonePeResponse` keeps only allowlisted fields; drops VPA, card, redirect URL and checksum | `lib/__tests__/payment-events-sanitize.test.ts` |
| `logPaymentEvent` never throws when Prisma rejects or times out; still writes the stdout line | `lib/__tests__/payment-events-log.test.ts` (mocked Prisma) |
| Callback: success, failure, duplicate, unknown order and invalid-checksum paths each write the expected events | Route test with mocked Prisma, email and crypto input |
| Check-status deduplication: repeated `PAYMENT_PENDING` writes one row; a change to `PAYMENT_SUCCESS` writes a new row | Route test |
| Ingest endpoint: `401` without a session, `429` when over the limit, rejects unknown events, drops foreign order IDs | Route test |
| Admin API: `401` without an admin session; timeline groups retry attempts | Route test |

Mock PhonePe, Prisma and email in every test. No live gateway calls.
