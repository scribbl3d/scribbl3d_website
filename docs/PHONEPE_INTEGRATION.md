# PhonePe Integration Documentation

## API Routes

### `app/api/check-status/[transactionId]/route.ts`

- Dynamic API route that checks the status of a PhonePe payment transaction
- Handles GET requests to verify payment status using PhonePe's API
- Includes authentication with X-VERIFY headers and merchant credentials
- Returns payment status (success/pending/failed) with appropriate response codes

### `app/api/order/route.ts`

- API route for creating new payment orders
- Handles POST requests to initiate PhonePe payments
- Generates payment URLs and transaction IDs
- Integrates with PhonePe's payment initiation API

### `app/api/phonepe-callback/route.ts`

- Webhook handler for PhonePe payment callbacks
- Processes POST requests from PhonePe after payment completion
- Verifies callback authenticity using SHA256 hash
- Updates order status based on payment response

### `app/api/status/route.ts`

- General payment status API route
- Handles payment status queries
- Provides payment status information to client

## Components

### `app/checkout/components/PhonePePayment.tsx`

- React component for PhonePe payment button
- Handles payment initiation and status checking
- Manages payment states (idle/processing/success/error)
- Integrates with CheckoutProvider and CartProvider

## Pages

### `app/layout.tsx`

- Root layout component
- Includes providers and global UI elements
- Sets up payment-related context providers

### `app/order-confirmation/page.tsx`

- Order confirmation page
- Displays order details after successful payment
- Shows transaction summary and confirmation message

### `app/payment/failed/page.tsx`

- Payment failure page
- Handles failed payment scenarios
- Provides options to retry payment

### `app/payment/failure/page.tsx`

- Alternative payment failure page
- Shows detailed error information
- Offers support contact options

### `app/payment/pending/page.tsx`

- Payment pending status page
- Shows loading state for pending payments
- Automatically checks payment status

### `app/payment/status/failure/page.tsx`

- Payment status failure page
- Displays when payment verification fails
- Provides error details and next steps

### `app/payment/status/page.tsx`

- Main payment status page
- Handles payment verification flow
- Redirects to success/failure pages based on status

### `app/payment/status/success/page.tsx`

- Payment success status page
- Shows successful payment confirmation
- Displays transaction details and next steps

### `app/payment/success/page.tsx`

- Payment success page
- Final confirmation page after successful payment
- Shows order summary and success message

## Providers

### `providers/CartProvider.tsx`

- Context provider for shopping cart
- Manages cart state and operations
- Handles cart clearing after successful payment

### `providers/CheckoutProvider.tsx`

- Context provider for checkout process
- Manages checkout state and flow
- Handles shipping details and payment state

## Types

### `types/checkout.ts`

- TypeScript definitions for checkout process
- Includes interfaces for payment and order types
- Defines shipping and payment status types

## Utils

### `utils/payment-status.ts`

- Utility functions for payment status handling
- Includes status checking and verification helpers
- Provides payment status type guards and formatters
