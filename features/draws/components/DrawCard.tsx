"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useIsParticipating } from "../hooks/useUserDraws"

interface Draw {
   id: string
   month: number
   year: number
   status: string
   prize_pool: number
   draw_type: string
   eligible_users_count?: number
}

interface DrawCardProps {
   draw: Draw
   onParticipate: (drawId: string) => void
   onLeave: (drawId: string) => void
   isParticipating: boolean
   isEligible: boolean
   isLoading?: boolean
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

export function DrawCard({
   draw,
   onParticipate,
   onLeave,
   isParticipating,
   isEligible,
   isLoading,
}: DrawCardProps) {
   const monthName = MONTHS[draw.month - 1] || ""

   const statusColors = {
      open: "bg-green-500",
      closed: "bg-yellow-500",
      completed: "bg-blue-500",
   }

   return (
      <Card className="overflow-hidden">
         <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
               <div>
                  <CardTitle className="text-xl">
                     {monthName} {draw.year}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                     {draw.draw_type === "algorithmic" ? "Score-based" : "Lucky Draw"}
                  </p>
               </div>
               <Badge
                  className={`${statusColors[draw.status as keyof typeof statusColors] || ""} text-white`}
               >
                  {draw.status}
               </Badge>
            </div>
         </CardHeader>
         <CardContent>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Prize Pool</span>
                  <span className="text-2xl font-bold text-accent">
                     ₹{Number(draw.prize_pool || 0).toLocaleString()}
                  </span>
               </div>

               {draw.eligible_users_count !== undefined && (
                  <div className="flex justify-between items-center">
                     <span className="text-muted-foreground">Participants</span>
                     <span className="font-medium">{draw.eligible_users_count}</span>
                  </div>
               )}

               <div className="pt-2">
                  {draw.status === "open" && (
                     <>
                        {isParticipating ? (
                           <div className="space-y-2">
                              <Button
                                 variant="outline"
                                 className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                                 disabled
                              >
                                 ✓ Participating
                              </Button>
                              <Button
                                 variant="ghost"
                                 className="w-full text-muted-foreground hover:text-destructive"
                                 onClick={() => onLeave(draw.id)}
                                 disabled={isLoading}
                              >
                                 Leave Draw
                              </Button>
                           </div>
                        ) : isEligible ? (
                           <Button
                              className="w-full bg-accent hover:bg-accent/90"
                              onClick={() => onParticipate(draw.id)}
                              disabled={isLoading}
                           >
                              {isLoading ? "Joining..." : "Participate"}
                           </Button>
                        ) : (
                           <Button
                              className="w-full"
                              variant="secondary"
                              onClick={() => onParticipate(draw.id)}
                           >
                              Upgrade to Participate
                           </Button>
                        )}
                     </>
                  )}

                  {draw.status === "closed" && (
                     <Button variant="outline" className="w-full" disabled>
                        Draw Closed
                     </Button>
                  )}

                  {draw.status === "completed" && (
                     <Button variant="outline" className="w-full" disabled>
                        View Results
                     </Button>
                  )}
               </div>
            </div>
         </CardContent>
      </Card>
   )
}
