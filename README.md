# Scribbl3D

Scribbl3D is an India-focused e-commerce and services platform for 3D printing. It combines a storefront for printers, filaments, resins, and prebuilt/customizable products with service-enquiry forms and an operations dashboard.

This repository contains a single Next.js application: storefront, admin UI, server-rendered pages, API routes, and server actions. For detailed architecture, development constraints, and agent instructions, see [AGENTS.md](AGENTS.md).

## Features

- Catalogue browsing, filters, product details, colour/size/weight variants, wishlist, reviews, and stock-notification requests.
- Customer registration, email/password and Google sign-in, OTP flows, password reset, profiles, addresses, and order history.
- Persistent customer carts, customization, buy-now checkout, discount eligibility, and PhonePe payments.
- Order management, invoices, credit notes, refunds, and Delhivery shipment creation, labels, tracking synchronization, and pickups, including multi-package shipments.
- Design, prototyping, small-batch manufacturing, and personalization enquiries with file uploads.
- Managed homepage sections, hero media, testimonials, partners, announcements, about-page content, and TipTap blog editing.
- Operations dashboard at `/ops/control`, with its own login at `/ops/control/login`.
- Page metadata, structured data, sitemap, Google Merchant feed, and legal/policy pages.

These describe implemented areas, not a guarantee of complete test coverage or production readiness. Review the payment and authorization caveats before deployment.

## Technology

| Area | Stack |
| --- | --- |
| Runtime and framework | Node.js 20 (`.nvmrc`), Next.js 15 App Router, React 18, TypeScript 5 |
| Database | PostgreSQL, Prisma 6 |
| UI | Tailwind CSS 3, shadcn/Radix UI, existing styled-components and animation libraries |
| Forms and content | React Hook Form, Zod, TipTap |
| Customer authentication | NextAuth v4, credentials and Google OAuth, custom Prisma adapter, JWT sessions |
| Checkout and logistics | PhonePe, Delhivery |
| Media and email | Cloudinary; shared transactional email sender currently uses ZeptoMail |
| Testing | Jest, jsdom, React Testing Library, jest-dom |

Other provider/cache packages remain installed. Their presence in `package.json` does not mean they are active in every flow. Follow the imports of the feature being changed.

## Local development

### Prerequisites

- Node.js 20 and npm. Use the existing `package-lock.json`; do not introduce another package-manager lockfile.
- An authorized development PostgreSQL database compatible with `prisma/schema.prisma`.
- Development credentials for the integrations you need to exercise. Obtain these from the project maintainer, not from backups or production configuration.

### Setup

1. Open the repository root. If using nvm, run `nvm use` to select the version in `.nvmrc`.
2. If `.env` does not already exist, copy `.env.example` to `.env` and configure it. Do not overwrite existing credentials. The template is incomplete; consult the environment table below and each integration's source.
3. Install the locked dependencies:

   ```bash
   npm ci
   ```

   The `postinstall` hook runs `prisma generate`. Preserve existing npm configuration; if installation fails, report the actual error rather than bypassing dependency or security controls.
4. Confirm that `DATABASE_URL` targets the intended development database and that its schema is ready. Ask the maintainer for the appropriate database provisioning/migration procedure; do not reset, push, seed, or restore a database blindly.
5. Start the application:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Database-backed pages require a working database connection.

Prisma client generation is not a database migration. After an approved schema change, regenerate the client with `npx prisma generate`. Existing migrations and seed scripts may not fully represent the current schema; inspect them before use.

### Environment variables

Keep credentials in local/deployment secret configuration, never in documentation or source control. Only browser-safe values belong in `NEXT_PUBLIC_*` variables.

