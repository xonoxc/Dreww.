import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { golfScoreSchema } from "@/lib/schemas/golf"

export async function GET(request: Request) {
   try {
      const supabase = await createClient()

      const {
         data: { user },
         error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { data: scores, error: scoresError } = await supabase
         .from("golf_scores")
         .select("*")
         .eq("user_id", user.id)
         .order("score_date", { ascending: false })

      if (scoresError) {
         return NextResponse.json({ error: scoresError.message }, { status: 500 })
      }

      return NextResponse.json(scores)
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

      const {
         data: { user },
         error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const body = await request.json()

      // Validate with Zod
      const validated = golfScoreSchema.parse(body)

      const { data: score, error: scoreError } = await supabase
         .from("golf_scores")
         .insert([
            {
               user_id: user.id,
               stableford_score: validated.stableforfScore,
               course_name: validated.courseName,
               course_par: validated.coursePar,
               score_date: validated.scoreDate,
               notes: validated.notes,
            },
         ])
         .select()
         .single()

      if (scoreError) {
         return NextResponse.json({ error: scoreError.message }, { status: 500 })
      }

      return NextResponse.json(score, { status: 201 })
   } catch (error) {
      if (error instanceof Error) {
         return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
   }
}
