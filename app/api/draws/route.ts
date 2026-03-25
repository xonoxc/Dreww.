import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
   try {
      const supabase = await createClient()

      // Get current user
      const {
         data: { user },
         error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Get current month draws
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()

      const { data: draws, error: drawsError } = await supabase
         .from("draws")
         .select("*")
         .eq("month", month)
         .eq("year", year)
         .eq("status", "open")

      if (drawsError) {
         return NextResponse.json({ error: drawsError.message }, { status: 500 })
      }

      return NextResponse.json(draws)
   } catch (error) {
      return NextResponse.json(
         { error: error instanceof Error ? error.message : "Internal server error" },
         { status: 500 }
      )
   }
}

export async function POST(request: Request) {
   try {
      const supabase = await createClient()

      // Get current user and check if admin
      const {
         data: { user },
         error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Check if user is admin
      const { data: profile } = await supabase
         .from("profiles")
         .select("is_admin")
         .eq("id", user.id)
         .single()

      if (!profile?.is_admin) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const body = await request.json()

      const { data: draw, error: drawError } = await supabase
         .from("draws")
         .insert([
            {
               month: body.month,
               year: body.year,
               draw_type: body.draw_type || "random",
               status: "open",
               prize_pool: body.prize_pool,
            },
         ])
         .select()
         .single()

      if (drawError) {
         return NextResponse.json({ error: drawError.message }, { status: 500 })
      }

      return NextResponse.json(draw, { status: 201 })
   } catch (error) {
      return NextResponse.json(
         { error: error instanceof Error ? error.message : "Internal server error" },
         { status: 500 }
      )
   }
}
