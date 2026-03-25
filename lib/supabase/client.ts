import { createBrowserClient } from "@supabase/ssr"

export const apiClient = createBrowserClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL!,
   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
