"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useUserDrawResults } from "@/features"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WinnerClaimModal } from "@/features/draws/components/WinnerClaimModal"
import { IconTrophy, IconUpload, IconCheck, IconMedal } from "@tabler/icons-react"

export function WinnerNotification() {
   const { user, loading: authLoading } = useAuth()
   const { data: drawResults, isLoading } = useUserDrawResults()
   const [claimModalOpen, setClaimModalOpen] = useState(false)
   const [pendingClaim, setPendingClaim] = useState<any>(null)

   if (authLoading || isLoading || !drawResults) {
      return (
         <div className="p-6 border border-border rounded-lg bg-card/50 flex items-center flex-col justify-center gap-2">
            {[1, 2, 3].map(i => (
               <div key={i} className="h-18 bg-neutral-500/10 rounded-lg border-2 w-full"></div>
            ))}
         </div>
      )
   }

   const pendingWinners =
      drawResults?.filter((r: any) => r.status === "pending_verification" && !r.claimed_at) || []
   const verifiedWinners = drawResults?.filter((r: any) => r.status === "verified") || []

   if (verifiedWinners.length === 0 && pendingWinners.length === 0) {
      return (
         <div className="p-6 border border-border rounded-lg bg-card/50">
            <div className="flex items-center gap-3">
               <IconTrophy className="w-6 h-6 text-muted-foreground" />
               <div>
                  <h2 className="text-xl font-bold">Your Wins</h2>
                  <p className="text-sm text-muted-foreground">
                     No wins yet. Participate in draws to win!
                  </p>
               </div>
            </div>
         </div>
      )
   }

   return (
      <>
         <div className="p-6 border rounded-lg">
            <div className="flex items-center gap-3 mb-4">
               <IconTrophy className="w-6 h-6 text-accent" />
               <h2 className="text-xl font-bold">Your Wins</h2>
               {pendingWinners.length > 0 && (
                  <Badge className="bg-yellow-500 text-white">
                     {pendingWinners.length} pending
                  </Badge>
               )}
            </div>

            <div className="space-y-3">
               {verifiedWinners.map((win: any) => (
                  <div
                     key={win.id}
                     className="flex items-center justify-between p-4 bg-card rounded-lg border border-green-500/30"
                  >
                     <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20">
                           {win.position === 1 ? (
                              <IconMedal className="w-5 h-5 text-yellow-400/10" />
                           ) : win.position === 2 ? (
                              <IconMedal className="w-5 h-5 text-gray-400" />
                           ) : (
                              <IconMedal className="w-5 h-5 text-orange-400" />
                           )}
                        </div>
                        <div>
                           <p className="font-semibold">
                              {win.position === 1
                                 ? "1st Place"
                                 : win.position === 2
                                   ? "2nd Place"
                                   : "3rd Place"}
                           </p>
                           <p className="text-xs text-muted-foreground">
                              {win.draws?.month && win.draws?.year
                                 ? `${getMonthName(win.draws.month)} ${win.draws.year}`
                                 : "Monthly Draw"}
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-bold text-accent">
                           ₹{Number(win.prize_amount || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                           <IconCheck className="w-3 h-3" /> Verified
                        </p>
                     </div>
                  </div>
               ))}

               {pendingWinners.map((win: any) => (
                  <div
                     key={win.id}
                     className="flex items-center justify-between p-4 bg-card border border-accent/30 rounded-lg"
                  >
                     <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20">
                           {win.position === 1 ? (
                              <IconMedal className="w-5 h-5 text-yellow-400" />
                           ) : win.position === 2 ? (
                              <IconMedal className="w-5 h-5 text-gray-400" />
                           ) : (
                              <IconMedal className="w-5 h-5 text-orange-400" />
                           )}
                        </div>
                        <div>
                           <p className="font-semibold">
                              {win.position === 1
                                 ? "1st Place"
                                 : win.position === 2
                                   ? "2nd Place"
                                   : "3rd Place"}
                           </p>
                           {win.claimed_at ? (
                              <p className="text-xs text-blue-500 flex items-center gap-1">
                                 <IconCheck className="w-3 h-3" /> Proof Submitted
                              </p>
                           ) : (
                              <p className="text-xs text-yellow-500 flex items-center gap-1">
                                 <IconUpload className="w-3 h-3" /> Awaiting Proof
                              </p>
                           )}
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-bold text-accent">
                           ₹{Number(win.prize_amount || 0).toLocaleString()}
                        </p>
                        {win.claimed_at ? (
                           <p className="text-xs text-muted-foreground mt-1">Under review</p>
                        ) : (
                           <Button
                              size="sm"
                              className="mt-1 bg-yellow-500 hover:bg-yellow-600"
                              onClick={() => {
                                 setPendingClaim(win)
                                 setClaimModalOpen(true)
                              }}
                           >
                              Upload Proof
                           </Button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <WinnerClaimModal
            open={claimModalOpen}
            onOpenChange={setClaimModalOpen}
            drawResult={pendingClaim}
         />
      </>
   )
}

function getMonthName(month: number): string {
   const months = [
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
   return months[month - 1] || ""
}
