"use client"

import { fromPromise } from "neverthrow"
import { useState } from "react"

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
      setState(prev => ({
         ...prev,
         loading: true,
         error: null,
      }))

      const responseRes = await fromPromise(
         fetch("/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
         }),
         err => err
      )

      if (responseRes.isErr()) {
         console.error("Error creating order:", responseRes.error)
         setState(prev => ({
            ...prev,
            loading: false,
            error: "Failed to create order. Please try again.",
         }))
         return
      }

      const data = await responseRes.value.json()

      setState(prev => ({
         ...prev,
         orderId: data.orderId,
         loading: false,
      }))

      return data
   }

   const verifyPayment = async (paymentData: {
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
   }

   const handlePaymentError = (errorData: any) => {
      const errorMessage = errorData?.description || "Payment failed. Please try again."
      setState(prev => ({
         ...prev,
         error: errorMessage,
         loading: false,
      }))
   }

   const resetState = () => {
      setState({
         loading: false,
         error: null,
         success: false,
         orderId: null,
         paymentId: null,
      })
   }

   return {
      ...state,
      createOrder,
      verifyPayment,
      handlePaymentError,
      resetState,
   }
}
