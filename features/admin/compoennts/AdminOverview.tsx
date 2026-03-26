"use client"

import { AdminStats, useAdminStats } from "../hooks/useAdmin"
import { Skeleton } from "@/components/ui/skeleton"
import {
   IconUsers,
   IconTicket,
   IconCoins,
   IconDice,
   IconCheck,
   IconHeartHandshake,
} from "@tabler/icons-react"

export function AdminOverview() {
   const { data: stats, isLoading: loading } = useAdminStats()

   if (loading) return <LoadingFallback />

   const statCards = getStatsCards(stats)

   return (
      <div className="space-y-6">
         <div className="grid gap-4 md:grid-cols-5">
            {statCards.map((card, i) => (
               <div
                  key={i}
                  className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all duration-300 ease-out hover:border-accent hover:shadow-lg hover:shadow-accent/10"
               >
                  <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-br from-accent/5 to-transparent" />

                  <div className="flex items-start justify-between">
                     <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">{card.label}</p>
                        <p className="text-2xl font-bold text-foreground">{card.value}</p>
                        <p className="text-xs text-primary mt-2 font-medium">{card.change}</p>
                     </div>
                     <div className="text-2xl opacity-50">{card.icon}</div>
                  </div>

                  <div className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-accent to-transparent transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left" />
               </div>
            ))}
         </div>
      </div>
   )
}

function getStatsCards(stats?: AdminStats) {
   return [
      {
         label: "Total Users",
         value: stats?.totalUsers ?? 0,
         change: "+12%",
         icon: <IconUsers className="w-5 h-5" />,
      },
      {
         label: "Total Scores",
         value: stats?.totalScores ?? 0,
         change: "+8%",
         icon: <IconTicket className="w-5 h-5" />,
      },
      {
         label: "Charity Funds",
         value: `$${(stats?.totalCharityFunds ?? 0).toLocaleString()}`,
         change: "+24%",
         icon: <IconHeartHandshake className="w-5 h-5" />,
      },
      {
         label: "Active Draws",
         value: stats?.activeDraws ?? 0,
         change: "This Month",
         icon: <IconDice className="w-5 h-5" />,
      },
      {
         label: "Pending Verifications",
         value: stats?.pendingVerifications ?? 0,
         change: "Action Required",
         icon: <IconCheck className="w-5 h-5" />,
      },
   ]
}

function LoadingFallback() {
   return (
      <div className="grid gap-4 md:grid-cols-5">
         {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
         ))}
      </div>
   )
}
