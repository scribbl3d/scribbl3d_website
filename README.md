# Scribbl3D  Platform

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


## ✨ Features

###  Core
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
- **Gateways**: PhonePe 
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


## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ or v20+ (recommended)
- **PostgreSQL**: v14+ (local or hosted)
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

Create a `.env` file in the root directory and get details from founder.


> **Security Note**: Never commit `.env` to version control.

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


# Apply migrations
npx prisma db push

# Reset database (development only)
npx prisma migrate reset
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
npx prisma db push

# Format schema file
npx prisma format
```

## 🧪 Testing

The project uses Jest and React Testing Library for testing.


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
- **Provider**:  ZeptoMail
- **Templates**: Order confirmation, shipping updates, OTP verification

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


### Environment Setup

Ensure all production environment variables are set:
- Database connection
- NextAuth secret and URL
- Payment gateway credentials
- Cloudinary credentials
- Email service credentials
- Delhivery API key


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
3. Payment initiated with gateway (PhonePe)
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

### Performance Tips

- Use Server Components when possible
- Implement pagination for large lists
- Lazy load heavy components
- Optimize images with Next.js Image
- Use React.memo for expensive renders
- Implement proper caching strategies

## 📞 Support

For questions or issues:
- Check existing documentation 
- Review code comments
- Contact the development team



---

Built with ❤️ by the Scribbl3D team
