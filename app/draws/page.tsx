"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useProfile, useDraws } from "@/features"
import { DrawCard } from "@/features/draws/components/DrawCard"
import { ParticipateModal } from "@/features/draws/components/ParticipateModal"
import { WinnerClaimModal } from "@/features/draws/components/WinnerClaimModal"
import { UpgradeModal } from "@/features/payments/components/UpgradeModal"
import {
   useUserParticipations,
   useUserDrawResults,
   usePendingClaim,
} from "@/features/draws/hooks/useUserDraws"
import { Button } from "@/components/ui/button"

export default function DrawsPage() {
   const router = useRouter()
   const { user, loading: authLoading } = useAuth()
   const { data: profile, isLoading: profileLoading } = useProfile()
   const { data: draws, isLoading: drawsLoading } = useDraws()
   const { data: participations } = useUserParticipations()
   const { data: drawResults } = useUserDrawResults()
   const pendingClaim = usePendingClaim()

   const [selectedDraw, setSelectedDraw] = useState<{
      id: string
      title: string
      prizePool: number
   } | null>(null)
   const [participateOpen, setParticipateOpen] = useState(false)
   const [upgradeOpen, setUpgradeOpen] = useState(false)
   const [winnerOpen, setWinnerOpen] = useState(false)

   useEffect(() => {
      if (!authLoading && !user) {
         router.push("/auth/sign-in?redirect=/draws")
      }
   }, [authLoading, user, router])

   useEffect(() => {
      if (pendingClaim) {
         setWinnerOpen(true)
      }
   }, [pendingClaim])

   const isEligible =
      profile?.subscription_tier === "premium" || profile?.subscription_tier === "elite"

   const getParticipationStatus = (drawId: string) => {
      return (
         participations?.some((p: any) => p.draw_id === drawId && p.status === "active") ?? false
      )
   }

   if (authLoading || profileLoading || drawsLoading) {
      return (
         <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
         </div>
      )
   }

   if (!user) {
      return null
   }

   const openDraws = draws?.filter(d => d.status === "open") || []
   const closedDraws = draws?.filter(d => d.status !== "open") || []

   return (
      <main className="min-h-screen bg-background py-12 px-6">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
               <h1 className="text-4xl font-bold mb-4">Monthly Draws</h1>
               <p className="text-muted-foreground">
                  Participate in our monthly draws and win exciting prizes while supporting charity
               </p>
            </div>

            {openDraws.length > 0 && (
               <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">Open Draws</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {openDraws.map(draw => (
                        <DrawCard
                           key={draw.id}
                           draw={draw}
                           isParticipating={getParticipationStatus(draw.id)}
                           isEligible={isEligible}
                           onParticipate={drawId => {
                              const d = draws?.find(x => x.id === drawId)
                              setSelectedDraw({
                                 id: drawId,
                                 title: `${getMonthName(draw.month)} ${draw.year}`,
                                 prizePool: draw.prize_pool,
                              })
                              setParticipateOpen(true)
                           }}
                           onLeave={drawId => {
                              console.log("Leave draw:", drawId)
                           }}
                        />
                     ))}
                  </div>
               </section>
            )}

            {openDraws.length === 0 && (
               <div className="text-center py-12 mb-12">
                  <p className="text-muted-foreground">
                     No open draws at the moment. Check back soon!
                  </p>
               </div>
            )}

            {closedDraws.length > 0 && (
               <section>
                  <h2 className="text-2xl font-bold mb-6">Past Draws</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {closedDraws.map(draw => (
                        <DrawCard
                           key={draw.id}
                           draw={draw}
                           isParticipating={getParticipationStatus(draw.id)}
                           isEligible={isEligible}
                           onParticipate={() => {}}
                           onLeave={() => {}}
                        />
                     ))}
                  </div>
               </section>
            )}

            {participations && participations.length > 0 && (
               <section className="mt-12">
                  <h2 className="text-2xl font-bold mb-6">Your Participations</h2>
                  <div className="space-y-3">
                     {participations.map((p: any) => (
                        <div
                           key={p.id}
                           className="flex items-center justify-between p-4 border rounded-lg"
                        >
                           <div>
                              <p className="font-medium">
                                 {getMonthName(p.draws?.month)} {p.draws?.year}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                 {p.draws?.draw_type === "algorithmic"
                                    ? "Score-based"
                                    : "Lucky Draw"}
                              </p>
                           </div>
                           <div className="flex items-center gap-2">
                              {p.status === "active" && (
                                 <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm">
                                    Entered
                                 </span>
                              )}
                              {p.status === "winner" && (
                                 <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm">
                                    Winner!
                                 </span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            )}

            <div className="mt-12 text-center">
               <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                  ← Back to Dashboard
               </Button>
            </div>
         </div>

         <ParticipateModal
            open={participateOpen}
            onOpenChange={setParticipateOpen}
            drawId={selectedDraw?.id || ""}
            drawTitle={selectedDraw?.title || ""}
            prizePool={selectedDraw?.prizePool || 0}
            onUpgradeClick={() => setUpgradeOpen(true)}
         />

         <UpgradeModal
            open={upgradeOpen}
            onOpenChange={setUpgradeOpen}
            onSuccess={() => {
               setParticipateOpen(true)
            }}
            currentCharityId={profile?.preferred_charity_id}
         />

         <WinnerClaimModal
            open={winnerOpen}
            onOpenChange={setWinnerOpen}
            drawResult={pendingClaim || null}
         />
      </main>
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
