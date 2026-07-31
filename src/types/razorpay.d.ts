export {};

declare global {
  interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  type RazorpaySuccessResponse = RazorpayPaymentResponse;

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill?: {
      name?: string | FormDataEntryValue | null;
      email?: string | FormDataEntryValue | null;
      contact?: string | FormDataEntryValue | null;
    };
    notes?: Record<string, string>;
    theme?: {
      color?: string;
    };
    handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
    modal?: {
      ondismiss?: () => void;
    };
  }

  interface RazorpayInstance {
    open: () => void;
    on?: (event: string, handler: (response: unknown) => void) => void;
  }

  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
