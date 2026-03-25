"use client"

import { useState } from "react"
import { usePendingVerifications, useVerifyWinner } from "../hooks/useDrawerManagement"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fromPromise } from "neverthrow"

const POSITION_LABELS = {
   1: "1st Place",
   2: "2nd Place",
   3: "3rd Place",
}

export function WinnerVerification() {
   const { data: pendingWinners = [], isLoading: loading } = usePendingVerifications()
   const verifyWinnerMutation = useVerifyWinner()
   const [verifyingId, setVerifyingId] = useState<string | null>(null)

   const handleApprove = async (winnerId: string) => {
      setVerifyingId(winnerId)
      const verificaitonRes = await fromPromise(
         verifyWinnerMutation.mutateAsync({ resultId: winnerId, approved: true }),
         err => err
      )

      if (verificaitonRes.isErr()) {
         console.error("Verification error:", verificaitonRes.error)
         setVerifyingId(null)
         return
      }
      setVerifyingId(null)
   }

   const handleReject = async (winnerId: string) => {
      setVerifyingId(winnerId)
      const veritificationRes = await fromPromise(
         verifyWinnerMutation.mutateAsync({ resultId: winnerId, approved: false }),
         err => err
      )

      if (veritificationRes.isErr()) {
         console.error("Rejection error:", veritificationRes.error)
         setVerifyingId(null)
         return
      }

      setVerifyingId(null)
   }

   return (
      <div className="space-y-6">
         <div>
            <h3 className="text-xl font-bold tracking-tight">Winner Verification</h3>
            <p className="text-sm text-muted-foreground">
               Review and approve/reject draw winners{" "}
               {pendingWinners.length > 0 && `(${pendingWinners.length})`}
            </p>
         </div>

         {loading ? (
            <LoadingState />
         ) : pendingWinners.length > 0 ? (
            <PendingWinnerList
               verifyWinnerMutation={verifyWinnerMutation}
               verifyingId={verifyingId}
               handleReject={handleReject}
               handleApprove={handleApprove}
               pendingWinners={pendingWinners}
            />
         ) : (
            <EmptyState />
         )}
      </div>
   )
}

const getPrizeColor = (amount: number) => {
   if (amount >= 500) return "text-yellow-400"
   if (amount >= 300) return "text-gray-300"
   return "text-orange-400"
}

function EmptyState() {
   return (
      <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
         <p className="text-muted-foreground">
            No pending verifications. All winners are verified!
         </p>
      </div>
   )
}

function LoadingState() {
   return (
      <div className="space-y-3">
         {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
         ))}
      </div>
   )
}

function PendingWinnerList({
   pendingWinners,
   handleApprove,
   handleReject,
   verifyingId,
   verifyWinnerMutation,
}: {
   pendingWinners: any[]
   handleApprove: (id: string) => void
   handleReject: (id: string) => void
   verifyingId: string | null
   verifyWinnerMutation: ReturnType<typeof useVerifyWinner>
}) {
   return (
      <div className="space-y-3">
         {pendingWinners.map(winner => (
            <div
               key={winner.id}
               className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4 transition-all duration-300 ease-out hover:border-accent hover:bg-card"
            >
               <div className="flex-1">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/30">
                        <span className="font-bold text-accent">
                           {winner.position === 1 ? "🥇" : winner.position === 2 ? "🥈" : "🥉"}
                        </span>
                     </div>
                     <div className="flex-1">
                        <h5 className="font-bold">
                           {POSITION_LABELS[winner.position as keyof typeof POSITION_LABELS]}
                        </h5>
                        <p className="text-sm text-muted-foreground">{winner.winner_email}</p>
                     </div>
                     <div className="text-right">
                        <p className={`text-lg font-bold ${getPrizeColor(winner.prize_amount)}`}>
                           ${winner.prize_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Prize Amount</p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-2 ml-4">
                  <Button
                     onClick={() => handleApprove(winner.id)}
                     disabled={verifyingId === winner.id || verifyWinnerMutation.isPending}
                     size="sm"
                     className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                     variant="outline"
                  >
                     {verifyingId === winner.id ? "..." : "✓ Approve"}
                  </Button>
                  <Button
                     onClick={() => handleReject(winner.id)}
                     disabled={verifyingId === winner.id || verifyWinnerMutation.isPending}
                     size="sm"
                     className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                     variant="outline"
                  >
                     {verifyingId === winner.id ? "..." : "✗ Reject"}
                  </Button>
               </div>
            </div>
         ))}
      </div>
   )
}
