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
import { toast } from "sonner"

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

/** Turns a raw error (Supabase object or Error) into a readable string. */
function parseError(err: unknown): string {
   if (!err) return "An unexpected error occurred"
   if (typeof err === "object" && err !== null) {
      const e = err as Record<string, unknown>
      // Supabase postgres error — unique constraint violation
      if (e.code === "23505") {
         return `A draw for ${MONTHS[new Date().getMonth()]} already exists. Choose a different month/year.`
      }
      if (typeof e.message === "string") return e.message
   }
   if (err instanceof Error) return err.message
   return String(err)
}

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

   const handleCreateDraw = async () => {
      const toastId = toast.loading("Creating draw…")
      const result = await fromPromise(
         createDrawMutation.mutateAsync({
            month: MONTHS[selectedMonth],
            year: selectedYear,
            drawType: selectedType,
            prizePool,
         }),
         err => err
      )

      if (result.isErr()) {
         toast.error(parseError(result.error), { id: toastId })
      } else {
         toast.success(`Draw for ${MONTHS[selectedMonth]} ${selectedYear} created!`, {
            id: toastId,
         })
      }
   }

   const handleExecuteDraw = async (drawId: string) => {
      setExecutingDrawId(drawId)
      const toastId = toast.loading("Executing draw…")
      const result = await fromPromise(executeDrawMutation.mutateAsync(drawId), err => err)

      if (result.isErr()) {
         toast.error(parseError(result.error), { id: toastId })
      } else {
         toast.success("Draw executed — winners selected!", { id: toastId })
      }
      setExecutingDrawId(null)
   }

   const handleCompleteDraw = async (drawId: string) => {
      const toastId = toast.loading("Completing draw…")
      const result = await fromPromise(completeDrawMutation.mutateAsync(drawId), err => err)

      if (result.isErr()) {
         toast.error(parseError(result.error), { id: toastId })
      } else {
         toast.success("Draw marked as completed!", { id: toastId })
      }
   }

   return (
      <div className="space-y-6">
         <div>
            <h3 className="text-xl font-bold tracking-tight">Monthly Draws Management</h3>
            <p className="text-sm text-muted-foreground">Create and manage monthly prize draws</p>
         </div>

         {/* Create New Draw */}
         <div className="rounded-lg border border-border bg-card p-6">
            <h4 className="font-bold mb-4">Create New Draw</h4>

            <div className="grid gap-4 md:grid-cols-5">
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

               <div>
                  <label className="block text-sm font-medium mb-2">Prize Pool (₹)</label>
                  <input
                     type="number"
                     value={prizePool}
                     onChange={e => setPrizePool(parseInt(e.target.value) || 0)}
                     className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
               </div>

               <div className="flex items-end">
                  <Button
                     onClick={handleCreateDraw}
                     disabled={createDrawMutation.isPending}
                     className="w-full bg-accent hover:bg-accent/90"
                  >
                     {createDrawMutation.isPending ? "Creating…" : "Create Draw"}
                  </Button>
               </div>
            </div>
         </div>

         {/* Draws List */}
         <div className="space-y-3">
            <h4 className="font-bold">Active &amp; Recent Draws</h4>

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
                                    {draw.eligible_users_count} participants • ₹
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
                                    ? "Running…"
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
                                 {completeDrawMutation.isPending ? "…" : "Complete"}
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
