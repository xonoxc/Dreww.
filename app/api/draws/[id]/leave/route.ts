import { createServerSideClient } from "@/lib/supabase/server"
import { fromPromise } from "neverthrow"
import { NextResponse } from "next/server"

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
   const supabase = await createServerSideClient()
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
         { error: "draw_closed", message: "Cannot leave a closed draw" },
         { status: 400 }
      )
   }

   const deleteRes = await fromPromise(
      supabase
         .from("draw_participants")
         .delete()
         .eq("draw_id", drawId)
         .eq("user_id", user.id)
         .eq("status", "active"),
      err => err
   )

   if (deleteRes.isErr()) {
      console.error("Error leaving draw:", deleteRes.error)
      return NextResponse.json({ error: "something went wrong" }, { status: 500 })
   }

   return NextResponse.json({ success: true })
}
