import { Database, TablesInsert } from "@/lib/supabase/database.types"
import { createServerSideClient } from "@/lib/supabase/server"
import { fromPromise } from "neverthrow"
import { NextResponse } from "next/server"

export async function GET(_: Request) {
   const supabase = await createServerSideClient()

   const userGetRes = await fromPromise(supabase.auth.getUser(), err => err)

   if (userGetRes.isErr()) {
      console.error("Error fetching current user:", userGetRes.error)
      return NextResponse.json(
         {
            error: "something went wrong",
         },
         { status: 500 }
      )
   }

   const {
      data: { user },
      error: userError,
   } = userGetRes.value

   if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
   }

   const now = new Date()
   const month = now.getMonth() + 1
   const year = now.getFullYear()

   const currentDrawsRes = await fromPromise(
      supabase.from("draws").select("*").eq("month", month).eq("year", year).eq("status", "open"),
      err => err
   )
   if (currentDrawsRes.isErr()) {
      console.error("Error fetching current draws:", currentDrawsRes.error)
      return NextResponse.json(
         {
            error: "something went wrong",
         },
         { status: 500 }
      )
   }

   const { data: draws, error: drawsError } = currentDrawsRes.value

   if (drawsError) {
      console.error("Error fetching current draws:", drawsError)
      return NextResponse.json(
         {
            error: "something went wrong",
         },
         { status: 500 }
      )
   }

   return NextResponse.json(draws)
}

export async function POST(request: Request) {
   const supabase = await createServerSideClient()

   const userGetRes = await fromPromise(supabase.auth.getUser(), err => err)

   if (userGetRes.isErr()) {
      console.error("Error fetching current user:", userGetRes.error)
      return NextResponse.json(
         {
            error: "something went wrong",
         },
         { status: 500 }
      )
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
         .select("is_admin")
         .eq("id", user.id)
         .single<Database["public"]["Tables"]["profiles"]["Row"]>(),
      err => err
   )

   if (profileRes.isErr()) {
      console.error("Error fetching current user profile:", profileRes.error)
      return NextResponse.json(
         {
            error: "something went wrong",
         },
         { status: 500 }
      )
   }

   const { data: profile } = profileRes.value

   if (!profile?.is_admin) {
      console.warn("Unauthorized draw creation attempt by user :: ", user.id)
      return NextResponse.json(
         {
            error: "Forbidden",
         },
         { status: 403 }
      )
   }

   const body = await request.json()

   const payload: TablesInsert<"draws"> = {
      month: body.month,
      year: body.year,
      draw_type: body.draw_type ?? "random",
      status: "open",
      prize_pool: body.prize_pool,
   }

   const createDrawRes = await fromPromise(
      supabase
         .from("draws")
         .insert(payload as any)
         .select()
         .single(),
      err => err
   )

   if (createDrawRes.isErr()) {
      console.error("Error creating new draw::", createDrawRes.error)
      return NextResponse.json(
         {
            error: "something went wrong",
         },
         { status: 500 }
      )
   }

   const { data: draw, error: drawError } = createDrawRes.value

   if (drawError) {
      console.error("Error creating new draw::", drawError)
      return NextResponse.json(
         {
            error: "something went wrong",
         },
         { status: 500 }
      )
   }

   return NextResponse.json(draw, { status: 201 })
}
