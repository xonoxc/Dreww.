import { useQuery } from "@tanstack/react-query"
import { fetchCharities, type Charity } from "@/lib/supabase/data-actions"

export const CHARITIES_QUERY_KEY = ["charities"]

export const useCharities = () => {
   return useQuery({
      queryKey: CHARITIES_QUERY_KEY,
      queryFn: async () => {
         const { data, error } = await fetchCharities()
         if (error) {
            throw error
         }

         return data
      },
   })
}

export const useSearchCharities = (query: string) => {
   const { data: charities } = useCharities()

   if (!charities) return []

   const lowerQuery = query.toLowerCase()
   return charities.filter(
      charity =>
         charity.name.toLowerCase().includes(lowerQuery) ||
         charity.description?.toLowerCase().includes(lowerQuery)
   )
}

export const useCharityById = (id: string) => {
   const { data: charities } = useCharities()
   return charities?.find(c => c.id === id) ?? null
}
