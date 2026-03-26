import { createServerSideClient } from "@/lib/supabase/server"
import { fromPromise } from "neverthrow"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
   const supabase = await createServerSideClient()
   const { id: drawResultId } = await params

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

   const body = await request.json()
   const { proof_screenshot_url, winner_photo_url } = body

   const drawResultRes = await fromPromise(
      supabase
         .from("draw_results")
         .select("*, draws(*)")
         .eq("id", drawResultId)
         .eq("user_id", user.id)
         .single(),
      err => err
   )

   if (drawResultRes.isErr()) {
      console.error("Error fetching draw result:", drawResultRes.error)
      return NextResponse.json({ error: "draw result not found" }, { status: 404 })
   }

   const drawResult = drawResultRes.value.data as any

   if (drawResult.status !== "pending_verification") {
      return NextResponse.json(
         { error: "invalid_status", message: "This prize cannot be claimed" },
         { status: 400 }
      )
   }

   const updateRes = await fromPromise(
      (supabase as any)
         .from("draw_results")
         .update({
            proof_screenshot_url,
            winner_photo_url,
            claimed_at: new Date().toISOString(),
         })
         .eq("id", drawResultId),
      err => err
   )

   if (updateRes.isErr()) {
      console.error("Error updating claim:", updateRes.error)
      return NextResponse.json({ error: "something went wrong" }, { status: 500 })
   }

   return NextResponse.json({ success: true })
}
