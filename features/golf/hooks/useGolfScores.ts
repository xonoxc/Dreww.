import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/supabase/client"
import { TablesInsert } from "@/lib/supabase/database.types"
import { useAuth } from "@/features/auth/hooks/useAuth"
import type { GolfScore } from "@/lib/supabase/data-actions"

export const GOLF_SCORES_QUERY_KEY = ["golf-scores"]

export const useGolfScores = () => {
   const { user, loading: authLoading } = useAuth()

   return useQuery({
      queryKey: [...GOLF_SCORES_QUERY_KEY, user?.id],
      queryFn: async () => {
         if (!user) return []
         const { data, error } = await apiClient
            .from("golf_scores")
            .select("*")
            .eq("user_id", user.id)
            .order("score_date", { ascending: false })

         if (error) throw new Error(error.message)
         return data ?? []
      },
      enabled: !!user && !authLoading,
   })
}

export const useAddGolfScore = () => {
   const queryClient = useQueryClient()
   const { user } = useAuth()

   return useMutation({
      mutationFn: async (scoreData: TablesInsert<"golf_scores">) => {
         if (!user) throw new Error("No user logged in")
         const { data, error } = await apiClient
            .from("golf_scores")
            .insert([{ ...scoreData, user_id: user.id }])
            .select()
            .single()

         if (error) throw new Error(error.message)
         return data
      },
      onSuccess: newScore => {
         if (!user) return
         queryClient.setQueryData<GolfScore[]>([...GOLF_SCORES_QUERY_KEY, user.id], old => {
            if (!old) return [newScore]
            return [newScore, ...old]
         })
      },
   })
}

export const useDeleteGolfScore = () => {
   const queryClient = useQueryClient()
   const { user } = useAuth()

   return useMutation({
      mutationFn: async (scoreId: string) => {
         const { error } = await apiClient.from("golf_scores").delete().eq("id", scoreId)

         if (error) throw new Error(error.message)
         return scoreId
      },
      onSuccess: (_data, scoreId) => {
         if (!user) return
         queryClient.setQueryData<GolfScore[]>([...GOLF_SCORES_QUERY_KEY, user.id], old => {
            if (!old) return old
            return old.filter(s => s.id !== scoreId)
         })
      },
   })
}

export const useLastFiveScores = () => {
   const { data: scores } = useGolfScores()
   return scores?.slice(0, 5) ?? []
}

export const useAverageScore = () => {
   const { data: scores } = useGolfScores()
   if (!scores || scores.length === 0) return 0
   const sum = scores.reduce((acc, score) => acc + score.stableford_score, 0)
   return Math.round(sum / scores.length)
}
