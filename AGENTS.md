# Scribbl3D — Repository Guide for Agents

## Purpose and scope

Scribbl3D is an India-focused 3D-printing commerce and services platform. It sells printers, filaments, resins, and prebuilt/customizable products; accepts design, prototyping, small-batch manufacturing, and personalization requests; and provides an operations dashboard for catalogue, content, orders, and fulfilment.

This guide applies throughout the repository. Use it as a navigation map and a set of working constraints, not a replacement for reading the affected code. Update it when architecture or verified development commands change. Keep temporary task notes and exhaustive file inventories out of this file.

## Working rules

- Inspect `git status` before editing. Preserve existing user changes and untracked work; do not revert, rename, or clean up unrelated files.
- Trace the complete affected path before changing a feature: page/component → hook/provider → API or server action → Prisma model/external service, including its admin editor when relevant.
- Prefer small changes to existing modules. Match the surrounding formatting and conventions; this repository is not uniformly formatted. Avoid unrelated refactors, new abstractions, and dependency upgrades.
- Treat executable code, `package.json`, and `prisma/schema.prisma` as authoritative when older documentation disagrees. Several legacy auth modules, product types, and scripts remain in the tree.
- Do not invent pricing, taxes, discounts, shipping promises, refund rules, product specifications, legal wording, or business contact details. Ask for missing business requirements.
- Never expose secrets or customer data in code, logs, tests, documentation, or responses. Do not copy existing insecure patterns into new code.
- Do not run migrations, seeds, cleanup/restore scripts, live payment/refund requests, shipment/pickup creation, or real emails without explicit approval and confirmation of the target environment.

## Stack and local setup

- Single Next.js 15 App Router application, React 18, TypeScript 5, and Node.js 20 (`.nvmrc`); there is no separate backend service or `src/` application root.
- PostgreSQL through Prisma 6. Schema: `prisma/schema.prisma`; migrations: `prisma/migrations/`.
- Tailwind CSS 3 and shadcn/Radix components; existing styled-components, Framer Motion, GSAP, and Lottie usage. Forms use React Hook Form and Zod where applicable; blog editing uses TipTap.
- NextAuth v4 for customer authentication. PhonePe is the checkout integration; Delhivery handles logistics; Cloudinary handles media. The shared transactional email sender currently selects ZeptoMail.
- Use npm and the existing `package-lock.json`. Do not introduce another package-manager lockfile. Preserve repository npm/security configuration.
- On a fresh checkout, use Node 20 and `npm ci`. The `postinstall` script generates the Prisma client. `npx prisma generate` regenerates it after schema changes without applying a database migration.
- Use `.env.example` as a starting template only, and obtain credentials through the project's approved channel. Never overwrite an existing `.env`. The example does not cover every active integration.
- `npm run dev` starts the local app (normally port 3000). Database-backed pages require an accessible development database. Builds may require integration variables, database access, and network access for `next/font/google`; do not substitute production credentials just to make verification pass.

### Environment configuration map

Document variable names, never values. Check the actual consumer before configuring an integration:

| Concern | Relevant configuration / source |
| --- | --- |
| Database | `DATABASE_URL`; `prisma/schema.prisma`, `lib/prisma.ts` |
| Customer auth | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`; `app/api/auth/[...nextauth]/options.ts` |
| Public URLs | `NEXT_PUBLIC_BASE_URL` for shared SEO metadata; `NEXT_PUBLIC_APP_URL` for PhonePe redirect/callback construction. These serve different consumers. |
| PhonePe | `PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY`, `PHONEPE_SALT_INDEX`; payment routes under `app/api/` |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`; `lib/cloudinary.ts` and upload handlers |
| Delhivery | The shipment client uses `DELHIVERY_TOKEN`, not the `DELHIVERY_API_KEY` entry in the example file; inspect the specific logistics handler too. |
| Transactional email | `ZEPTOMAIL_API_TOKEN` (or `ZEPTOMAIL_API_KEY`), `ZEPTOMAIL_FROM_EMAIL`, optional `ZEPTOMAIL_FROM_NAME`; `lib/email/sendEmail-zeptomail.ts` |
| Admin access | Inspect `app/api/admin/login/route.ts`, `lib/auth.ts`, and `lib/session.ts`; do not reuse customer auth assumptions or hardcoded credential fallbacks. |

