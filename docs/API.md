# API Documentation

All responses are JSON. Authenticated admin endpoints require an Auth.js session with `role=ADMIN`.

## `GET /api/health`

Returns service and database health.

## `POST /api/newsletter`

Request:

```json
{ "email": "customer@example.com" }
```

Creates or updates a newsletter notification record and sends an admin notification.

## `POST /api/orders/track`

Request:

```json
{ "orderNumber": "KK-20260626-1001", "email": "customer@example.com" }
```

Returns the order status, courier, tracking number, estimated delivery, and timeline.

## `POST /api/checkout/razorpay`

Request:

```json
{ "orderId": "cuid" }
```

Creates a Razorpay order for a pending KanchKart order.

## `POST /api/payments/razorpay/verify`

Request:

```json
{
  "orderId": "cuid",
  "razorpayOrderId": "order_x",
  "razorpayPaymentId": "pay_x",
  "razorpaySignature": "signature"
}
```

Verifies HMAC signature, marks payment/order paid, and sends confirmation email.

## `POST /api/webhooks/razorpay`

Razorpay webhook receiver. Configure the exact URL in Razorpay Dashboard and set `RAZORPAY_WEBHOOK_SECRET`.

## `POST /api/upload/signature`

Admin only. Returns a Cloudinary signed upload payload.

Request:

```json
{ "folder": "products", "publicId": "glass-bottle-750" }
```

