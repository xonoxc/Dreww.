"use client"

import { useState, useEffect } from "react"
import { usePendingVerifications, useVerifyWinner } from "../hooks/useDrawerManagement"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fromPromise } from "neverthrow"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IconCheck, IconX, IconCamera, IconUser, IconMedal } from "@tabler/icons-react"
import { useDrawStatsStore } from "@/lib/stores/drawStatsStore"

const POSITION_LABELS = {
   1: "1st Place",
   2: "2nd Place",
   3: "3rd Place",
}

export function WinnerVerification() {
   const { data: pendingWinners = [], isLoading: loading } = usePendingVerifications()
   const verifyWinnerMutation = useVerifyWinner()
   const [verifyingId, setVerifyingId] = useState<string | null>(null)
   const [viewProofFor, setViewProofFor] = useState<any>(null)

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
               onViewProof={setViewProofFor}
            />
         ) : (
            <EmptyState />
         )}

         {viewProofFor && (
            <ProofDialog
               winner={viewProofFor}
               open={!!viewProofFor}
               onOpenChange={() => setViewProofFor(null)}
               onApprove={handleApprove}
               onReject={handleReject}
               verifyingId={verifyingId}
               isVerifying={verifyWinnerMutation.isPending}
            />
         )}
      </div>
   )
}