Only browser-safe values belong in `NEXT_PUBLIC_*` variables. Installed packages and sample variables for Razorpay, Redis, SES, SendGrid, or Resend do not establish that they are the active implementation for a particular flow.

## Repository map

| Area | Entry points and responsibilities |
| --- | --- |
| Root shell | `app/layout.tsx` loads the server session, fonts, default metadata, structured data, and support widget. `app/providers.tsx` composes shared providers, navbar, footer, toasts, and analytics. |
| Homepage | `app/page.tsx` loads catalogue/CMS data through Prisma; presentation lives in `app/landingpage/components/`. Do not replace managed content with hardcoded copies. |
| Catalogue | `app/filament/`, `app/printers/`, `app/resins/`, `app/prebuilt-products/`; corresponding `components/filaments/`, `components/printers/`, `components/resins/`, `components/prebuilt-products/`. |
| Dynamic category route | `app/[category]/` coexists with dedicated catalogue routes. Trace its callers before modifying or removing it; a directory alone does not establish an active route. |
| Cart and checkout | `app/cart/`, `app/checkout/`, `providers/CartProvider.tsx`, `providers/CheckoutProvider.tsx`, `components/CheckoutButton.tsx`. |
| Customer account | `app/login/`, `app/register/`, password-reset pages, `app/profile/`, `app/actions.ts`, and `app/actions/`. |
| Payments and orders | `app/payment/`, `app/order/`, `app/order-confirmation/`; `app/api/create-order/`, `app/api/order/`, `app/api/orders/`, `app/api/check-status/`, `app/api/phonepe-callback/`, `app/api/update-order-status/`. |
| Service enquiries | `app/services/_component/` contains design, prototyping, and small-batch forms; `app/personalise/` handles personalization. APIs include `form-responses`, `prototyping-request`, `small-batch-manufacturing`, and `personalise-form`. |
| Content | `app/blog/`, `app/about/`, `app/contact/`, landing-page components, and matching API handlers. |
| Legal pages | `app/(policies)/` and `components/PolicyLayout.tsx`; route groups do not appear in public URLs. |
| Operations dashboard | `app/ops/control/` is the main admin UI; `app/api/admin/` contains many admin endpoints. `app/admin/` is not the main dashboard. Some management endpoints also exist outside `/api/admin`. |
| Shipping | `app/api/internal/`, `app/api/shipping/`, `lib/delhivery/`, `lib/shipment/`, `lib/pickup/`, `lib/shipping-calculator.ts`. |
| Shared code | `components/ui/` for UI primitives, `components/shared/`, `hooks/`, `lib/`, `utils/`, `types/`, and feature-local types. |
| Assets and styling | `public/`, `app/fonts/`, `app/fonts.ts`, `app/globals.css`, `app/editor.css`, `styles/`, `tailwind.config.ts`. |
| Tests | Root `__tests__/` plus colocated `__tests__/` in `lib/`, `utils/`, `hooks/`, and `components/`. |
| Maintenance | `prisma/seed.ts`, `scripts/`, `script/`, and root backup/restore/test scripts. These are not routine verification commands. |

## Application architecture and conventions

