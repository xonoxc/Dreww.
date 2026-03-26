import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/supabase/client"

export interface DrawForManagement {
   id: string
   month: string
   year: number
   draw_type: "random" | "algorithmic" | "hybrid"
   status: "open" | "closed" | "completed"
   eligible_users_count: number
   prize_pool: number
   created_at: string
   closed_at: string | null
}

export interface WinnerForVerification {
   id: string
   draw_id: string
   user_id: string
   position: number
   prize_amount: number
   admin_verified: boolean
   winner_email: string
}

export const DRAWS_QUERY_KEY = ["admin", "draws"]
export const PENDING_VERIFICATIONS_QUERY_KEY = ["admin", "pendingVerifications"]

const fetchDraws = async (): Promise<DrawForManagement[]> => {
   const { data, error } = await apiClient
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false })

   if (error) throw error
   return data || []
}

const fetchPendingVerifications = async (): Promise<WinnerForVerification[]> => {
   const { data, error } = await apiClient
      .from("draw_results")
      .select("*, profiles:profiles!draw_results_user_id_fkey(email)")
      .eq("status", "pending_verification")
      .order("created_at", { ascending: false })

   if (error) throw error

   return (data || []).map((row: any) => ({
      id: row.id,
      draw_id: row.draw_id,
      user_id: row.user_id,
      position: row.position,
      prize_amount: row.prize_amount,
      admin_verified: row.status === "verified",
      winner_email: row.profiles?.email || "",
   }))
}

const createDraw = async (monthName: string, year: number, drawType: string) => {
   const MONTHS = [
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
   const monthNum = MONTHS.indexOf(monthName) + 1

   const { data, error } = await apiClient
      .from("draws")
      .insert({
         month: monthNum,
         year,
         draw_type: drawType as "random" | "algorithmic" | "hybrid",
         status: "open",
         eligible_users_count: 0,
         prize_pool: 0,
      })
      .select()
      .single()

   if (error) throw error
   return data
}

const executeDraw = async (drawId: string) => {
   const response = await fetch(`/api/draws/${drawId}/execute`, {
      method: "POST",
   })

   let data
   try {
      data = await response.json()
   } catch (e) {
      throw new Error(`Server error: ${response.status}`)
   }

   if (!response.ok) {
      throw new Error(data?.error || `Failed to execute draw: ${response.status}`)
   }

   return data
}

const verifyWinner = async (resultId: string, approved: boolean) => {
   const { error } = await apiClient
      .from("draw_results")
      .update({
         status: approved ? "verified" : "cancelled",
         verified_at: new Date().toISOString(),
      })
      .eq("id", resultId)

   if (error) throw error
   return true
}

const completeDraw = async (drawId: string) => {
   const { error } = await apiClient.from("draws").update({ status: "completed" }).eq("id", drawId)

   if (error) throw error
   return true
}

export function useDraws() {
   return useQuery({
      queryKey: DRAWS_QUERY_KEY,
      queryFn: fetchDraws,
   })
}

export function usePendingVerifications() {
   return useQuery({
      queryKey: PENDING_VERIFICATIONS_QUERY_KEY,
      queryFn: fetchPendingVerifications,
   })
}

export function useCreateDraw() {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: ({ month, year, drawType }: { month: string; year: number; drawType: string }) =>
         createDraw(month, year, drawType),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: DRAWS_QUERY_KEY })
      },
   })
}

export function useExecuteDraw() {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (drawId: string) => executeDraw(drawId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: DRAWS_QUERY_KEY })
         queryClient.invalidateQueries({ queryKey: PENDING_VERIFICATIONS_QUERY_KEY })
      },
   })
}

export function useVerifyWinner() {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: ({ resultId, approved }: { resultId: string; approved: boolean }) =>
         verifyWinner(resultId, approved),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: PENDING_VERIFICATIONS_QUERY_KEY })
      },
   })
}

export function useCompleteDraw() {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: (drawId: string) => completeDraw(drawId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: DRAWS_QUERY_KEY })
      },
   })
}
