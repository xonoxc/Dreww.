import { createAdminClient } from "@/lib/supabase/server"
import { fromPromise } from "neverthrow"
import { NextResponse } from "next/server"

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
   const supabase = createAdminClient()
   const { id: drawId } = await params

   const userGetRes = await fromPromise(supabase.auth.getUser(), err => err)

   if (userGetRes.isErr()) {
      console.error("Error fetching current user:", userGetRes.error)
      return NextResponse.json({ error: "something went wrong" }, { status: 500 })
   }

   const {
      data: { user },
      error: userError,
   } = userGetRes.value

   if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
   }

   const profileRes = await fromPromise(
      supabase
         .from("profiles")
         .select("subscription_tier, subscription_status")
         .eq("id", user.id)
         .single(),
      err => err
   )

   if (profileRes.isErr()) {
      console.error("Error fetching profile:", profileRes.error)
      return NextResponse.json(
         {
            error: "something went wrong",
         },
         { status: 500 }
      )
   }

   const profile = profileRes.value.data as {
      subscription_tier: string | null
      subscription_status: string | null
   } | null

   if (profile?.subscription_tier === "free" || !profile?.subscription_tier) {
      return NextResponse.json(
         {
            error: "subscription_required",
            message: "Upgrade to Premium or Elite to participate",
         },
         { status: 403 }
      )
   }

   if (profile?.subscription_status !== "active") {
      return NextResponse.json(
         { error: "subscription_inactive", message: "Your subscription is not active" },
         { status: 403 }
      )
   }

   const drawRes = await fromPromise(
      supabase.from("draws").select("status").eq("id", drawId).single(),
      err => err
   )

   if (drawRes.isErr()) {
      console.error("Error fetching draw:", drawRes.error)
      return NextResponse.json({ error: "draw not found" }, { status: 404 })
   }

   const draw = drawRes.value.data as { status: string } | null

   if (draw?.status !== "open") {
      return NextResponse.json(
         { error: "draw_closed", message: "This draw is no longer open" },
         { status: 400 }
      )
   }

   const existingRes = await fromPromise(
      (supabase as any)
         .from("draw_participants")
         .select("*")
         .eq("draw_id", drawId)
         .eq("user_id", user.id)
         .eq("status", "active")
         .single(),
      err => err
   )

   if (existingRes.isOk() && existingRes.value.data) {
      return NextResponse.json(
         { error: "already_participating", message: "You are already participating in this draw" },
         { status: 400 }
      )
   }

   const participateRes = await fromPromise(
      (supabase as any)
         .from("draw_participants")
         .insert({ draw_id: drawId, user_id: user.id, status: "active" })
         .select()
         .single(),
      err => err
   )

   if (participateRes.isErr()) {
      console.error("Error participating in draw:", participateRes.error)
      return NextResponse.json({ error: "something went wrong" }, { status: 500 })
   }

   const participation = participateRes.value.data

   return NextResponse.json(participation, { status: 201 })
}
