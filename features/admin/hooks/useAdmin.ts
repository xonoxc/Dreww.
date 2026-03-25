import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/supabase/client"

export interface AdminStats {
   totalUsers: number
   totalScores: number
   totalCharityFunds: number
   activeDraws: number
   pendingVerifications: number
}

export const ADMIN_STATS_QUERY_KEY = ["admin", "stats"]

const fetchAdminStats = async (): Promise<AdminStats> => {
   const {
      data: { user },
   } = await apiClient.auth.getUser()
   if (!user) throw new Error("Not authenticated")

   const { data: profile } = await apiClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

   if (!profile?.is_admin) {
      throw new Error("Admin access required")
   }

   const { count: usersCount } = await apiClient
      .from("profiles")
      .select("*", { count: "exact", head: true })

   const { count: scoresCount } = await apiClient
      .from("golf_scores")
      .select("*", { count: "exact", head: true })

   const { data: charityData } = await apiClient.from("charity_contributions").select("amount")

   const totalCharityFunds = charityData?.reduce((sum, row) => sum + (row.amount || 0), 0) || 0

   const { count: drawsCount } = await apiClient
      .from("draws")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

   const { count: verificationsCount } = await apiClient
      .from("draw_results")
      .select("*", { count: "exact", head: true })
      .eq("admin_verified", false)

   return {
      totalUsers: usersCount || 0,
      totalScores: scoresCount || 0,
      totalCharityFunds,
      activeDraws: drawsCount || 0,
      pendingVerifications: verificationsCount || 0,
   }
}

const logAdminAction = async (action: string, details: Record<string, unknown>) => {
   const {
      data: { user },
   } = await apiClient.auth.getUser()
   if (!user) return

   const { error } = await apiClient.from("admin_logs").insert({
      admin_id: user.id,
      action,
      details,
   })
   if (error) throw error
}

export function useAdminStats() {
   return useQuery({
      queryKey: ADMIN_STATS_QUERY_KEY,
      queryFn: fetchAdminStats,
   })
}

export function useAdminLogAction() {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: ({ action, details }: { action: string; details: Record<string, unknown> }) =>
         logAdminAction(action, details),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY })
      },
   })
}
