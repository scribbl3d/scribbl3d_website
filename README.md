# Scribbl3D E-Commerce Platform

A modern, full-stack e-commerce platform specializing in 3D printing products including printers, resins, filaments, and prebuilt products. Built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development](#development)
- [Testing](#testing)
- [Key Integrations](#key-integrations)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [Scripts Reference](#scripts-reference)

## ✨ Features

### E-Commerce Core
- **Product Categories**: 3D Printers, Resins, Filaments, Prebuilt Products
- **Advanced Filtering**: Filter by technology, brand, build volume, price, resolution
- **Product Variants**: Support for colors, sizes, weights with different pricing
- **Shopping Cart**: Persistent cart with customization options
- **Wishlist**: Save products for later
- **Reviews & Ratings**: Customer reviews with aggregate ratings
- **Stock Management**: Real-time stock tracking and notifications

### User Management
- **Authentication**: Email/password and Google OAuth via NextAuth.js
- **OTP Verification**: Secure email verification system
- **User Profiles**: Manage addresses, orders, and account details
- **Order History**: Complete order tracking and management

### Payment & Checkout
- **Multiple Gateways**: PhonePe and Razorpay integration
- **Discount System**: Cart-wide and item-specific discounts
- **First-time User Discounts**: Special promotional codes
- **Invoice Generation**: Automated PDF invoices
- **Credit Notes**: Handle refunds and adjustments

### Shipping & Logistics
- **Delhivery Integration**: Automated shipment creation and tracking
- **Multi-Package Support**: Handle MPS (Multiple Piece Shipment)
- **Pickup Scheduling**: Automated pickup request system
- **Real-time Tracking**: Order tracking with webhooks

### Content Management
- **Blog System**: Rich text editor with TipTap
- **Hero Banners**: Dynamic homepage carousels
- **Customer Testimonials**: Showcase customer feedback
- **About Page**: Dynamic content management
- **SEO Optimization**: Meta tags, structured data

### Admin Features
- **Product Management**: CRUD operations for all product types
- **Order Management**: Process orders, refunds, and shipments
- **Discount Management**: Create and manage promotional codes
- **Analytics**: Order feedback and customer insights

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Styled Components
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: Framer Motion, GSAP, Lottie
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: TipTap editor

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v4
- **Caching**: Redis (ioredis), Node-Cache
- **File Upload**: Cloudinary

### Payment & Shipping
- **Payment**: PhonePe, Razorpay
- **Shipping**: Delhivery API
- **Email**: AWS SES, SendGrid, Resend, ZeptoMail

### Testing & Quality
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint
- **Type Safety**: TypeScript strict mode

## 📁 Project Structure

```
my-scribbl3d-project/
├── app/                    # Next.js App Router
│   ├── (policies)/        # Policy pages (privacy, refund, return)
│   ├── [category]/        # Dynamic category pages
│   ├── about/             # About page components
│   ├── actions/           # Server actions
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── checkout/          # Checkout flow
│   ├── order-confirmation/
│   ├── payment/           # Payment status pages
│   └── ...
├── components/            # React components
│   ├── prebuilt-products/
│   ├── printers/
│   ├── resins/
│   ├── reviews/
│   └── ...
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication helpers
│   ├── delhivery/         # Shipping integration
│   ├── email/             # Email templates & services
│   ├── pickup/            # Pickup scheduling
│   └── ...
├── prisma/                # Database
│   ├── migrations/        # Database migrations
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── providers/             # React context providers
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── public/                # Static assets
└── docs/                  # Documentation

```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ or v20+ (recommended)
- **PostgreSQL**: v14+ (local or hosted)
- **Redis**: (optional, for caching)
- **npm** or **yarn** or **pnpm**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-scribbl3d-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials (see [Environment Variables](#environment-variables))

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   
   # Seed the database (optional)
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

### Database
```env
DATABASE_URL="postgresql://user:password@localhost:5432/scribbl3d"
```

### NextAuth
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl"
```

### Base URL
```env
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # Production: https://scribbl3d.com
```

### OAuth Providers
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Payment Gateways
```env
# Razorpay
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"

# PhonePe (if applicable)
PHONEPE_MERCHANT_ID="your-merchant-id"
PHONEPE_SALT_KEY="your-salt-key"
PHONEPE_SALT_INDEX="your-salt-index"
```

### Cloudinary
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Delhivery Shipping
```env
DELHIVERY_API_KEY="your-delhivery-api-key"
```

### Redis (Optional)
```env
REDIS_URL="redis://localhost:6379"
```

### Email Services
```env
# AWS SES
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"

# SendGrid (alternative)
SENDGRID_API_KEY="your-sendgrid-key"
```

### SEO
```env
GOOGLE_VERIFICATION_CODE="your-google-verification-code"
```

> **Security Note**: Never commit `.env` to version control. Use `.env.example` as a template.

## 🗄 Database Setup

### Schema Overview

The database includes comprehensive models for:
- **Users**: Authentication, profiles, addresses
- **Products**: Products, Printers, Resins, Prebuilt items with variants
- **Cart & Wishlist**: Shopping cart and saved items
- **Orders**: Order management, shipments, invoices, credit notes
- **Payments**: Payment tracking with multiple gateways
- **Reviews**: Customer reviews and ratings
- **CMS**: Blogs, hero banners, testimonials, partners
- **Discounts**: Promotional codes and usage tracking
- **Shipping**: Shipment tracking, pickup requests

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Seeding

The seed script populates:
- Sample products (printers, resins, prebuilt)
- Hero banners and testimonials
- Admin users
- Discount codes

```bash
npm run seed
```

### Prisma Studio

Explore and edit your database visually:
```bash
npx prisma studio
```

## 💻 Development

### Running the App

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run linter
npm run lint

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Database Operations

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# View database in browser
npx prisma studio

# Create and apply migration
npx prisma migrate dev

# Format schema file
npx prisma format
```

## 🧪 Testing

The project uses Jest and React Testing Library for testing.

### Test Structure
```
├── lib/__tests__/
│   ├── cart-utils.test.ts
│   ├── discount-utils.test.ts
│   └── utils.test.ts
└── utils/__tests__/
    └── calculate-ratings.test.ts
```

### Running Tests

```bash
# Watch mode (development)
npm run test

# Single run
npm run test:ci

# With coverage report
npm run test:coverage
```

### Writing Tests

```typescript
// Example test
import { calculateRatings } from '@/utils/calculate-ratings';

describe('calculateRatings', () => {
  it('should calculate average rating correctly', () => {
    const reviews = [
      { rating: 5 },
      { rating: 4 },
      { rating: 3 }
    ];
    expect(calculateRatings(reviews).average).toBe(4);
  });
});
```

## 🔌 Key Integrations

### Delhivery Shipping
- **Location**: `lib/delhivery/`
- **Features**: Shipment creation, label generation, tracking, pickup scheduling
- **Docs**: Delhivery API documentation

### PhonePe Payment
- **Location**: `app/api/phonepe-callback/`, `app/checkout/components/PhonePePayment.tsx`
- **Features**: Payment initiation, callback handling, status verification
- **Docs**: See `docs/PHONEPE_INTEGRATION.md`

### Cloudinary
- **Location**: `lib/cloudinary.ts`
- **Features**: Image upload, optimization, transformation
- **Usage**: Product images, user uploads, blog images

### Email Services
- **Location**: `lib/email/`
- **Providers**: AWS SES, SendGrid, Resend, ZeptoMail
- **Templates**: Order confirmation, shipping updates, OTP verification

### Redis Caching
- **Location**: `lib/cache.ts`
- **Usage**: Product caching, session management, rate limiting

## 🌐 API Routes

### Public APIs
- `GET /api/products` - Fetch products with filters
- `GET /api/printers` - Fetch printers
- `GET /api/resins` - Fetch resins
- `POST /api/auth/[...nextauth]` - Authentication

### Protected APIs
- `POST /api/cart` - Manage cart
- `POST /api/order` - Create order
- `GET /api/orders` - Fetch user orders
- `POST /api/reviews` - Submit review

### Admin APIs
- `POST /api/admin/products` - Create/update products
- `GET /api/admin/orders` - Manage orders
- `POST /api/admin/discounts` - Manage discounts

### Payment APIs
- `POST /api/order/route.ts` - Initiate payment
- `POST /api/phonepe-callback` - Payment webhook
- `GET /api/check-status/[transactionId]` - Check payment status

### Shipping APIs
- `POST /api/shipment/create` - Create shipment
- `GET /api/shipment/track/[waybill]` - Track shipment
- `POST /api/shipment/pickup` - Schedule pickup

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Environment Setup

Ensure all production environment variables are set:
- Database connection
- NextAuth secret and URL
- Payment gateway credentials
- Cloudinary credentials
- Email service credentials
- Delhivery API key

### Database Migration

```bash
# Run migrations in production
npx prisma migrate deploy
```

### Build Optimization

The project includes:
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Compression and caching headers
- Console removal in production
- Package import optimization

## 📜 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:ci` | Run tests once (CI) |
| `npm run test:coverage` | Generate coverage report |
| `npm run seed` | Seed database with sample data |

### Additional Scripts

```bash
# Prisma commands
npx prisma studio          # Open Prisma Studio
npx prisma generate        # Generate Prisma Client
npx prisma migrate dev     # Create and apply migration
npx prisma migrate deploy  # Apply pending migrations
npx prisma db push         # Push schema without migration

# Image optimization (if needed)
node scripts/optimize-images.js

# Database backup
node scripts/cleanup.ts
```

## 🏗 Architecture Notes

### App Router Structure
The app uses Next.js 15 App Router with:
- Server Components by default
- Client Components marked with 'use client'
- Server Actions for mutations
- Route Groups for organization

### State Management
- **Server State**: React Server Components
- **Client State**: React Context (Cart, Checkout)
- **Form State**: React Hook Form
- **Cache**: Redis + Node-Cache

### Authentication Flow
1. User submits credentials
2. NextAuth validates with Prisma Adapter
3. Session stored in database
4. JWT token issued for API calls

### Payment Flow
1. User proceeds to checkout
2. Order created with 'payment_pending' status
3. Payment initiated with gateway (PhonePe/Razorpay)
4. Webhook updates order status
5. Shipment created on success
6. Email confirmation sent

### Shipping Flow
1. Order confirmed
2. Shipment created via Delhivery API
3. Waybill generated
4. Pickup scheduled
5. Tracking updates via webhooks
6. Customer notified of status changes

## 🤝 Contributing

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write tests for new features

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Write/update tests
4. Submit pull request

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Refactor code
style: Format code
chore: Update dependencies
```

## 📝 Important Notes

### For New Developers

1. **Start with the schema**: Review `prisma/schema.prisma` to understand data models
2. **Check existing APIs**: Look at `app/api/` before creating new endpoints
3. **Use Server Actions**: Prefer Server Actions over API routes for mutations
4. **Follow type safety**: Never use `any`, always define proper types
5. **Test your changes**: Write tests for new features
6. **Review docs**: Check `docs/` folder for integration guides

### Common Pitfalls

- Don't forget to run `prisma generate` after schema changes
- Always validate user input with Zod
- Handle errors gracefully with try-catch
- Use transactions for multi-step database operations
- Cache expensive queries with Redis
- Optimize images before upload

### Performance Tips

- Use Server Components when possible
- Implement pagination for large lists
- Lazy load heavy components
- Optimize images with Next.js Image
- Use React.memo for expensive renders
- Implement proper caching strategies

## 📞 Support

For questions or issues:
- Check existing documentation in `docs/`
- Review code comments
- Contact the development team



---

Built with ❤️ by the Scribbl3D team
