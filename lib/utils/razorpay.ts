import crypto from "crypto"

export const TIER_PRICING = {
   free: 0,
   premium: 49900,
   elite: 99900,
} as const

export const TIER_FEATURES = {
   free: {
      name: "Free",
      price: "₹0",
      pricePerMonth: "Always Free",
      features: [
         "Log unlimited golf scores",
         "Track last 5 scores",
         "View monthly draws",
         "Basic charity tracking",
      ],
   },
   premium: {
      name: "Premium",
      price: "₹499",
      pricePerMonth: "₹499/month",
      features: [
         "Everything in Free",
         "Advanced score analytics",
         "Priority in draws",
         "2x prize pool eligibility",
         "Premium support",
      ],
   },
   elite: {
      name: "Elite",
      price: "₹999",
      pricePerMonth: "₹999/month",
      features: [
         "Everything in Premium",
         "AI-powered insights",
         "Guaranteed monthly prize",
         "5x prize pool eligibility",
         "24/7 VIP support",
         "Exclusive tournaments",
      ],
   },
} as const

export const createMockRazorpayOrder = (amount: number, currency: string = "INR") => {
   const orderId = `order_${crypto.randomBytes(8).toString("hex")}`
   return {
      id: orderId,
      entity: "order",
      amount,
      amount_paid: 0,
      amount_due: amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      status: "created",
      attempts: 0,
      notes: {},
      created_at: Math.floor(Date.now() / 1000),
   }
}

export const verifyMockPayment = (
   orderId: string,
   paymentId: string,
   signature: string
): { valid: boolean; message: string } => {
   if (!orderId || !paymentId || !signature) {
      return {
         valid: false,
         message: "Invalid payment details",
      }
   }

   if (signature.length < 10) {
      return {
         valid: false,
         message: "Invalid signature format",
      }
   }

   return {
      valid: true,
      message: "Payment verified successfully",
   }
}

export const generateMockPaymentReceipt = (
   orderId: string,
   paymentId: string,
   amount: number,
   tier: string
) => {
   return {
      id: paymentId,
      entity: "payment",
      amount,
      currency: "INR",
      status: "captured",
      method: "card",
      amount_refunded: 0,
      refund_status: null,
      captured: true,
      description: `Dreww. ${tier} tier subscription`,
      card_id: `card_${crypto.randomBytes(8).toString("hex")}`,
      bank: null,
      wallet: null,
      vpa: null,
      email: "",
      contact: "",
      notes: {
         tier,
         subscription_upgrade: true,
      },
      fee: Math.floor(amount * 0.023),
      tax: 0,
      error_code: null,
      error_description: null,
      error_source: null,
      error_step: null,
      error_reason: null,
      acquirer_data: {
         auth_code: null,
      },
      created_at: Math.floor(Date.now() / 1000),
   }
}

export const getPricingBreakdown = (amount: number) => {
   const fee = Math.floor(amount * 0.023)
   const tax = Math.floor(fee * 0.18)
   const total = amount + fee + tax

   return {
      baseAmount: amount,
      razorpayFee: fee,
      tax,
      totalAmount: total,
      currency: "INR",
   }
}
