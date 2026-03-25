import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/supabase/client"

export interface AuditLog {
   id: string
   admin_id: string
   action: string
   details: Record<string, unknown> | null
   created_at: string
   admin_email?: string
}

export const AUDIT_LOGS_QUERY_KEY = ["admin", "auditLogs"]

const fetchAuditLogs = async (): Promise<AuditLog[]> => {
   const { data, error } = await apiClient
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

   if (error) throw error
   return data || []
}

export function useAuditLogs() {
   return useSuspenseQuery({
      queryKey: AUDIT_LOGS_QUERY_KEY,
      queryFn: fetchAuditLogs,
   })
}
