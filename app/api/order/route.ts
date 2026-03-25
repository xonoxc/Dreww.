import { createServerSideClient } from "@/lib/supabase/server"
import { fromPromise } from "neverthrow"
import { NextResponse } from "next/server"

export async function POST() {
   const supabase = await createServerSideClient()

   const fetchUserRes = await fromPromise(supabase.auth.getUser(), err => err)
   if (fetchUserRes.isErr()) {
      return NextResponse.json(
         {
            error: "Unauthorized",
         },
         { status: 401 }
      )
   }

   const {
      data: { user },
      error,
   } = fetchUserRes.value

   if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
   }

   const subsDetailRes = await fromPromise(
      supabase.from("profiles").select("subscription_tier").eq("id", user.id).single(),
      err => err
   )

   if (subsDetailRes.isErr()) {
      console.error("Profile fetch error:", subsDetailRes.error)
      return NextResponse.json(
         {
            error: "Profile not found",
         },
         { status: 404 }
      )
   }

   const { data: profile, error: fetchError } = subsDetailRes.value

   if (fetchError) {
      console.error(" Profile fetch error:", fetchError)
      return NextResponse.json(
         {
            error: "Profile not found",
         },
         { status: 404 }
      )
   }

   const now = new Date()
   const subscriptionEnd = new Date()
   subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)

   const subUpdateRes = await fromPromise(
      supabase
         .from("profiles")
         // @ts-ignore
         .update({
            subscription_status: "active",
            subscription_tier: "premium",
            subscription_start_date: now.toISOString(),
            subscription_end_date: subscriptionEnd.toISOString(),
         })
         .eq("id", user.id),
      err => err
   )

   if (subUpdateRes.isErr()) {
      console.error("Subscription update error:", subUpdateRes.error)
      return NextResponse.json(
         {
            error: "Failed to update subscription",
         },
         { status: 500 }
      )
   }

   const { error: updateError } = subUpdateRes.value

   if (updateError) {
      console.error("Subscription update error:", updateError)
      return NextResponse.json(
         {
            error: "Failed to update subscription",
         },
         { status: 500 }
      )
   }

   return NextResponse.json({
      message: "Subscription activated",
      subscriptionEnd,
   })
}

export async function GET() {
   const supabase = await createServerSideClient()

   const fetchUserRes = await fromPromise(supabase.auth.getUser(), err => err)
   if (fetchUserRes.isErr()) {
      return NextResponse.json(
         {
            error: "Unauthorized",
         },
         { status: 401 }
      )
   }

   const {
      data: { user },
      error,
   } = fetchUserRes.value

   if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
   }

   const subsDetailRes = await fromPromise(
      supabase
         .from("profiles")
         .select("subscription_status, subscription_end_date, subscription_tier")
         .eq("id", user.id)
         .single(),
      err => err
   )

   if (subsDetailRes.isErr()) {
      console.error("Fetch subscription details error:", subsDetailRes.error)
      return NextResponse.json(
         {
            error: "failed to fetch subscription details",
         },
         { status: 404 }
      )
   }

   const { data: profile, error: fetchError } = subsDetailRes.value
   if (fetchError || !profile) {
      return NextResponse.json(
         {
            error: "Profile not found",
         },
         { status: 404 }
      )
   }

   const now = new Date()

   // autoexpire
   // @ts-ignore
   if (profile.subscription_end_date && new Date(profile.subscription_end_date) < now) {
      await supabase
         .from("profiles")
         // @ts-ignore
         .update({
            subscription_status: "cancelled",
            subscription_tier: "free",
            subscription_end_date: null,
         })
         .eq("id", user.id)

      return NextResponse.json({
         subscription_status: "cancelled",
         subscription_tier: "free",
      })
   }

   return NextResponse.json(profile)
}
