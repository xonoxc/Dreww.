import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/supabase/client"
import { useAuth } from "@/features"

export const DRAW_PARTICIPATION_KEY = ["draw-participation"]

export const useDrawParticipants = (drawId: string) => {
   return useQuery({
      queryKey: [...DRAW_PARTICIPATION_KEY, drawId, "participants"],
      queryFn: async () => {
         const { data, error } = await apiClient
            .from("draw_participants")
            .select("*, profiles(full_name, avatar_url)")
            .eq("draw_id", drawId)

         if (error) throw new Error(error.message)
         return data || []
      },
      enabled: !!drawId,
   })
}

export const useParticipateInDraw = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: async (drawId: string) => {
         const response = await fetch(`/api/draws/${drawId}/participate`, {
            method: "POST",
         })

         const data = await response.json()

         if (!response.ok) {
            throw new Error(data.error || "Failed to participate")
         }

         return data
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["user-draws"] })
         queryClient.invalidateQueries({ queryKey: ["draws"] })
      },
   })
}

export const useLeaveDraw = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: async (drawId: string) => {
         const response = await fetch(`/api/draws/${drawId}/leave`, {
            method: "DELETE",
         })

         const data = await response.json()

         if (!response.ok) {
            throw new Error(data.error || "Failed to leave draw")
         }

         return data
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: DRAW_PARTICIPATION_KEY })
         queryClient.invalidateQueries({ queryKey: ["draws"] })
      },
   })
}

export const useExecuteDraw = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: async (drawId: string) => {
         const response = await fetch(`/api/draws/${drawId}/execute`, {
            method: "POST",
         })

         const data = await response.json()

         if (!response.ok) {
            throw new Error(data.error || "Failed to execute draw")
         }

         return data
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["draws"] })
         queryClient.invalidateQueries({ queryKey: DRAW_PARTICIPATION_KEY })
      },
   })
}

export const useClaimPrize = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: async ({
         drawResultId,
         proof_screenshot_url,
         winner_photo_url,
      }: {
         drawResultId: string
         proof_screenshot_url: string
         winner_photo_url: string
      }) => {
         const response = await fetch(`/api/draws/${drawResultId}/claim`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proof_screenshot_url, winner_photo_url }),
         })

         const data = await response.json()

         if (!response.ok) {
            throw new Error(data.error || "Failed to submit claim")
         }

         return data
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["draw-results"] })
      },
   })
}
