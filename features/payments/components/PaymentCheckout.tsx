"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useRazorpay } from "@/features/payments/hooks/useRazorpay"
import { TIER_PRICING } from "@/lib/utils/razorpay"

interface PaymentCheckoutProps {
   tier: "premium" | "elite"
   currentTier?: "free" | "premium" | "elite"
   onSuccess?: (paymentId: string) => void
   onError?: (error: string) => void
}

export function PaymentCheckout({ tier, onSuccess, onError }: PaymentCheckoutProps) {
   const [isProcessing, setIsProcessing] = useState(false)
   const { createOrder, verifyPayment, error, loading, resetState } = useRazorpay()

   const amount = TIER_PRICING[tier]

   const handlePaymentClick = async () => {
      if (!window.Razorpay) {
         const errorMsg = "Razorpay SDK not loaded"
         onError?.(errorMsg)
         return
      }

      setIsProcessing(true)

      try {
         const orderResponse = await createOrder({
            amount,
            currency: "INR",
            tier,
         })

         // Step 2: Initialize Razorpay modal
         const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "mock_key",
            amount: amount,
            currency: "INR",
            name: "Golf Fair",
            description: `Upgrade to ${tier} tier`,
            order_id: orderResponse.orderId,
            handler: async (response: any) => {
               try {
                  // Step 3: Verify payment
                  const verificationResponse = await verifyPayment({
                     razorpay_order_id: response.razorpay_order_id,
                     razorpay_payment_id: response.razorpay_payment_id,
                     razorpay_signature: response.razorpay_signature,
                  })

                  if (verificationResponse.verified) {
                     onSuccess?.(response.razorpay_payment_id)
                  } else {
                     onError?.("Payment verification failed")
                  }
               } catch (err) {
                  const message = err instanceof Error ? err.message : "Verification failed"
                  onError?.(message)
               }
            },
            prefill: {
               name: "",
               email: "",
               contact: "",
            },
            theme: {
               color: "#ff6b35",
            },
            modal: {
               ondismiss: () => {
                  setIsProcessing(false)
                  resetState()
               },
            },
         }

         const razorpay = new window.Razorpay(options)
         razorpay.open()
      } catch (err) {
         const message = err instanceof Error ? err.message : "Payment initiation failed"
         onError?.(message)
         setIsProcessing(false)
      }
   }

   return (
      <div className="w-full space-y-4">
         {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/50">
               <p className="text-sm text-destructive">{error}</p>
            </div>
         )}

         <Button
            onClick={handlePaymentClick}
            disabled={isProcessing || loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-6 transition-all duration-300 ease-out"
         >
            {isProcessing || loading ? (
               <div className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Processing...
               </div>
            ) : (
               `Pay ₹${(amount / 100).toFixed(2)}`
            )}
         </Button>

         <p className="text-xs text-muted-foreground text-center">
            Secured by Razorpay. Your payment information is encrypted.
         </p>
      </div>
   )
}