- Keep pages/layouts as Server Components where possible. Add `"use client"` only where browser APIs, hooks, context, or interaction require it. Keep secrets, Prisma, and privileged integration clients server-side.
- Imports using `@/` resolve to the repository root. Reuse existing UI primitives, `cn` in `lib/utils.ts`, feature components, hooks, and validation utilities before adding alternatives.
- Preserve the provider order: `SessionProvider` → `CartProvider` → `CheckoutProvider`. Checkout depends on cart state. Avoid mounting duplicate state providers or a second site shell inside individual pages.
- Most server data access uses the singleton exported as `prisma` from `lib/prisma.ts`. `lib/db.ts` also exports `db`; follow the affected module's imports rather than introducing per-request Prisma clients.
- Route handlers live in `app/api/**/route.ts`; server actions also exist. Follow nearby Next.js 15 conventions for asynchronous route parameters, cookies, and headers.
- Use explicit TypeScript types for new contracts and validate untrusted inputs server-side. `tsconfig.json` enables `strict` but explicitly disables `noImplicitAny`; do not treat existing `any` usage as a preferred pattern.
- Reuse suitable schemas from `lib/validations/api-schemas.ts` and helpers from `lib/api-helpers.ts`, but compare them against the actual request/model: some generic schemas do not match newer catalogue flows.
- Preserve existing response shapes, HTTP status handling, pagination, filtering, loading, empty, and error states. Keep server-only objects and non-serializable values out of client props.
- Shared UI changes must work on mobile and desktop, preserve keyboard navigation and focus visibility, and use semantic labels/headings. Scope CSS carefully; `app/globals.css` affects unrelated pages.

## Domain model and business-critical flows

### Catalogue and variants

There is no current Prisma `Product` model. Do not assume the old generic product abstraction represents all catalogue families.

| Family | Model / selection rules |
| --- | --- |
| Filaments | `Filament` represents a colour-specific product; `FilamentColorGroup` links related colours. `FilamentVariant` selects diameter and spool weight, with its own price and stock. Public listing path is `/filament`; APIs use `/api/filaments`; the admin UI uses `filaments-new`. |
| Resins | `Resin`, `ResinColour`, and `ResinWeight` are distinct selections. Preserve colour imagery and weight-specific pricing/stock, and the schema's `Colour` spelling. |
| Printers | `Printer` owns price/stock plus related images, attributes, specifications, features, applications, and downloads. Dimensions and weight feed shipping calculations. |
| Prebuilt products | `PrebuiltProducts` and `PrebuiltVariants` support colour/size selection, price, active/stock state, dimensions, and customization. Preserve existing schema spellings such as `prebuildProductId`. |

- A catalogue change may require updates to the admin form/API, public list/detail views, DTOs/types, variant selection, cart, wishlist, reviews, search, recommendations, stock notifications, and SEO feeds. Check relevant consumers rather than changing only the product page.
- Preserve product and variant IDs throughout mutations. Missing/deleted/out-of-stock variants must not silently select an unrelated variant or become purchasable at a zero-price fallback.
- Slugs, image ordering, primary images, colour grouping, and active/default flags are part of the user-visible contract.
- Printer admin create/update handlers derive material attributes only from the `Supported Materials` specification and reject temperature values. Preserve this separation when changing specifications or material filters.

### Cart, discounts, and checkout

- `providers/CartProvider.tsx` owns customer cart state and discount recalculation; it fetches and mutates `/api/cart`. Its exported `CartItem`/`AddToCartPayload` types are important consumers' contracts.
- `app/api/cart/route.ts` normalizes the different Prisma product relations into cart items. Check `app/api/cart/[id]/route.ts`, `hooks/use-add-to-cart.ts`, and `app/api/buynow/` for related mutations/flows.
- Preserve both `cart` and `buynow` checkout modes. `CheckoutProvider` holds steps, addresses, selected shipping, and pricing passed from the cart. Do not let independent recalculations diverge between cart, checkout, stored orders, and payment initiation.
- Discount logic spans `app/cart/utils/`, discount API handlers, and `lib/discount-utils.ts`. Preserve scope, eligible item types, expiry, minimum spend, caps, first-order eligibility, and per-user usage limits. The schema's discount `ItemType` enum and newer cart item types are not identical; do not silently rename their values.
- Use existing safe-number/formatting helpers (`lib/cart-utils.ts`, `lib/safeNum.ts`, `lib/utils.ts`) as appropriate. Test null/invalid prices, quantity updates, variant removal, and asynchronous discount updates.
- All catalogue prices (printers, filaments, resins, prebuilt variants) are stored in whole rupees. Leave the existing printer `priceDisplay` formatting in the printer list page and `/api/printers` handlers unchanged unless the user asks. `/api/order` converts the submitted amount to PhonePe paise with `Math.round(amount * 100)`; do not apply that conversion twice.
- Shipping weight/dimension units also vary. Trace `app/checkout/components/expressShipping.ts` and logistics mapping before changing grams/kilograms or millimetres/centimetres.

