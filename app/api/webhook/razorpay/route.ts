import { createServerSideClient } from "@/lib/supabase/server"
import { fromPromise, fromThrowable } from "neverthrow"
import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"

interface WebhookPayload {
   event: string
   payload: {
      payment: {
         entity: {
            notes?: {
               user_id?: string
               tier?: string
            }
            order_id?: string
         }
      }
   }
}

export async function POST(request: NextRequest) {
   const bodyParseRes = await fromPromise(request.text(), err => err)
   if (bodyParseRes.isErr()) {
      console.error("Malformed request body", bodyParseRes.error)
      return NextResponse.json({ error: "Malformed request body" }, { status: 400 })
   }

   const signature = request.headers.get("x-razorpay-signature")
   const body = bodyParseRes.value

   if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
   }

   const parseRes = fromThrowable(JSON.parse)(body)
   if (parseRes.isErr()) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
   }

   const payload = parseRes.value as WebhookPayload
   const { event } = payload

   if (event !== "payment.captured") {
      console.log("Unhandled event type", event)
      return NextResponse.json({ received: true }, { status: 200 })
   }

   const userId = payload.payload?.payment?.entity?.notes?.user_id
   const tier = payload.payload?.payment?.entity?.notes?.tier || "premium"

   if (!userId) {
      console.error("No user_id in payment notes")
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
   }

   const supabase = await createServerSideClient()

   const now = new Date()
   const subscriptionEnd = new Date()
   subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)

   const updateRes = await fromPromise(
      supabase
         .from("profiles")
         .update({
            subscription_status: "active",
            subscription_tier: tier,
            subscription_start_date: now.toISOString(),
            subscription_end_date: subscriptionEnd.toISOString(),
         })
         .eq("id", userId),
      err => err
   )

   if (updateRes.isErr()) {
      console.error("Error activating subscription:", updateRes.error)
      return NextResponse.json({ error: "Failed to activate subscription" }, { status: 500 })
   }

   console.log(`Subscription activated for user ${userId} with tier ${tier}`)

   return NextResponse.json({ received: true }, { status: 200 })
}

function verifySignature(body: string, signature: string | null): boolean {
   const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex")
   return signature === expectedSignature
}
