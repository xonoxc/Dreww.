import { z } from "zod"

export const razorpayOrderSchema = z.object({
   amount: z.number().min(100, "Amount must be at least 100 paise (₹1)"),
   currency: z.enum(["INR", "USD"]).default("INR"),
   tier: z.enum(["free", "premium", "elite"]),
   description: z.string().optional(),
})

export const razorpayPaymentSchema = z.object({
   razorpay_order_id: z.string().min(1, "Order ID is required"),
   razorpay_payment_id: z.string().min(1, "Payment ID is required"),
   razorpay_signature: z.string().min(1, "Signature is required"),
})

export const subscriptionUpgradeSchema = z.object({
   currentTier: z.enum(["free", "premium", "elite"]),
   newTier: z.enum(["free", "premium", "elite"]),
   paymentMethodId: z.string().optional(),
})

export const paymentVerificationSchema = z.object({
   orderId: z.string(),
   paymentId: z.string(),
   signature: z.string(),
})

export type RazorpayOrderInput = z.infer<typeof razorpayOrderSchema>
export type RazorpayPaymentInput = z.infer<typeof razorpayPaymentSchema>
export type SubscriptionUpgradeInput = z.infer<typeof subscriptionUpgradeSchema>
export type PaymentVerificationInput = z.infer<typeof paymentVerificationSchema>
