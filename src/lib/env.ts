export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || "KanchKart",
  authSecret: process.env.AUTH_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryUploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || "kanchkart",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  publicRazorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || "KanchKart <orders@kanchkart.com>",
  adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL,
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
};

export function requireServerEnv(key: keyof typeof env) {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${String(key)}`);
  }
  return value;
}

