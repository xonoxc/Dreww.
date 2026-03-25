import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { UserProfile } from "@/lib/supabase/data-actions"

export const PROFILE_QUERY_KEY = ["profile"]

export const useProfile = () => {
   const { user, loading: authLoading } = useAuth()

   return useQuery({
      queryKey: [...PROFILE_QUERY_KEY, user?.id],
      queryFn: async () => {
         const { data, error } = await apiClient
            .from("profiles")
            .select("*")
            .eq("id", user!.id)
            .single()

         if (error) throw new Error(error.message)
         return data as UserProfile
      },
      enabled: !!user && !authLoading,
   })
}

export const useUpdateProfile = () => {
   const queryClient = useQueryClient()
   const { user } = useAuth()

   return useMutation({
      mutationFn: async (updates: Partial<UserProfile>) => {
         if (!user) throw new Error("No user logged in")
         const { data, error } = await apiClient
            .from("profiles")
            .update(updates)
            .eq("id", user.id)
            .select()
            .single()

         if (error) throw new Error(error.message)
         return data
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      },
   })
}
