import { createServerSideClient } from "@/lib/supabase/server"
import { fromPromise } from "neverthrow"
import { NextResponse } from "next/server"

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
   const supabase = await createServerSideClient()
   const { id: drawId } = await params

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

   const adminCheckRes = await fromPromise(
      supabase.from("profiles").select("is_admin").eq("id", user.id).single(),
      err => err
   )

   if (adminCheckRes.isErr()) {
      console.error("Error checking admin:", adminCheckRes.error)
      return NextResponse.json(
         {
            error: "something went wrong",
         },
         { status: 500 }
      )
   }

   const adminProfile = adminCheckRes.value.data as { is_admin: boolean } | null

   if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
   }

   const drawRes = await fromPromise(
      supabase
         .from("draws")
         .select("*, draw_participants(*, profiles(*))")
         .eq("id", drawId)
         .single(),
      err => err
   )

   if (drawRes.isErr()) {
      console.error("Error fetching draw:", drawRes.error)
      return NextResponse.json({ error: "draw not found" }, { status: 404 })
   }

   const draw = drawRes.value.data as any

   if (!draw) {
      return NextResponse.json({ error: "draw not found" }, { status: 404 })
   }

   if (draw.status !== "open") {
      return NextResponse.json(
         { error: "draw_not_open", message: "Draw is not open" },
         { status: 400 }
      )
   }

   const participants = draw.draw_participants?.filter((p: any) => p.status === "active") || []

   if (participants.length < 3) {
      return NextResponse.json(
         {
            error: "insufficient_participants",
            message: "Need at least 3 participants to run draw",
         },
         { status: 400 }
      )
   }

   const participantIds = participants.map((p: any) => p.user_id)

   const scoresRes = await fromPromise(
      supabase
         .from("golf_scores")
         .select("user_id, stableford_score, score_date")
         .in("user_id", participantIds)
         .order("score_date", { ascending: false }),
      err => err
   )

   if (scoresRes.isErr()) {
      console.error("Error fetching scores:", scoresRes.error)
      return NextResponse.json({ error: "something went wrong" }, { status: 500 })
   }

   const scores = scoresRes.value.data || []
   const userScoresMap = new Map<string, number[]>()

   scores.forEach((score: any) => {
      if (!userScoresMap.has(score.user_id)) {
         userScoresMap.set(score.user_id, [])
      }
      const userScores = userScoresMap.get(score.user_id)!
      if (userScores.length < 5) {
         userScores.push(score.stableford_score)
      }
   })

   const rankedParticipants = participants
      .map((p: any) => {
         const userScores = userScoresMap.get(p.user_id) || []
         const avgScore =
            userScores.length > 0
               ? userScores.reduce((a: number, b: number) => a + b, 0) / userScores.length
               : 0
         return { ...p, avgScore, scores: userScores }
      })
      .sort((a: any, b: any) => b.avgScore - a.avgScore)

   const top3 = rankedParticipants.slice(0, 3)

   const firstPlaceAmount = Number(draw.prize_pool) * Number(draw.first_place_pct || 0.4)
   const secondPlaceAmount = Number(draw.prize_pool) * Number(draw.second_place_pct || 0.35)
   const thirdPlaceAmount = Number(draw.prize_pool) * Number(draw.third_place_pct || 0.25)
   const prizeAmounts = [firstPlaceAmount, secondPlaceAmount, thirdPlaceAmount]

   const winners: any[] = []

   for (let i = 0; i < top3.length; i++) {
      const participant = top3[i]

      const drawResultRes = await fromPromise(
         supabase
            .from("draw_results")
            .insert({
               draw_id: drawId,
               user_id: participant.user_id,
               position: i + 1,
               prize_amount: prizeAmounts[i],
               score_used: participant.avgScore,
               status: "pending_verification",
            } as any)
            .select()
            .single(),
         err => err
      )

      if (drawResultRes.isErr()) {
         console.error("Error creating draw result:", drawResultRes.error)
         continue
      }

      const drawResult = drawResultRes.value.data as any

      ;(async () => {
         await supabase
            .from("draw_participants")
            .update({ status: "winner" })
            .eq("draw_id", drawId)
            .eq("user_id", participant.user_id)
         await supabase.from("notifications").insert({
            user_id: participant.user_id,
            type: "draw_winner",
            title: "Congratulations! You Won!",
            message: `You placed ${i + 1}${getOrdinalSuffix(i + 1)} in the ${getMonthName(draw.month)} ${draw.year} draw! Click to claim your prize of ₹${prizeAmounts[i].toFixed(2)}`,
            data: {
               draw_id: drawId,
               draw_result_id: drawResult?.id,
               position: i + 1,
               prize_amount: prizeAmounts[i],
            },
         } as any)
      })()

      winners.push(drawResult)
   }

   ;(async () => {
      await supabase
         .from("draws")
         .update({ status: "closed", closed_at: new Date().toISOString() })
         .eq("id", drawId)
   })()

   return NextResponse.json({ success: true, winners })
}

function getOrdinalSuffix(n: number): string {
   const s = ["th", "st", "nd", "rd"]
   const v = n % 100
   return s[(v - 20) % 10] || s[v] || s[0]
}

function getMonthName(month: number): string {
   const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
   ]
   return months[month - 1] || ""
}
