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
import { Input } from "@/components/ui/input"
import { useClaimPrize } from "../hooks/useDrawParticipation"

interface WinnerClaimModalProps {
   open: boolean
   onOpenChange: (open: boolean) => void
   drawResult: {
      id: string
      position: number
      prize_amount: number
      draws?: { month: number; year: number }
   } | null
}

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

export function WinnerClaimModal({ open, onOpenChange, drawResult }: WinnerClaimModalProps) {
   const claimMutation = useClaimPrize()
   const [proofUrl, setProofUrl] = useState("")
   const [photoUrl, setPhotoUrl] = useState("")
   const [submitted, setSubmitted] = useState(false)

   const handleSubmit = async () => {
      if (!drawResult) return

      try {
         await claimMutation.mutateAsync({
            drawResultId: drawResult.id,
            proof_screenshot_url: proofUrl,
            winner_photo_url: photoUrl,
         })
         setSubmitted(true)
      } catch (err) {
         console.error("Failed to submit claim:", err)
      }
   }

   if (!drawResult) return null

   const monthName = MONTHS[(drawResult.draws?.month || 1) - 1]
   const positionSuffix = getOrdinalSuffix(drawResult.position)

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>🎉 Congratulations!</DialogTitle>
               <DialogDescription>
                  You won {positionSuffix} place in {monthName} {drawResult.draws?.year} draw
               </DialogDescription>
            </DialogHeader>

            {submitted ? (
               <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                     <span className="text-3xl">✓</span>
                  </div>
                  <div>
                     <p className="font-semibold text-lg">Submission Received!</p>
                     <p className="text-sm text-muted-foreground mt-1">
                        We&apos;re verifying your submission. You&apos;ll be notified once approved.
                     </p>
                  </div>
                  <Button onClick={() => onOpenChange(false)} className="w-full">
                     Done
                  </Button>
               </div>
            ) : (
               <div className="space-y-4 py-4">
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent">
                     <div className="flex justify-between items-center">
                        <span className="font-medium">Prize Amount</span>
                        <span className="text-2xl font-bold text-accent">
                           ₹{Number(drawResult.prize_amount || 0).toLocaleString()}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div>
                        <label className="text-sm font-medium mb-1 block">
                           📸 Screenshot of your golf scores
                        </label>
                        <Input
                           placeholder="Paste URL to screenshot from golf platform"
                           value={proofUrl}
                           onChange={e => setProofUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                           Take a screenshot of your scores from your golf tracking app
                        </p>
                     </div>

                     <div>
                        <label className="text-sm font-medium mb-1 block">
                           📷 Your photo with golf clubs
                        </label>
                        <Input
                           placeholder="Paste URL to your photo"
                           value={photoUrl}
                           onChange={e => setPhotoUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                           Upload a photo holding your golf clubs for verification
                        </p>
                     </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                     <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                     >
                        Cancel
                     </Button>
                     <Button
                        className="flex-1 bg-accent hover:bg-accent/90"
                        onClick={handleSubmit}
                        disabled={!proofUrl || !photoUrl || claimMutation.isPending}
                     >
                        {claimMutation.isPending ? "Submitting..." : "Submit for Verification"}
                     </Button>
                  </div>
               </div>
            )}
         </DialogContent>
      </Dialog>
   )
}

function getOrdinalSuffix(n: number): string {
   const s = ["th", "st", "nd", "rd"]
   const v = n % 100
   return s[(v - 20) % 10] || s[v] || s[0]
}
