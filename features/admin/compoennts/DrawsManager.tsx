"use client"

import { useState } from "react"
import {
   useDraws,
   useCreateDraw,
   useExecuteDraw,
   useCompleteDraw,
} from "../hooks/useDrawerManagement"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fromPromise } from "neverthrow"

const MONTHS = [
   "January",
   "February",
   "March",
   "April",
   "May",
   "June",
   "July",
   "August",
   "September",
   "October",
   "November",
   "December",
]

const DRAW_TYPES = [
   { value: "random", label: "Random Draw" },
   { value: "algorithmic", label: "Algorithmic (Score-Based)" },
]

export function DrawsManager() {
   const { data: draws = [], isLoading: loading } = useDraws()
   const createDrawMutation = useCreateDraw()
   const executeDrawMutation = useExecuteDraw()
   const completeDrawMutation = useCompleteDraw()
   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
   const [selectedType, setSelectedType] = useState("random")
   const [prizePool, setPrizePool] = useState<number>(10000)
   const [executingDrawId, setExecutingDrawId] = useState<string | null>(null)
   const [executeError, setExecuteError] = useState<{ drawId: string; message: string } | null>(
      null
   )

   const handleCreateDraw = async () => {
      await fromPromise(
         createDrawMutation.mutateAsync({
            month: MONTHS[selectedMonth],
            year: selectedYear,
            drawType: selectedType,
            prizePool,
         }),
         err => console.error("Create draw error:", err)
      )
   }

   const handleExecuteDraw = async (drawId: string) => {
      setExecuteError(null)
      setExecutingDrawId(drawId)
      await fromPromise(executeDrawMutation.mutateAsync(drawId), err => {
         console.error("Execute draw error:", err)
         setExecuteError("Failed to execute draw")
      })

      setExecutingDrawId(null)
   }

   const handleCompleteDraw = async (drawId: string) => {
      await fromPromise(completeDrawMutation.mutateAsync(drawId), err =>
         console.error("Complete draw error:", err)
      )
   }

   return (
      <div className="space-y-6">
         {executeError && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
               {executeError}
            </div>
         )}
         <div>
            <h3 className="text-xl font-bold tracking-tight">Monthly Draws Management</h3>
            <p className="text-sm text-muted-foreground">Create and manage monthly prize draws</p>
         </div>

         {/* Create New Draw */}
         <div className="rounded-lg border border-border bg-card p-6">
            <h4 className="font-bold mb-4">Create New Draw</h4>

            <div className="grid gap-4 md:grid-cols-4">
               <div>
                  <label className="block text-sm font-medium mb-2">Month</label>
                  <select
                     value={selectedMonth}
                     onChange={e => setSelectedMonth(parseInt(e.target.value))}
                     className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                     {MONTHS.map((month, idx) => (
                        <option key={month} value={idx}>
                           {month}
                        </option>
                     ))}
                  </select>
               </div>

               <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <input
                     type="number"
                     value={selectedYear}
                     onChange={e => setSelectedYear(parseInt(e.target.value))}
                     className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium mb-2">Draw Type</label>
                  <select
                     value={selectedType}
                     onChange={e => setSelectedType(e.target.value)}
                     className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                     {DRAW_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                           {type.label}
                        </option>
                     ))}
                  </select>
               </div>

               <div className="flex items-end">
                  <Button
                     onClick={handleCreateDraw}
                     disabled={createDrawMutation.isPending}
                     className="w-full bg-accent hover:bg-accent/90"
                  >
                     {createDrawMutation.isPending ? "Creating..." : "Create Draw"}
                  </Button>
               </div>
            </div>
         </div>

         {/* Draws List */}
         <div className="space-y-3">
            <h4 className="font-bold">Active & Recent Draws</h4>

            {loading ? (
               <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                     <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
               </div>
            ) : draws.length > 0 ? (
               <div className="space-y-3">
                  {draws.map(draw => (
                     <div
                        key={draw.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4 transition-all duration-300 ease-out hover:border-accent hover:bg-card"
                     >
                        <div className="flex-1">
                           <div className="flex items-center gap-3">
                              <div>
                                 <h5 className="font-bold">
                                    {draw.month} {draw.year}
                                 </h5>
                                 <p className="text-sm text-muted-foreground">
                                    {draw.eligible_users_count} participants • $
                                    {draw.prize_pool.toLocaleString()}
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <span
                              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(draw.status)}`}
                           >
                              {draw.status.charAt(0).toUpperCase() + draw.status.slice(1)}
                           </span>

                           {draw.status === "open" && (
                              <Button
                                 onClick={() => handleExecuteDraw(draw.id)}
                                 size="sm"
                                 variant="outline"
                                 disabled={
                                    executeDrawMutation.isPending && executingDrawId === draw.id
                                 }
                              >
                                 {executeDrawMutation.isPending && executingDrawId === draw.id
                                    ? "..."
                                    : "Execute Draw"}
                              </Button>
                           )}

                           {draw.status === "closed" && (
                              <Button
                                 onClick={() => handleCompleteDraw(draw.id)}
                                 size="sm"
                                 className="bg-accent hover:bg-accent/90"
                                 disabled={completeDrawMutation.isPending}
                              >
                                 {completeDrawMutation.isPending ? "..." : "Complete"}
                              </Button>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
                  <p className="text-muted-foreground">
                     No draws created yet. Create one above to get started.
                  </p>
               </div>
            )}
         </div>
      </div>
   )
}

const getStatusColor = (status: string) => {
   switch (status) {
      case "open":
         return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
      case "closed":
         return "bg-blue-500/10 text-blue-400 border-blue-500/30"
      case "completed":
         return "bg-green-500/10 text-green-400 border-green-500/30"
      default:
         return "bg-gray-500/10 text-gray-400 border-gray-500/30"
   }
}
