"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuditLogs } from "@/features/admin/hooks/useAuditLogs"

export function AuditLogs() {
   const { data: logs = [], isLoading: loading } = useAuditLogs()
   const [filter, setFilter] = useState("all")

   const filteredLogs =
      filter === "all"
         ? logs
         : logs.filter(log => log.action.toLowerCase().includes(filter.toLowerCase()))

   const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
         month: "short",
         day: "numeric",
         year: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      })
   }

   return (
      <div className="space-y-6">
         <div>
            <h3 className="text-xl font-bold tracking-tight">Admin Audit Logs</h3>
            <p className="text-sm text-muted-foreground">Complete record of all admin actions</p>
         </div>

         {/* Filter */}
         <div className="flex gap-2 overflow-x-auto pb-2">
            {["all", "create", "verify", "delete", "draw"].map(f => (
               <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                     filter === f
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
               >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
               </button>
            ))}
         </div>

         {/* Logs List */}
         <div className="space-y-2">
            {loading ? (
               Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
               ))
            ) : filteredLogs.length > 0 ? (
               filteredLogs.map(log => (
                  <div
                     key={log.id}
                     className="flex items-start gap-4 rounded-lg border border-border bg-card/30 p-4 transition-all duration-300 ease-out hover:bg-card/50"
                  >
                     <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/50 text-lg shrink-0">
                        {getActionIcon(log.action)}
                     </div>

                     <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                           <div>
                              <p className={`font-bold capitalize ${getActionColor(log.action)}`}>
                                 {log.action.replace(/_/g, " ")}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                 {formatDate(log.created_at)}
                              </p>
                           </div>
                        </div>

                        {Object.keys(log.details || {}).length > 0 && (
                           <div className="mt-2 text-xs text-muted-foreground bg-background/50 rounded px-2 py-1">
                              <details className="cursor-pointer">
                                 <summary className="font-mono">Details</summary>
                                 <pre className="mt-1 overflow-x-auto text-[0.65rem]">
                                    {JSON.stringify(log.details, null, 2)}
                                 </pre>
                              </details>
                           </div>
                        )}
                     </div>
                  </div>
               ))
            ) : (
               <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
                  <p className="text-muted-foreground">No audit logs found for this filter.</p>
               </div>
            )}
         </div>
      </div>
   )
}

const getActionColor = (action: string) => {
   if (action.includes("create")) return "text-green-400"
   if (action.includes("delete")) return "text-red-400"
   if (action.includes("verify") || action.includes("approve")) return "text-blue-400"
   if (action.includes("reject")) return "text-orange-400"
   return "text-gray-400"
}

const getActionIcon = (action: string) => {
   if (action.includes("create")) return "➕"
   if (action.includes("delete")) return "🗑️"
   if (action.includes("verify") || action.includes("approve")) return "✓"
   if (action.includes("reject")) return "✗"
   if (action.includes("draw")) return "🎲"
   return "📋"
}