### Payments, orders, and fulfilment

1. `app/checkout/components/PhonePePayment.tsx` posts order data to `/api/create-order` with a transaction ID.
2. `/api/create-order` stores an order, including JSON item/address snapshots and pricing, initially `payment_pending`.
3. The client calls `/api/order` to initiate PhonePe payment and redirects to the returned payment URL; transaction details are retained in session storage for status/retry handling.
4. Callback and status/update routes reconcile payment state. On payment success, the callback marks orders confirmed, records discount usage, clears the cart, and triggers confirmation/admin email delivery.
5. Operations routes manage fulfilment, shipment synchronization, refunds, invoices, and credit notes. Do not assume successful payment automatically creates a shipment; trace the active caller.

- `Order.status` and shipment/refund states are strings, not one universal enum. Check every reader/writer before changing status names or transitions.
- Preserve transaction uniqueness, ownership checks, and replay/idempotency behavior. Test duplicate callbacks, payment retries, failure/pending states, and discount redemption consistency. Do not treat browser-supplied totals or success pages as authoritative payment verification.
- Payment verification needs explicit review: the existing PhonePe callback computes a checksum but currently does not reject mismatches. This is a known unsafe behavior, not a pattern to replicate or a guarantee of verified payment.
- Delhivery supports single-package and multi-package shipments; preserve master/child waybills, package counts, units, pickup state, and sync/retry controls. Integrations can call production endpoints even in local development; mock external calls in tests.
- Read `lib/refund.ts`, `lib/refundStatus.ts`, `lib/invoice/`, and affected admin endpoints before financial-document changes. Preserve order snapshots, unique invoice/credit-note identifiers, and `DocumentCounter` behavior.
- Shared transactional email functions/templates live in `lib/email/`; `sendEmail.ts` selects ZeptoMail. Other email modules exist, so follow the caller instead of globally switching providers.

### Authentication and authorization

- The active NextAuth handler imports `app/api/auth/[...nextauth]/options.ts`: credentials plus Google OAuth, `CustomPrismaAdapter`, and JWT sessions. Do not assume database-session mode merely because a `Session` model exists.
- Root `auth.ts`, `auth.config.ts`, `lib/auth.ts`, and `lib/session.ts` coexist with the active NextAuth options. Inspect imports before changing them; they are not interchangeable.
- `middleware.ts` handles customer redirects, checkout-entry restrictions, CORS, and the `/ops/control` cookie gate. Checkout uses the `checkout-access` cookie/cart referer flow; preserve it when changing navigation.
- Admin login issues a one-hour signed `admin_token` JWT via `lib/admin-session.ts`, using `JWT_SECRET` or the existing `NEXTAUTH_SECRET` without a hardcoded signing fallback. The admin page middleware, announcement management APIs, and invoice admin access verify this session. Legacy unsigned admin cookies require signing in again. The existing `authenticateAdmin` credential source is separate from session signing.
- Cookie presence or a protected page does not establish authorization for other API requests. Sensitive endpoints must verify authentication, authorization, and resource ownership server-side.
- `withApiProtection` in `lib/api-helpers.ts` performs validation/rate limiting, but its `requireAuth` branch is currently a placeholder. Do not rely on that flag as an authentication check.
- Review registration, OTP, password-reset, login-rate-limit, and account-linking behavior together when changing customer access. Do not weaken expiry, attempt limits, or token checks to unblock a test.

## UI, content, and SEO

