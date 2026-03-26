import { createServerSideClient } from "@/lib/supabase/server"
import { fromPromise } from "neverthrow"
import { NextResponse } from "next/server"

export async function GET(_: Request) {
   const supabase = await createServerSideClient()

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

   const participationsRes = await fromPromise(
      supabase
         .from("draw_participants")
         .select("*, draws(*)")
         .eq("user_id", user.id)
         .order("entered_at", { ascending: false }),
      err => err
   )

   if (participationsRes.isErr()) {
      console.error("Error fetching participations:", participationsRes.error)
      return NextResponse.json({ error: "something went wrong" }, { status: 500 })
   }

   const participations = participationsRes.value.data || []

   console.log("User participations:", participations)

   return NextResponse.json(participations)
}
