import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/supabase/client"
import { useAuth } from "@/features"

export const USER_DRAWS_KEY = ["user-draws"]

export const useUserParticipations = () => {
   const { user, loading: authLoading } = useAuth()

   return useQuery({
      queryKey: [...USER_DRAWS_KEY, "participations"],
      queryFn: async () => {
         const response = await fetch("/api/draws/my-participations")
         const data = await response.json()

         if (!response.ok) {
            throw new Error(data.error || "Failed to fetch participations")
         }

         return data
      },
      enabled: !!user && !authLoading,
   })
}

export const useIsParticipating = (drawId: string) => {
   const { data: participations } = useUserParticipations()
   return participations?.some((p: any) => p.draw_id === drawId && p.status === "active") ?? false
}

export const useUserDrawResults = () => {
   const { user, loading: authLoading } = useAuth()

   return useQuery({
      queryKey: [...USER_DRAWS_KEY, "results"],
      queryFn: async () => {
         const { data, error } = await apiClient
            .from("draw_results")
            .select("*, draws(*)")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })

         if (error) throw new Error(error.message)
         return data || []
      },
      enabled: !!user && !authLoading,
   })
}

export const usePendingClaim = () => {
   const { data: results } = useUserDrawResults()
   return results?.find((r: any) => r.status === "pending_verification" && r.claimed_at === null)
}
