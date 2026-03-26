"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useProfile, useDraws, useUserParticipations } from "@/features"
import { Button } from "@/components/ui/button"
import { ParticipateModal } from "@/features/draws/components/ParticipateModal"
import { UpgradeModal } from "@/features/payments/components/UpgradeModal"
import { IconCheck } from "@tabler/icons-react"

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

export function DrawSection() {
   const router = useRouter()
   const { user, loading: authLoading } = useAuth()
   const { data: profile } = useProfile()
   const { data: draws } = useDraws()
   const { data: participations } = useUserParticipations()

   const [participateOpen, setParticipateOpen] = useState(false)
   const [upgradeOpen, setUpgradeOpen] = useState(false)
   const [selectedDraw, setSelectedDraw] = useState<{
      id: string
      title: string
      prizePool: number
   } | null>(null)

   const isEligible =
      profile?.subscription_tier === "premium" || profile?.subscription_tier === "elite"

   const openDraws = draws?.filter(d => d.status === "open") || []

   const isParticipating = (drawId: string) =>
      participations?.some((p: any) => p.draw_id === drawId && p.status === "active")

   const handleParticipateClick = (
      drawId: string,
      month: number,
      year: number,
      prizePool: number
   ) => {
      if (!user) {
         router.push("/auth/sign-in?redirect=/dashboard")
         return
      }

      if (!isEligible) {
         setUpgradeOpen(true)
         return
      }

      setSelectedDraw({
         id: drawId,
         title: `${MONTHS[month - 1]} ${year}`,
         prizePool: prizePool,
      })
      setParticipateOpen(true)
   }

   const handleUpgradeSuccess = () => {
      setUpgradeOpen(false)
   }

   if (authLoading || !draws) {
      return (
         <div className="mt-12 p-8 border border-border rounded-lg bg-secondary/20">
            <div className="animate-pulse">
               <div className="h-8 bg-secondary rounded w-48 mb-4"></div>
               <div className="grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                     <div key={i} className="h-32 bg-secondary rounded-lg"></div>
                  ))}
               </div>
            </div>
         </div>
      )
   }

   const renderDrawCard = (draw: any) => {
      const participating = isParticipating(draw.id)
      const prizes = [
         {
            position: "1st Place",
            prize: `₹${(Number(draw.prize_pool) * (draw.first_place_pct || 0.4)).toLocaleString()}`,
            distribution: "40%",
         },
         {
            position: "2nd Place",
            prize: `₹${(Number(draw.prize_pool) * (draw.second_place_pct || 0.35)).toLocaleString()}`,
            distribution: "35%",
         },
         {
            position: "3rd Place",
            prize: `₹${(Number(draw.prize_pool) * (draw.third_place_pct || 0.25)).toLocaleString()}`,
            distribution: "25%",
         },
      ]
      const drawTitle = `${MONTHS[draw.month - 1]} ${draw.year}`

      return (
         <div key={draw.id} className="p-8 border border-border rounded-lg bg-secondary/20">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-2xl font-heavy text-foreground">{drawTitle}</h2>
               <Button
                  variant={participating ? "outline" : "default"}
                  onClick={() =>
                     handleParticipateClick(draw.id, draw.month, draw.year, draw.prize_pool)
                  }
                  className={
                     participating
                        ? "border-green-500 text-green-500"
                        : "bg-accent hover:bg-accent/90"
                  }
               >
                  {participating ? (
                     <span className="flex items-center gap-1">
                        <IconCheck className="w-4 h-4" /> Participating
                     </span>
                  ) : isEligible ? (
                     "Participate"
                  ) : (
                     "Upgrade to Participate"
                  )}
               </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               {prizes.map((prize, i) => (
                  <div
                     key={i}
                     className="p-6 border border-border rounded-lg bg-card hover:border-accent smooth-transition"
                  >
                     <p className="text-sm text-muted-foreground font-normal-weight mb-2">
                        {prize.position}
                     </p>
                     <p className="text-3xl font-heavy text-accent mb-2">{prize.prize}</p>
                     <p className="text-xs text-muted-foreground font-normal-weight">
                        {prize.distribution} of pool
                     </p>
                  </div>
               ))}
            </div>

            <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
               {participating ? (
                  <p className="text-sm font-normal-weight text-foreground">
                     <span className="font-heavy">You&apos;re in!</span> Good luck! Winners will be
                     notified after the draw is executed.
                  </p>
               ) : isEligible ? (
                  <p className="text-sm font-normal-weight text-foreground">
                     <span className="font-heavy">Draw is open!</span> Click the button above to
                     participate and win exciting prizes!
                  </p>
               ) : (
                  <p className="text-sm font-normal-weight text-foreground">
                     <span className="font-heavy">Upgrade to Premium or Elite</span> to participate
                     in monthly draws and support charity!
                  </p>
               )}
            </div>
         </div>
      )
   }

   return (
      <div className="space-y-8">
         {openDraws.length > 0 ? (
            openDraws.map(draw => renderDrawCard(draw))
         ) : (
            <div className="mt-12 p-8 border border-border rounded-lg bg-secondary/20">
               <div className="p-4 bg-muted/50 border border-border rounded-lg">
                  <p className="text-sm font-normal-weight text-muted-foreground">
                     No open draws at the moment. Check back soon or view past draws below.
                  </p>
                  <Button
                     variant="link"
                     className="px-0 h-auto p-0 mt-2 text-accent"
                     onClick={() => router.push("/draws")}
                  >
                     View All Draws →
                  </Button>
               </div>
            </div>
         )}

         <ParticipateModal
            open={participateOpen}
            onOpenChange={setParticipateOpen}
            drawId={selectedDraw?.id || ""}
            drawTitle={selectedDraw?.title || ""}
            prizePool={selectedDraw?.prizePool || 0}
            onUpgradeClick={() => {
               setParticipateOpen(false)
               setUpgradeOpen(true)
            }}
         />

         <UpgradeModal
            open={upgradeOpen}
            onOpenChange={setUpgradeOpen}
            onSuccess={handleUpgradeSuccess}
            currentCharityId={profile?.preferred_charity_id}
         />
      </div>
   )
}