function ProofDialog({
   winner,
   open,
   onOpenChange,
   onApprove,
   onReject,
   verifyingId,
   isVerifying,
}: {
   winner: any
   open: boolean
   onOpenChange: () => void
   onApprove: (id: string) => void
   onReject: (id: string) => void
   verifyingId: string | null
   isVerifying: boolean
}) {
   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle>Proof for {winner.winner_email}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
               {winner.proof_screenshot_url && (
                  <div>
                     <p className="font-medium mb-2 flex items-center gap-2">
                        <IconCamera className="w-4 h-4" /> Score Screenshot
                     </p>
                     <img
                        src={winner.proof_screenshot_url}
                        alt="Score proof"
                        className="w-full rounded-lg border max-h-64 object-contain"
                     />
                  </div>
               )}
               {winner.winner_photo_url && (
                  <div>
                     <p className="font-medium mb-2 flex items-center gap-2">
                        <IconUser className="w-4 h-4" /> Winner Photo
                     </p>
                     <img
                        src={winner.winner_photo_url}
                        alt="Winner photo"
                        className="w-full rounded-lg border max-h-64 object-contain"
                     />
                  </div>
               )}
               {!winner.proof_screenshot_url && !winner.winner_photo_url && (
                  <p className="text-muted-foreground col-span-2">No proof submitted yet.</p>
               )}
            </div>
            {winner.status === "pending_verification" && winner.claimed_at && (
               <div className="flex gap-3 pt-4 border-t">
                  {winner.proof_screenshot_url || winner.winner_photo_url ? (
                     <>
                        <Button
                           onClick={() => {
                              onApprove(winner.id)
                              onOpenChange()
                           }}
                           disabled={verifyingId === winner.id || isVerifying}
                           className="flex-1 bg-green-500 hover:bg-green-600"
                        >
                           <IconCheck className="w-4 h-4 mr-2" />
                           Approve
                        </Button>
                        <Button
                           onClick={() => {
                              onReject(winner.id)
                              onOpenChange()
                           }}
                           disabled={verifyingId === winner.id || isVerifying}
                           variant="outline"
                           className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                           <IconX className="w-4 h-4 mr-2" />
                           Reject
                        </Button>
                     </>
                  ) : (
                     <div className="text-sm text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded w-full text-center">
                        Awaiting user to upload proof
                     </div>
                  )}
               </div>
            )}
         </DialogContent>
      </Dialog>
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
   onViewProof,
}: {
   pendingWinners: any[]
   handleApprove: (id: string) => void
   handleReject: (id: string) => void
   verifyingId: string | null
   verifyWinnerMutation: ReturnType<typeof useVerifyWinner>
   onViewProof: (winner: any) => void
}) {
   const pending = pendingWinners.filter((w: any) => w.status === "pending_verification")
   const verified = pendingWinners.filter((w: any) => w.status === "verified")

   return (
      <div className="space-y-6">
         {pending.length > 0 && (
            <div>
               <h4 className="font-semibold text-yellow-400 mb-3">
                  Pending Verification ({pending.length})
               </h4>
               <div className="space-y-3">
                  {pending.map((winner: any) => (
                     <div
                        key={winner.id}
                        className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-card/50 p-4"
                     >
                        <div className="flex-1">
                           <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                                 <IconMedal
                                    className="w-6 h-6"
                                    stroke={1.5}
                                    color={
                                       winner.position === 1
                                          ? "#fbbf24"
                                          : winner.position === 2
                                            ? "#9ca3af"
                                            : "#d97706"
                                    }
                                 />
                              </div>
                              <div className="flex-1">
                                 <h5 className="font-bold">
                                    {
                                       POSITION_LABELS[
                                          winner.position as keyof typeof POSITION_LABELS
                                       ]
                                    }
                                 </h5>
                                 <p className="text-sm text-muted-foreground">
                                    {winner.winner_email}
                                 </p>
                              </div>
                              <div className="text-right flex items-center justify-center border-2">
                                 <p
                                    className={`text-lg font-bold ${getPrizeColor(winner.prize_amount)}`}
                                 >
                                    ₹{winner.prize_amount.toLocaleString()}
                                 </p>
                              </div>
                           </div>
                           {winner.claimed_at && winner.proof_screenshot_url && (
                              <div className="mt-2 flex gap-2">
                                 <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onViewProof(winner)}
                                 >
                                    <IconCamera className="w-4 h-4 mr-1" />
                                    View Proof
                                 </Button>
                              </div>
                           )}
                           {winner.claimed_at && !winner.proof_screenshot_url && (
                              <div className="mt-2 text-xs text-yellow-500">
                                 Proof submitted but images not found
                              </div>
                           )}
                           {!winner.claimed_at && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                 Waiting for winner to submit proof
                              </div>
                           )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                           <Button
                              onClick={() => handleApprove(winner.id)}
                              disabled={verifyingId === winner.id || verifyWinnerMutation.isPending}
                              size="sm"
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                              variant="outline"
                           >
                              {verifyingId === winner.id ? (
                                 "..."
                              ) : (
                                 <>
                                    <IconCheck className="w-4 h-4 mr-1" /> Approve
                                 </>
                              )}
                           </Button>
                           <Button
                              onClick={() => handleReject(winner.id)}
                              disabled={verifyingId === winner.id || verifyWinnerMutation.isPending}
                              size="sm"
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                              variant="outline"
                           >
                              {verifyingId === winner.id ? (
                                 "..."
                              ) : (
                                 <>
                                    <IconX className="w-4 h-4 mr-1" /> Reject
                                 </>
                              )}
                           </Button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {verified.length > 0 && (
            <div>
               <h4 className="font-semibold text-green-400 mb-3">Verified ({verified.length})</h4>
               <div className="space-y-3">
                  {verified.map((winner: any) => (
                     <div
                        key={winner.id}
                        className="flex items-center justify-between rounded-lg border border-green-500/30 bg-card/50 p-4"
                     >
                        <div className="flex-1">
                           <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30">
                                 <IconMedal
                                    className="w-6 h-6"
                                    stroke={1.5}
                                    color={
                                       winner.position === 1
                                          ? "#fbbf24"
                                          : winner.position === 2
                                            ? "#9ca3af"
                                            : "#d97706"
                                    }
                                 />
                              </div>
                              <div className="flex-1">
                                 <h5 className="font-bold">
                                    {
                                       POSITION_LABELS[
                                          winner.position as keyof typeof POSITION_LABELS
                                       ]
                                    }
                                 </h5>
                                 <p className="text-sm text-muted-foreground">
                                    {winner.winner_email}
                                 </p>
                              </div>
                              <div className="text-right">
                                 <p
                                    className={`text-lg font-bold ${getPrizeColor(winner.prize_amount)}`}
                                 >
                                    ₹{winner.prize_amount.toLocaleString()}
                                 </p>
                                 <p className="text-xs text-green-400 flex items-center gap-1">
                                    <IconCheck className="w-3 h-3" /> Verified
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
   )
}