| Purpose | Variables and notes |
| --- | --- |
| Database | `DATABASE_URL` |
| Customer auth | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| SEO base URL | `NEXT_PUBLIC_BASE_URL`, consumed by `lib/metadata.ts` |
| Payment redirects/callbacks | `NEXT_PUBLIC_APP_URL`; distinct from the SEO base URL |
| PhonePe | `PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY`, `PHONEPE_SALT_INDEX`, `PHONEPE_ENV`; see the environment mismatch warning in the [payment guide](docs/PHONEPE_INTEGRATION.md#configuration-and-environment-selection) |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Delhivery shipment client | `DELHIVERY_TOKEN`; the template's `DELHIVERY_API_KEY` is not a substitute for this client's variable |
| Shared transactional email | `ZEPTOMAIL_API_TOKEN` or `ZEPTOMAIL_API_KEY`, `ZEPTOMAIL_FROM_EMAIL`, optional `ZEPTOMAIL_FROM_NAME` |
| Admin access | Separate from customer NextAuth; inspect `app/api/admin/login/route.ts`, `lib/auth.ts`, and `lib/session.ts` with the maintainer |

This is a map of the main consumers, not a complete deployment manifest. Additional upload, email, shipping, and maintenance handlers can have their own configuration. Do not assume setting an environment flag makes every integration use a sandbox.

## Project structure

| Location | Responsibility |
| --- | --- |
| `app/layout.tsx`, `app/providers.tsx` | Root shell, session, fonts, shared navbar/footer, cart/checkout providers, toasts, analytics |
| `app/page.tsx`, `app/landingpage/` | Database-backed homepage and presentation components |
| `app/filament/`, `app/printers/`, `app/resins/`, `app/prebuilt-products/` | Catalogue pages; public filament path is singular |
| `app/cart/`, `app/checkout/`, `providers/` | Cart, discounts, checkout state, shipping selection, payment initiation |
| `app/profile/`, `app/payment/`, `app/order/` | Customer account, payment status, and order tracking |
| `app/services/`, `app/personalise/` | Service and custom-product enquiries |
| `app/blog/`, `app/about/`, `app/contact/` | Content and contact pages |
| `app/(policies)/` | Privacy, terms, returns, refunds, and shipping; route-group name is not part of the URL |
| `app/ops/control/` | Main operations dashboard; `app/admin/` is not the main dashboard |
| `app/api/`, `app/actions/`, `app/actions.ts` | Backend route handlers and server actions |
| `components/`, `hooks/`, `types/`, `utils/` | Shared UI, hooks, contracts, and utilities |
| `lib/` | Prisma access, validation, pricing helpers, integrations, email, and invoices |
| `prisma/` | Current schema, migrations, and seed sources |
| `public/`, `app/fonts/`, `styles/` | Static assets, fonts, and supporting styles |
| `__tests__/` and colocated `__tests__/` directories | Automated tests |
| `scripts/`, `script/`, root maintenance scripts | Data/asset maintenance; inspect before executing |

The `@/` import alias resolves to the repository root. Server Components are the default; browser interaction and context consumers use Client Components.

### Data and state

- Catalogue families are separate Prisma models: `Filament`/`FilamentVariant`, `Printer`, `Resin`/`ResinColour`/`ResinWeight`, and `PrebuiltProducts`/`PrebuiltVariants`. There is no current generic Prisma `Product` model.
- `CartProvider` manages customer cart and discount state. `CheckoutProvider` depends on it and manages checkout steps, addresses, pricing, and shipping selection.
- Customer NextAuth configuration is in `app/api/auth/[...nextauth]/options.ts` and uses JWT sessions. A Prisma `Session` model does not imply that database-session mode is active.
- Middleware implements redirects and a separate admin-cookie gate. It does not replace server-side authorization and ownership checks in sensitive APIs.
- Orders store item/address snapshots as JSON. Preserve historical order data when changing catalogue or pricing structures.
- Currency and shipping units need explicit tracing across consumers; do not assume every stored price is paise or every weight is kilograms. See [AGENTS.md](AGENTS.md) for known inconsistencies.

### Payment and fulfilment

The checkout component creates an order through `POST /api/create-order`, then initiates PhonePe through `POST /api/order`. The browser returns to `/payment/status`, which polls `GET /api/check-status/[transactionId]`; PhonePe also sends callbacks to `POST /api/phonepe-callback`.

Callbacks and polling update order state through different paths. Fulfilment uses operations/internal routes and Delhivery helpers; do not assume a successful payment automatically creates a shipment. Read [PhonePe integration](docs/PHONEPE_INTEGRATION.md) before changing initiation, retries, callbacks, or status reconciliation.

## Commands and verification

Run commands from the repository root.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Regenerate Prisma client and run `next build` |
| `npm start` | Serve an existing production build |
| `npm run lint` | Run the existing `next lint` script |
| `npx tsc --noEmit --incremental false` | Type checking without rewriting the incremental cache |
| `npm run test:ci -- --runInBand` | Run Jest once, non-interactively |
| `npm test` | Jest watch mode |
| `npm run test:coverage -- --runInBand` | Generate coverage |
| `npx prisma generate` | Regenerate Prisma client without applying schema changes |
| `npm run seed` | Run `prisma/seed.ts`; maintenance operation requiring review and an approved target database |

Run a focused regression test with:

```bash
npm run test:ci -- --runInBand --runTestsByPath lib/__tests__/cart-utils.test.ts
```

Policy-page regression tests:

```bash
npm run test:ci -- --runInBand --runTestsByPath __tests__/terms-conditions.test.tsx
```

Testing is configured in `jest.config.js` and `jest.setup.js`. Existing tests cover selected utilities, UI components, hooks, cart/discount interactions, and policy pages. The cart integration test uses utility functions; it is not an end-to-end database/payment test. Mock external services and do not send live emails, create shipments, or initiate payments as a test shortcut.

Builds can require environment variables, database access, and network access for Google fonts. `next.config.mjs` skips lint during builds, so a build is not a substitute for lint. The lint script uses legacy ESLint configuration; report tooling failures rather than disabling checks. Record current verification results instead of relying on historical test counts or production-readiness claims.

## UI, content, and SEO

- Reuse shared UI primitives, existing fonts/theme tokens, and the site shell. `app/providers.tsx` already renders the navbar and footer.
- Keep homepage and blog content connected to the CMS. Preserve publication state, visibility, sort order, and slugs.
- Keep policy wording tied to user-approved copy; do not invent legal or shipping terms. The detailed policy layout rules are in [AGENTS.md](AGENTS.md#policy-pages).
- Preserve printer material validation: material attributes come from the `Supported Materials` specification, not temperature specifications.
- For cart changes, test price updates after admin edits and handling of missing, deleted, or out-of-stock variants. A zero-price fallback must not make an unavailable item purchasable.

### Metadata and social images

Shared defaults and metadata helpers live in `lib/metadata.ts`; `app/layout.tsx` applies the defaults. Read nearby server pages before adding `metadata` or `generateMetadata`, and use Next.js 15 asynchronous route-parameter types for dynamic pages.

- Use page-specific titles, descriptions, and canonicals. Account for the shared title template to avoid repeating the brand name.
- Derive public URLs consistently from the configured metadata base; do not copy hardcoded hosts or placeholder route names into new pages.
- Keep Open Graph and Twitter titles, descriptions, URLs, and images aligned with the page. Use article metadata for published blog content and verified product data for catalogue metadata.
- `public/og-image.png` is the shared default image referenced by metadata. Use 1200 × 630 social images where appropriate, legible centred content, descriptive alt text, and optimized file sizes. Do not assume the existing image is a placeholder or overwrite it without a design request.
- Verify that referenced assets actually exist and are publicly accessible. Check the rendered metadata and social-sharing preview after changes; the presence of a metadata object alone does not prove correct output.
- Coordinate route/product changes with `components/seo/`, `components/StructuredData.tsx`, `app/sitemap.ts`, `app/api/google-merchant-feed/route.ts`, and redirects/image-host configuration in `next.config.mjs`.

## Operational safety and known limitations

- The current PhonePe callback does not enforce checksum rejection, and payment environment selection is inconsistent across handlers. These are implementation issues, not recommended integration patterns. See the [payment guide](docs/PHONEPE_INTEGRATION.md#known-limitations-and-required-review).
- `withApiProtection` in `lib/api-helpers.ts` validates/rate-limits requests, but its `requireAuth` branch is a placeholder. Admin cookie presence and client-side gates are not API authorization.
- Do not use production credentials/data to make local development or tests pass. Keep backups, dumps, tokens, customer information, and sensitive logs out of commits.
- Review migrations, seed/cleanup/restore scripts, and their target database before running them. `prisma db push` synchronizes a schema; it does not create a versioned migration.
- Do not hand-edit generated output such as `.next/`, `node_modules/`, `coverage/`, or Prisma client files.

## Documentation

- [Repository and agent guide](AGENTS.md): detailed architecture, business-critical constraints, policy preferences, and working conventions.
- [PhonePe integration](docs/PHONEPE_INTEGRATION.md): actual checkout/status/retry flow, configuration pitfalls, and verification checklist.

Keep documentation aligned with the current code. For environment access, database provisioning, or business/legal decisions, contact the project maintainer.
