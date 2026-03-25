import { useQuery } from "@tanstack/react-query"
import { getCurrentUser } from "@/lib/supabase/actions"

export const AUTH_QUERY_KEY = ["auth", "user"]

export const useAuth = () => {
   const { data, isLoading } = useQuery({
      queryKey: AUTH_QUERY_KEY,
      queryFn: async () => {
         const { data, error } = await getCurrentUser()
         if (error) {
            throw error
         }

         return data
      },
      staleTime: 5_000,
   })

   return {
      user: data?.user!,
      loading: isLoading,
   }
}
