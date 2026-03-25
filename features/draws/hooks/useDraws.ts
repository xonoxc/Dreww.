import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/supabase/client"

export const DRAWS_QUERY_KEY = ["draws"]

export const useDraws = () => {
   return useQuery({
      queryKey: DRAWS_QUERY_KEY,
      queryFn: async () => {
         const { data, error } = await apiClient
            .from("draws")
            .select("*")
            .order("created_at", { ascending: false })

         if (error) throw new Error(error.message)
         return data || []
      },
   })
}

export const useDrawResults = (drawId: string) => {
   return useQuery({
      queryKey: [...DRAWS_QUERY_KEY, "results", drawId],
      queryFn: async () => {
         const { data, error } = await apiClient
            .from("draw_results")
            .select("*")
            .eq("draw_id", drawId)
            .order("position", { ascending: true })

         if (error) throw new Error(error.message)
         return data || []
      },
      enabled: !!drawId,
   })
}

export const useCurrentMonthDraw = () => {
   const { data: draws } = useDraws()

   if (!draws) return null

   const now = new Date()
   return draws.find(d => d.month === now.getMonth() + 1 && d.year === now.getFullYear()) ?? null
}