- Reuse existing fonts, Tailwind theme tokens, buttons, dialogs, toasts, and layout patterns. `components.json` configures shadcn's `new-york` style and root aliases.
- CMS-managed content includes hero banners, best sellers, community images, testimonials, partners, about/page heroes, announcements, and blogs. Preserve visibility, sort order, draft/publication, and slug behavior when relevant.
- SEO entry points: `lib/metadata.ts`, `components/seo/`, `components/StructuredData.tsx`, `app/sitemap.ts`, `app/robots.ts`, and `app/api/google-merchant-feed/route.ts`. Preserve canonicals, structured data, social images, and product availability/price consistency.
- Product detail pages build JSON-LD with `buildProductJsonLd`/`buildBreadcrumbJsonLd` and serialize it with `jsonLdString`. Render JSON-LD as a plain `<script>` in server output (not `next/script`) so non-JS crawlers see it. Never publish zero-price offers; review ratings stay out until the review system is complete.
- AI-crawler content: `public/llms.txt` is hand-maintained and must contain only facts verified against live pages (policies, contact page); `app/llms-full.txt/route.ts` generates the catalogue index from the database. Named crawler groups in `app/robots.ts` do not inherit the `*` rules, so keep their disallow lists in sync.
- `next.config.mjs` contains image-host allowlists, headers, optimizations, and legacy redirects (including `/filaments` → `/filament`). Check it before renaming public routes or adding image hosts; do not remove redirects casually.
- Keep uploads within the existing Cloudinary/upload flow. Validate file types/size and retain image alt text and accessible form errors.

### Announcement bar and header

- `app/providers.tsx` mounts `app/landingpage/AnnouncementBanner.tsx` above the existing navbar. The user wants rotating published messages, no close button, and no default promotional content. Hide the bar on operations/admin, checkout, and payment routes, or when no announcements are published.
- The user prefers a more prominent announcement bar: minimum content height 44px on mobile and 48px on larger screens, with 16px text on mobile and 18px on larger screens. Preserve automatic height measurement and allow long content to wrap.
- Rotation loops continuously through published announcements every 4 seconds with a smooth downward entrance and a small settling bounce. Do not show pause, next, or close buttons on the bar. Pause rotation on hover/focus or hidden tabs; disable autoplay and animation for reduced motion. For multiple messages, the bar is keyboard-focusable and supports left/right arrow keys without visible controls. Public announcements refresh every minute and on window focus.
- `--announcement-height` is measured by `ResizeObserver`; `--site-header-height` includes the 80px navbar. The provider adds only the announcement offset to page content. Existing page-level navbar padding remains; sticky elements and anchor offsets should use the shared height variable rather than fixed offsets.
- Keep the announcement admin editor compact: a narrower panel, message and icon on one desktop row, paired link fields below, and publish/save controls in a single footer row. Stack fields on mobile without reducing storefront typography.
- Manage messages at `/ops/control/announcements`. Public `GET /api/announcements` exposes only published records. The `?admin=true` listing and POST/PATCH/DELETE operations require a verified admin session. Validation and CTA URL rules live in `lib/announcements.ts`.
- Announcement records include optional message text, icon, one optional paired link text/URL, and publication status. Ordering is automatic by creation time (newest first, with ID as the tie-breaker). Do not show a manual order input or order-number badges. The existing `sortOrder` field is retained for compatibility but no longer affects the display sequence. Support text-only, link-only, or text followed by one inline link; reject completely empty content. Link text supplies the visible/accessibility label, not an HTML `alt` attribute. Keep one link only. Show the selected icon on the left, a decorative vertical divider only when both text and link are present, and a decorative right arrow after the link. Preview and storefront styling should match.
- New announcement records default to drafts. Apply an approved additive migration for their fields/index before enabling management against an older database; Prisma client generation alone does not alter the database.
- Announcement tests cover input validation, APIs, banner behaviour, and admin controls. `lib/__tests__/admin-session.test.ts` runs the real signing library in a Node subprocess via the existing `tsx` dependency to avoid jsdom selecting its browser ESM export.

### Policy pages

