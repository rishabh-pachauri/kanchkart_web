# Test branch review

Branch: `codex/cart-auth-glass-experience`. Do not merge until staging acceptance is complete.

## Changes

- Login returns a validated local destination, then performs a full navigation to discard stale client session/router state. The session provider receives the server session.
- Add to Bag and Buy Now wait for session hydration and check the current cookie-backed session before redirecting. Network errors stay on the product with a retry message. Signed-out customers go to login; signup/login retains the return destination.
- Cart hydration no longer writes an empty cart before reading saved items. Invalid storage and blocked storage cannot crash the storefront.
- Removed embedded Cloudinary/Razorpay secrets, OTP bypass, and public fixed-token admin mutation access. Admin maintenance endpoints now require an ADMIN session and POST; the admin sync button is updated.
- Build no longer runs destructive schema synchronization or product seeding. Database migrations and seeding must be explicit deployment operations.
- Fixed the lint command for Next 15 and converted two legacy scripts to ESM.

## Validation

- `pnpm test`: regression tests cover stale client session versus authenticated server response, null signed-out response, offline response, StrictMode cart hydration, corrupted cart storage and callback validation.
- `pnpm typecheck`, `pnpm lint`, `pnpm build`.

## Before deploying/merging

1. Rotate exposed Cloudinary and Razorpay credentials at the providers; deleting source defaults does not revoke credentials in Git history. Set new server environment variables.
2. Use a separate staging PostgreSQL database and staging provider credentials. Set DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_URL/NEXT_PUBLIC_APP_URL and email settings for the preview domain. Never connect a test checkout to production payments.
3. Apply reviewed Prisma migrations explicitly. Configure Resend with a verified sender; signup now requires actual OTP delivery.
4. Signed out: open a product, Add to Bag, log in, return to the product, then Add to Bag. Confirm no second login redirect and cart count increases exactly once. Repeat Buy Now.
5. Repeat with a slow network, two tabs, browser back, expired login, wrong password, logout/login, refresh and blocked browser storage. Confirm error recovery and no cart loss.
6. Check registration OTP delivery, callback retention when switching to login, checkout totals, COD and Razorpay sandbox success/failure. No real purchases were placed during this review.

Existing review-component lint warnings remain. This is a focused review, not a complete security audit.
