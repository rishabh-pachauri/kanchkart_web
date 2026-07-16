# Deployment Guide

## Vercel

1. Push this repository to GitHub.
2. Import the repo in Vercel.
3. Set Framework Preset to Next.js.
4. Add all variables from `.env.example`.
5. Add production domain `www.kanchkart.com`.
6. Set the build command to `pnpm build`.

## Supabase

1. Create a Supabase project in the closest region to your customers.
2. Use pooled connection for `DATABASE_URL`.
3. Use direct connection for `DIRECT_URL`.
4. Run migrations:

```bash
pnpm db:deploy
```

## Razorpay

1. Add `https://www.kanchkart.com/api/webhooks/razorpay` as a webhook endpoint.
2. Enable payment captured, payment failed, refund processed, and order paid events.
3. Keep `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` server-only.

## Cloudinary

The app signs uploads from `/api/upload/signature`; the browser uploads directly to Cloudinary.

## Resend

Verify the sending domain and set `EMAIL_FROM`. Use a branded sender such as `KanchKart <orders@kanchkart.com>`.

## Google

- OAuth callback: `https://www.kanchkart.com/api/auth/callback/google`
- Maps API key: browser key restricted to the KanchKart domain.