- `app/providers.tsx` already renders the site-wide navbar and footer. Do not add duplicate page-specific navigation, policy-link footers, or copyright bars. The user prefers a simple, single-column policy document without a contents sidebar.
- Avoid a narrow, unframed policy column on an all-white background. Use a wider document panel, subtle background contrast, and a restrained blue title treatment while keeping the single-column content.
- The shared navbar is fixed and 80px tall; policy content needs top padding and suitable scroll margins.
- `app/globals.css` overrides `.prose` paragraph spacing and line height for blogs. The rebuilt legal-document layout uses scoped Tailwind utilities without `.prose` to preserve readable legal text.
- Update policy content from user-provided wording. Terms, Privacy, Returns, Refund & Cancellation, and Shipping use the shared section-based `PolicyLayout`. Shipping has its own `/shipping-policy` route and must remain separate from Returns.
- Always render references to Order ID (including Order number) in bold using `<strong>` in policy content.
- Use selective bold emphasis for key policy deadlines, eligibility rules, cancellation limits, ownership rights, and required actions. Keep supporting explanations in regular text; do not bold whole sections or alter the supplied wording.
- Preserve the `PolicyLayout` API for policies not yet rebuilt, addressable section IDs, semantic headings, dates, canonical metadata, and separate returns/refunds/shipping links.

## Verification

Run commands from the repository root. Prefer focused checks first, then broader verification appropriate to the change. Report what actually ran, failures, and environment blockers; historical test reports are not evidence of current success.

- Do not run `next dev` and `next build` concurrently in this workspace: both write to `.next`. Stop the development server before building. Concurrent runs can cause missing `prerender-manifest.json` files and `Cannot find module for page: /_error` late in the build. Rebuild with the dev server stopped before considering cache removal or source changes.
- Use `npm start` to test the completed production build. Running `npm run dev` afterward replaces development artifacts in `.next`, so rebuild before the next production start.

| Purpose | Command |
| --- | --- |
| Development server | `npm run dev` |
| Type checking without changing the incremental cache | `npx tsc --noEmit --incremental false` |
| Full Jest suite, non-interactive | `npm run test:ci -- --runInBand` |
| Focused tests | `npm run test:ci -- --runInBand --runTestsByPath <test-file>` |
| Policy regression tests | `npm run test:ci -- --runInBand --runTestsByPath __tests__/terms-conditions.test.tsx` |
| Watch tests (interactive development only) | `npm test` |
| Coverage | `npm run test:coverage -- --runInBand` |
| Lint | `npm run lint` |
| Production build | `npm run build` (`prisma generate && next build`) |
| Run an existing production build | `npm start` |

- Jest uses `next/jest`, jsdom, React Testing Library, and jest-dom; see `jest.config.js` and `jest.setup.js`. The setup mocks `fetch` and Next navigation. Supply the needed mock responses and use a suitable environment for server-specific tests.
- Existing coverage includes cart/discount/product/shipping utilities, selected UI/hooks, and policies. `__tests__/integration/cart-integration.test.ts` tests utility interactions, not a live database/payment integration. Do not assume checkout or external integrations have end-to-end coverage.
- For bugs, add a failing regression test where practical, then verify the fix. For UI changes, also check responsive layout, keyboard interactions, loading/error states, and browser errors.
- `next.config.mjs` skips ESLint during builds. A successful build is not a lint pass. The lint script uses `next lint` with a legacy `.eslintrc.json`; report tooling incompatibilities rather than silently disabling rules or changing configuration.
- For documentation-only changes, verify referenced paths/commands and inspect the diff; an application build is not necessary unless runtime/configuration files also change.

## Database and maintenance safety

- Treat `prisma/schema.prisma` as the current model contract. Existing migrations and historical seed/restore scripts may not reflect every current model; inspect them before proposing a database workflow.
- Do not run `prisma db push`, `prisma migrate deploy/dev/reset`, or `npm run seed` as a routine setup/verification shortcut. Get approval for the specific operation and confirm it targets a disposable/development database where appropriate.
- Root backup/restore files, SQL/dumps, and local environment files may contain sensitive or production data. Do not read or copy their contents just to gather project context, use them as test fixtures, or commit them.
- Do not hand-edit generated artifacts such as `.next/`, `node_modules/`, `coverage/`, Prisma client output, or `tsconfig.tsbuildinfo`. Check the source of `scripts-dist/` before changing compiled output.

## Further reading

- `README.md`: project overview, local setup, commands, and consolidated metadata/social-image guidance.
- `docs/PHONEPE_INTEGRATION.md`: current checkout, callback, polling, and retry paths; environment inconsistencies, security limitations, and a verification checklist.
- Use current source and fresh verification results rather than historical fix summaries or test-count reports.
