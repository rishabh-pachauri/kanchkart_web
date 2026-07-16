# KanchKart Commerce

Production-ready full-stack commerce platform for KanchKart, a premium glassware brand.

## Stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS, shadcn-style components, Lucide icons, Framer Motion
- Prisma ORM with PostgreSQL/Supabase
- Auth.js/NextAuth with JWT sessions, credentials, and Google login
- Razorpay payments plus COD
- Cloudinary media signing
- Resend transactional email
- Dynamic SEO metadata, JSON-LD, sitemap, robots, GA, Meta Pixel

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The seed creates an admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD`, CMS-backed homepage content, categories, a featured collection, and starter products. Change seeded content from the admin dashboard before launch.

## Production Setup

1. Create a Supabase PostgreSQL project and set `DATABASE_URL` plus `DIRECT_URL`.
2. Create Cloudinary, Razorpay, Resend, Google OAuth, GA, Meta Pixel, and Google Maps credentials.
3. Set every variable in `.env.example` in Vercel Project Settings.
4. Run `pnpm db:deploy` during deployment.
5. Seed once with a secure `ADMIN_PASSWORD`, then rotate the password from the admin dashboard.
6. Configure `https://www.kanchkart.com` in Vercel and update OAuth/Razorpay webhook callback URLs.

## App Surfaces

- Storefront: `/`, `/shop`, `/collections`, `/product/[slug]`, `/cart`, `/checkout`, `/track-order`
- Customer: `/account`, `/wishlist`, `/orders`, `/reviews`
- Admin: `/admin`, `/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/inventory`, `/admin/cms`, `/admin/analytics`
- API: see `docs/API.md`

## Architecture

Server-side reads and mutations stay in `src/lib` and `src/actions`. UI components are reusable and intentionally thin. The database is the source of truth for products, content, settings, orders, inventory, payments, and tracking.

## Security Notes

- Credentials auth hashes passwords with bcrypt.
- Auth callbacks attach role claims to JWT sessions.
- Admin routes validate role server-side.
- Mutations validate input with Zod.
- Checkout uses database transactions for inventory deduction and order creation.
- Razorpay verification uses HMAC signature comparison.
- API write endpoints use a DB-backed rate limiter.
- Sensitive keys never ship to the browser.

## Launch Checklist

- Replace seed business address, email, phone, policy copy, and product catalog.
- Upload production product media to Cloudinary through Admin > CMS.
- Configure Razorpay webhook URL: `/api/webhooks/razorpay`.
- Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_META_PIXEL_ID`.
- Test COD, Razorpay success, Razorpay failure, order tracking, email receipts, and invoice download.
