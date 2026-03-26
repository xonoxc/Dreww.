"use client"

import { useState } from "react"
import { usePendingVerifications, useVerifyWinner } from "../hooks/useDrawerManagement"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fromPromise } from "neverthrow"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IconCheck, IconX, IconCamera, IconUser, IconMedal } from "@tabler/icons-react"

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
            <h3 className="text-xl font-bold tracking-tight text-zinc-100">Winner Verification</h3>
            <p className="text-sm text-zinc-400 mt-1">
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
               <DialogTitle className="font-mono">Proof for {winner.winner_email}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
               {winner.proof_screenshot_url && (
                  <div>
                     <p className="font-medium mb-2 flex items-center gap-2 text-sm text-zinc-300">
                        <IconCamera className="w-4 h-4" /> Score Screenshot
                     </p>
                     <img
                        src={winner.proof_screenshot_url}
                        alt="Score proof"
                        className="w-full rounded-lg border border-border max-h-64 object-contain bg-zinc-950/50"
                     />
                  </div>
               )}
               {winner.winner_photo_url && (
                  <div>
                     <p className="font-medium mb-2 flex items-center gap-2 text-sm text-zinc-300">
                        <IconUser className="w-4 h-4" /> Winner Photo
                     </p>
                     <img
                        src={winner.winner_photo_url}
                        alt="Winner photo"
                        className="w-full rounded-lg border border-border max-h-64 object-contain bg-zinc-950/50"
                     />
                  </div>
               )}
               {!winner.proof_screenshot_url && !winner.winner_photo_url && (
                  <p className="text-zinc-500 col-span-2 py-8 text-center bg-zinc-900/30 rounded-lg border border-dashed border-border">
                     No proof submitted yet.
                  </p>
               )}
            </div>
            {winner.status === "pending_verification" && winner.claimed_at && (
               <div className="flex gap-3 pt-4 border-t border-border mt-4">
                  {winner.proof_screenshot_url || winner.winner_photo_url ? (
                     <>
                        <Button
                           onClick={() => {
                              onApprove(winner.id)
                              onOpenChange()
                           }}
                           disabled={verifyingId === winner.id || isVerifying}
                           className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
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
                           className="flex-1 bg-red-950/50 hover:bg-red-900 text-red-500 border-none"
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
   if (amount >= 500) return "text-yellow-400 border-yellow-400/30 bg-yellow-400/5"
   if (amount >= 300) return "text-zinc-300 border-zinc-500/30 bg-zinc-500/5"
   return "text-orange-500 border-orange-500/30 bg-orange-500/5"
}

function EmptyState() {
   return (
      <div className="rounded-lg border border-border bg-card/50 p-12 text-center flex flex-col items-center justify-center gap-2">
         <IconMedal className="w-12 h-12 text-muted-foreground/30 mb-2" stroke={1.5} />
         <h4 className="font-semibold text-lg text-zinc-200">No pending verifications</h4>
         <p className="text-zinc-500 text-sm">All winners have been successfully verified!</p>
      </div>
   )
}

function LoadingState() {
   return (
      <div className="space-y-4">
         {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg border border-border bg-card/30" />
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
      <div className="space-y-8">
         {pending.length > 0 && (
            <div>
               <h4 className="font-semibold text-yellow-500 mb-4 tracking-wide">
                  Pending Verification ({pending.length})
               </h4>
               <div className="space-y-4">
                  {pending.map((winner: any) => (
                     <div
                        key={winner.id}
                        className="flex flex-col gap-4 rounded-lg border border-yellow-500/20 bg-[#161616]/80 p-4 transition-colors hover:bg-[#161616]"
                     >
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div
                                 className={`flex items-center justify-center w-12 h-12 rounded-full border ${
                                    winner.position === 1
                                       ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                                       : winner.position === 2
                                         ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                                         : "border-orange-500/30 bg-orange-500/10 text-orange-500"
                                 }`}
                              >
                                 <IconMedal className="w-6 h-6" stroke={1.5} />
                              </div>
                              <div className="flex flex-col">
                                 <h5 className="font-mono font-bold text-base text-zinc-100 mb-0.5">
                                    {
                                       POSITION_LABELS[
                                          winner.position as keyof typeof POSITION_LABELS
                                       ]
                                    }
                                 </h5>
                                 <p className="font-mono text-sm text-zinc-400">
                                    {winner.winner_email}
                                 </p>
                              </div>
                           </div>

                           <div className="flex items-center gap-6">
                              <div
                                 className={`font-mono font-bold border px-2.5 py-1 rounded text-base tracking-wider ${getPrizeColor(winner.prize_amount)}`}
                              >
                                 ₹{winner.prize_amount.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-2">
                                 <Button
                                    onClick={() => handleApprove(winner.id)}
                                    disabled={
                                       verifyingId === winner.id || verifyWinnerMutation.isPending
                                    }
                                    className="bg-emerald-950 hover:bg-emerald-900 text-emerald-500 border-none shadow-none h-9 px-4"
                                 >
                                    {verifyingId === winner.id ? (
                                       "..."
                                    ) : (
                                       <>
                                          <IconCheck className="w-4 h-4 mr-2" /> Approve
                                       </>
                                    )}
                                 </Button>
                                 <Button
                                    onClick={() => handleReject(winner.id)}
                                    disabled={
                                       verifyingId === winner.id || verifyWinnerMutation.isPending
                                    }
                                    className="bg-red-950 hover:bg-red-900 text-red-500 border-none shadow-none h-9 px-4"
                                 >
                                    {verifyingId === winner.id ? (
                                       "..."
                                    ) : (
                                       <>
                                          <IconX className="w-4 h-4 mr-2" /> Reject
                                       </>
                                    )}
                                 </Button>
                              </div>
                           </div>
                        </div>

                        <div className="mt-1">
                           {winner.claimed_at && winner.proof_screenshot_url && (
                              <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => onViewProof(winner)}
                                 className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white font-mono h-8"
                              >
                                 <IconCamera className="w-4 h-4 mr-2" />
                                 View Proof
                              </Button>
                           )}
                           {winner.claimed_at && !winner.proof_screenshot_url && (
                              <p className="font-mono text-sm text-yellow-500">
                                 Proof submitted but images not found
                              </p>
                           )}
                           {!winner.claimed_at && (
                              <p className="font-mono text-sm text-zinc-400">
                                 Waiting for winner to submit proof
                              </p>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {verified.length > 0 && (
            <div>
               <h4 className="font-semibold text-emerald-500 mb-4 tracking-wide">
                  Verified ({verified.length})
               </h4>
               <div className="space-y-4">
                  {verified.map((winner: any) => (
                     <div
                        key={winner.id}
                        className="flex flex-col gap-4 rounded-lg border border-emerald-500/20 bg-[#161616]/80 p-4 transition-colors hover:bg-[#161616]"
                     >
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div
                                 className={`flex items-center justify-center w-12 h-12 rounded-full border ${
                                    winner.position === 1
                                       ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                                       : winner.position === 2
                                         ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                                         : "border-orange-500/30 bg-orange-500/10 text-orange-500"
                                 }`}
                              >
                                 <IconMedal className="w-6 h-6" stroke={1.5} />
                              </div>
                              <div className="flex flex-col">
                                 <h5 className="font-mono font-bold text-base text-zinc-100 mb-0.5">
                                    {
                                       POSITION_LABELS[
                                          winner.position as keyof typeof POSITION_LABELS
                                       ]
                                    }
                                 </h5>
                                 <p className="font-mono text-sm text-zinc-400">
                                    {winner.winner_email}
                                 </p>
                              </div>
                           </div>

                           <div className="flex items-center gap-6 pr-2">
                              <div className="flex flex-col items-end gap-1.5">
                                 <div
                                    className={`font-mono font-bold border px-2.5 py-1 rounded text-base tracking-wider ${getPrizeColor(winner.prize_amount)}`}
                                 >
                                    ₹{winner.prize_amount.toLocaleString()}
                                 </div>
                                 <p className="font-mono text-xs text-emerald-500 flex items-center gap-1">
                                    <IconCheck className="w-3.5 h-3.5" /> Verified
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
