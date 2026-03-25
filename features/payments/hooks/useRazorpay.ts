"use client"

import { useState, useCallback } from "react"
import { RazorpayOrderInput, RazorpayPaymentInput } from "@/lib/schemas/payment"

export interface PaymentState {
   loading: boolean
   error: string | null
   success: boolean
   orderId: string | null
   paymentId: string | null
}

export const useRazorpay = () => {
   const [state, setState] = useState<PaymentState>({
      loading: false,
      error: null,
      success: false,
      orderId: null,
      paymentId: null,
   })

   const createOrder = async (orderData: { amount: number; currency: string; tier: string }) => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
         const response = await fetch("/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
         })

         if (!response.ok) {
            throw new Error("Failed to create order")
         }

         const data = await response.json()
         setState(prev => ({
            ...prev,
            orderId: data.orderId,
            loading: false,
         }))

         return data
      } catch (error) {
         const message = error instanceof Error ? error.message : "Failed to create order"
         setState(prev => ({
            ...prev,
            loading: false,
            error: message,
         }))
         throw error
      }
   }

   // Verify payment
   const verifyPayment = useCallback(
      async (paymentData: {
         razorpay_order_id: string
         razorpay_payment_id: string
         razorpay_signature: string
      }) => {
         setState(prev => ({ ...prev, loading: true, error: null }))

         try {
            const response = await fetch("/api/payments/verify", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(paymentData),
            })

            if (!response.ok) {
               throw new Error("Payment verification failed")
            }

            const data = await response.json()
            setState(prev => ({
               ...prev,
               paymentId: data.paymentId,
               success: data.verified,
               loading: false,
            }))

            return data
         } catch (error) {
            const message = error instanceof Error ? error.message : "Payment verification failed"
            setState(prev => ({
               ...prev,
               loading: false,
               error: message,
               success: false,
            }))
            throw error
         }
      },
      []
   )

   // Handle payment failure
   const handlePaymentError = useCallback((errorData: any) => {
      const errorMessage = errorData?.description || "Payment failed. Please try again."
      setState(prev => ({
         ...prev,
         error: errorMessage,
         loading: false,
      }))
   }, [])

   // Reset state
   const resetState = useCallback(() => {
      setState({
         loading: false,
         error: null,
         success: false,
         orderId: null,
         paymentId: null,
      })
   }, [])

   return {
      ...state,
      createOrder,
      verifyPayment,
      handlePaymentError,
      resetState,
   }
}
