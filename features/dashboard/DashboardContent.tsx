"use client"

import { useProfile } from "@/features/auth/hooks/useProfile"
import {
   useGolfScores,
   useLastFiveScores,
   useAverageScore,
   useAddGolfScore,
   useDeleteGolfScore,
} from "@/features/golf/hooks/useGolfScores"
import { AddScoreForm } from "@/features/golf/components/AddScoreForm"
import { ScoresList } from "@/features/golf/components/ScoresList"
import { useAuth, useUnreadNotificationCount } from "@/features"
import { Navbar, StatCard, DrawSection, CharityImpact, WinnerNotification } from "./components"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { fromPromise } from "neverthrow"
import {
   IconChartBar,
   IconTarget,
   IconTrophy,
   IconStar,
   IconList,
   IconGift,
   IconHeart,
} from "@tabler/icons-react"

export function DashboardContent() {
   const { user, loading: authLoading } = useAuth()
   const { data: profile, isLoading: profileLoading } = useProfile()
   const { data: scores } = useGolfScores()
   const addScoreMutation = useAddGolfScore()
   const deleteScoreMutation = useDeleteGolfScore()
   const unreadCount = useUnreadNotificationCount()

   const lastFiveScores = useLastFiveScores()
   const averageScore = useAverageScore()

   const handleAddScore = async (score: {
      course_name: string
      stableford_score: number
      score_date: string
      course_par?: number
      notes?: string
   }) => {
      if (!user) return
      const result = await fromPromise(
         addScoreMutation.mutateAsync({
            user_id: user.id,
            course_name: score.course_name,
            stableford_score: score.stableford_score,
            score_date: score.score_date,
            course_par: score.course_par ?? null,
            notes: score.notes ?? null,
         }),
         err => err
      )

      if (result.isErr()) {
         console.error("Failed to add score:", result.error)
      }
   }

   const handleDeleteScore = async (scoreId: string) => {
      await deleteScoreMutation.mutateAsync(scoreId)
   }

   if (authLoading) return <AuthLoadingFallback />

   if (!user) return null

   const bestScore =
      scores && scores.length > 0 ? Math.max(...scores.map(s => s.stableford_score)) : 0

   const stats = [
      { label: "Average Score", value: averageScore, icon: IconChartBar },
      { label: "Total Rounds", value: scores?.length ?? 0, icon: IconTarget },
      { label: "Best Score", value: bestScore, icon: IconTrophy },
      { label: "Subscription", value: profile?.subscription_tier || "Free", icon: IconStar },
   ]

   return (
      <main className="min-h-screen bg-background">
         <div className="fixed inset-0 grid-ambient pointer-events-none" />

         <Navbar userName={profile?.full_name} />

         <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
            {/* Stats - Always Visible */}
            <div className="grid md:grid-cols-4 gap-4">
               {stats.map((stat, i) => (
                  <StatCard key={i} {...stat} />
               ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="scores" className="space-y-8">
               <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                  <TabsTrigger value="scores" className="gap-2">
                     <IconList className="w-4 h-4" />
                     Scores
                  </TabsTrigger>
                  <TabsTrigger value="draws" className="gap-2">
                     <IconTrophy className="w-4 h-4" />
                     Draws
                  </TabsTrigger>
                  <TabsTrigger value="winners" className="gap-2">
                     <IconGift className="w-4 h-4" />
                     Wins
                     {unreadCount > 0 && (
                        <Badge className="ml-1 bg-yellow-500 text-white h-5 min-w-5 px-1.5">
                           {unreadCount}
                        </Badge>
                     )}
                  </TabsTrigger>
                  <TabsTrigger value="charity" className="gap-2">
                     <IconHeart className="w-4 h-4" />
                     Charity
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="scores">
                  <div className="grid lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-1">
                        <AddScoreForm
                           onSubmit={handleAddScore}
                           loading={addScoreMutation.isPending}
                        />
                     </div>

                     <div className="lg:col-span-2">
                        <div className="space-y-4">
                           <div>
                              <h2 className="text-2xl font-heavy text-foreground mb-2">
                                 Recent Scores
                              </h2>
                              <p className="text-sm text-muted-foreground font-normal-weight">
                                 Your last 5 rounds
                              </p>
                           </div>

                           <ScoresList
                              scores={lastFiveScores}
                              onDelete={handleDeleteScore}
                              loading={profileLoading}
                           />
                        </div>
                     </div>
                  </div>
               </TabsContent>

               <TabsContent value="draws">
                  <DrawSection />
               </TabsContent>

               <TabsContent value="winners">
                  <WinnerNotification />
               </TabsContent>

               <TabsContent value="charity">
                  <CharityImpact selectedCharityId={profile?.preferred_charity_id} />
               </TabsContent>
            </Tabs>
         </div>
      </main>
   )
}

function AuthLoadingFallback() {
   return (
      <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground font-normal-weight">Loading...</p>
         </div>
      </div>
   )
}
