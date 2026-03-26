"use client"

import { useState } from "react"
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features"
import { useParticipateInDraw, useLeaveDraw } from "../hooks/useDrawParticipation"
import { useRouter } from "next/navigation"
import { IconTarget } from "@tabler/icons-react"
import { fromPromise } from "neverthrow"

interface ParticipateModalProps {
   open: boolean
   onOpenChange: (open: boolean) => void
   drawId: string
   drawTitle: string
   prizePool: number
   onUpgradeClick: () => void
}

export function ParticipateModal({
   open,
   onOpenChange,
   drawId,
   drawTitle,
   prizePool,
   onUpgradeClick,
}: ParticipateModalProps) {
   const { user } = useAuth()
   const router = useRouter()
   const participateMutation = useParticipateInDraw()
   const leaveMutation = useLeaveDraw()
   const [error, setError] = useState<string | null>(null)

   const handleParticipate = async () => {
      if (!user) {
         router.push("/auth/sign-in?redirect=/draws")
         return
      }

      setError(null)

      const mutationRes = await fromPromise(participateMutation.mutateAsync(drawId), err => err)
      if (mutationRes.isErr()) {
         const err = mutationRes.error as Error
         if (err.message === "subscription_required") {
            onOpenChange(false)
            onUpgradeClick()
         } else if (err.message === "subscription_inactive") {
            setError("Your subscription is not active. Please renew.")
         } else if (err.message === "already_participating") {
            setError("You are already participating in this draw")
         } else {
            setError(err.message || "Failed to participate")
         }
         return
      }
      onOpenChange(false)
   }

   const handleLeave = async () => {
      setError(null)
      try {
         await leaveMutation.mutateAsync(drawId)
         onOpenChange(false)
      } catch (err: any) {
         setError(err.message || "Failed to leave draw")
      }
   }

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Participate in Draw</DialogTitle>
               <DialogDescription>
                  {drawTitle} - Prize Pool: ₹{Number(prizePool || 0).toLocaleString()}
               </DialogDescription>
            </DialogHeader>

            {error && (
               <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/50">
                  <p className="text-sm text-destructive">{error}</p>
               </div>
            )}

            <div className="space-y-4 py-4">
               <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                     <IconTarget className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                     <p className="font-medium">Ready to participate?</p>
                     <p className="text-sm text-muted-foreground">
                        Join this draw for a chance to win!
                     </p>
                  </div>
               </div>

               <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                     Cancel
                  </Button>
                  <Button
                     className="flex-1 bg-accent hover:bg-accent/90"
                     onClick={handleParticipate}
                     disabled={participateMutation.isPending}
                  >
                     {participateMutation.isPending ? "Joining..." : "Participate"}
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   )
}
