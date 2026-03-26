import { createServerSideClient } from "@/lib/supabase/server"
import { fromPromise } from "neverthrow"
import { NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID || "",
   key_secret: process.env.RAZORPAY_KEY_SECRET || "",
})

export async function POST(request: Request) {
   const supabase = await createServerSideClient()

   const fetchUserRes = await fromPromise(supabase.auth.getUser(), err => err)
   if (fetchUserRes.isErr()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
   }

   const {
      data: { user },
      error: authError,
   } = fetchUserRes.value

   if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
   }

   const body = await request.json()
   const { amount, tier, description } = body

   if (!amount || !tier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
   }

   try {
      const order = await razorpay.orders.create({
         amount: amount,
         currency: "INR",
         notes: {
            user_id: user.id,
            tier: tier,
            description: description || `Upgrade to ${tier}`,
         },
      })

      return NextResponse.json({
         orderId: order.id,
         amount: order.amount,
         currency: order.currency,
      })
   } catch (err: any) {
      console.error("Razorpay order creation error:", err)
      return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 })
   }
}
