"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useProfile, useDraws, useUserParticipations } from "@/features"
import { Button } from "@/components/ui/button"
import { ParticipateModal } from "@/features/draws/components/ParticipateModal"
import { UpgradeModal } from "@/features/payments/components/UpgradeModal"

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

   const openDraw = draws?.find(d => d.status === "open")
   const isParticipating = openDraw
      ? participations?.some((p: any) => p.draw_id === openDraw.id && p.status === "active")
      : false

   const handleParticipateClick = () => {
      if (!user) {
         router.push("/auth/sign-in?redirect=/dashboard")
         return
      }

      if (!isEligible) {
         setUpgradeOpen(true)
         return
      }

      if (openDraw) {
         setSelectedDraw({
            id: openDraw.id,
            title: `${MONTHS[openDraw.month - 1]} ${openDraw.year}`,
            prizePool: openDraw.prize_pool,
         })
         setParticipateOpen(true)
      }
   }

   const handleUpgradeSuccess = () => {
      setUpgradeOpen(false)
      if (openDraw) {
         setParticipateOpen(true)
      }
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

   const prizes = openDraw
      ? [
           {
              position: "1st Place",
              prize: `₹${(Number(openDraw.prize_pool) * (openDraw.first_place_pct || 0.4)).toLocaleString()}`,
              distribution: "40%",
           },
           {
              position: "2nd Place",
              prize: `₹${(Number(openDraw.prize_pool) * (openDraw.second_place_pct || 0.35)).toLocaleString()}`,
              distribution: "35%",
           },
           {
              position: "3rd Place",
              prize: `₹${(Number(openDraw.prize_pool) * (openDraw.third_place_pct || 0.25)).toLocaleString()}`,
              distribution: "25%",
           },
        ]
      : [
           { position: "1st Place", prize: "₹4,000", distribution: "40%" },
           { position: "2nd Place", prize: "₹3,500", distribution: "35%" },
           { position: "3rd Place", prize: "₹2,500", distribution: "25%" },
        ]

   const drawTitle = openDraw ? `${MONTHS[openDraw.month - 1]} ${openDraw.year}` : "Monthly Draw"

   return (
      <div className="mt-12 p-8 border border-border rounded-lg bg-secondary/20">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-heavy text-foreground">{drawTitle}</h2>
            {openDraw && (
               <Button
                  variant={isParticipating ? "outline" : "default"}
                  onClick={handleParticipateClick}
                  className={
                     isParticipating
                        ? "border-green-500 text-green-500"
                        : "bg-accent hover:bg-accent/90"
                  }
               >
                  {isParticipating
                     ? "✓ Participating"
                     : isEligible
                       ? "Participate"
                       : "Upgrade to Participate"}
               </Button>
            )}
         </div>

         <div className="grid md:grid-cols-3 gap-6">
            {prizes.map((draw, i) => (
               <div
                  key={i}
                  className="p-6 border border-border rounded-lg bg-card hover:border-accent smooth-transition"
               >
                  <p className="text-sm text-muted-foreground font-normal-weight mb-2">
                     {draw.position}
                  </p>
                  <p className="text-3xl font-heavy text-accent mb-2">{draw.prize}</p>
                  <p className="text-xs text-muted-foreground font-normal-weight">
                     {draw.distribution} of pool
                  </p>
               </div>
            ))}
         </div>

         {openDraw && (
            <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
               {isParticipating ? (
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
         )}

         {!openDraw && (
            <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
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
