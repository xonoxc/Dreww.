import { fromPromise, fromThrowable } from "neverthrow"
import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"

interface WebhookPayload {
   event: string
   payload: {
      payment: {
         entity: {
            notes: {
               userId: string
               token: string
               dbtransactionId: string
            }
         }
      }
   }
}

/**
 * Handles Razorpay webhook POST requests for payment status updates
 * @param request - The incoming Next.js request
 * @returns JSON response indicating success or failure
 */
export async function POST(request: NextRequest) {
   const bodyParseRes = await fromPromise(request.text(), err => err)
   if (bodyParseRes.isErr()) {
      console.error("Malformed request body", bodyParseRes.error)
      return NextResponse.json(
         {
            error: "Malformed request body",
         },
         { status: 400 }
      )
   }

   const signature = request.headers.get("x-razorpay-signature")

   const body = bodyParseRes.value
   if (!verifySignature(body, signature)) {
      return NextResponse.json(
         {
            error: "Invalid signature",
         },
         { status: 400 }
      )
   }

   const parseRes = fromThrowable(JSON.parse)(body)
   if (parseRes.isErr()) {
      return NextResponse.json(
         {
            error: "Invalid JSON payload",
         },
         { status: 400 }
      )
   }

   const { event } = parseRes.value as WebhookPayload

   if (event !== "payment.captured") {
      console.error("Unhandled event type", event)
      return NextResponse.json(
         {
            error: "Webhook processing failed",
         },
         { status: 500 }
      )
   }

   return NextResponse.json(
      {
         received: true,
      },
      { status: 200 }
   )
}

/**
 * Verifies the Razorpay webhook signature
 * @param body - The raw request body
 * @param signature - The signature from request headers
 * @returns True if signature is valid, false otherwise
 */
function verifySignature(body: string, signature: string | null): boolean {
   const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex")
   return signature === expectedSignature
}
