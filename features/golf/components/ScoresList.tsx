"use client"

import { useState } from "react"
import type { GolfScore } from "@/lib/supabase/data-actions"
import { Button } from "@/components/ui/button"

interface ScoresListProps {
   scores: GolfScore[]
   onDelete: (id: string) => Promise<void>
   loading?: boolean
}

export const ScoresList = ({ scores, onDelete, loading = false }: ScoresListProps) => {
   const [deletingId, setDeletingId] = useState<string | null>(null)

   const handleDelete = async (id: string) => {
      setDeletingId(id)
      try {
         await onDelete(id)
      } finally {
         setDeletingId(null)
      }
   }

   if (loading) {
      return (
         <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
               <div key={i} className="h-20 bg-secondary/50 rounded-lg animate-pulse" />
            ))}
         </div>
      )
   }

   if (scores.length === 0) {
      return (
         <div className="text-center py-12">
            <p className="text-muted-foreground font-normal-weight mb-4">No scores recorded yet</p>
            <p className="text-sm text-muted-foreground font-normal-weight">
               Log your first score to get started
            </p>
         </div>
      )
   }

   return (
      <div className="space-y-3">
         {scores.map(score => (
            <div
               key={score.id}
               className="p-4 border border-border rounded-lg hover:border-accent hover:bg-secondary/30 smooth-transition flex items-center justify-between group"
            >
               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                     <div className="text-2xl font-heavy text-accent">{score.stableford_score}</div>
                     <div>
                        <p className="font-heavy text-foreground">{score.course_name}</p>
                        <p className="text-xs text-muted-foreground font-normal-weight">
                           {new Date(score.score_date).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
                  {score.notes && (
                     <p className="text-sm text-muted-foreground font-normal-weight">
                        {score.notes}
                     </p>
                  )}
               </div>

               <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(score.id)}
                  disabled={deletingId === score.id}
                  className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 smooth-transition"
               >
                  {deletingId === score.id ? "Deleting..." : "Delete"}
               </Button>
            </div>
         ))}
      </div>
   )
}
