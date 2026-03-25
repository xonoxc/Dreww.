"use client"

import { Button } from "@/components/ui/button"

interface CharityImpactProps {
   selectedCharityId?: string | null
}

export function CharityImpact({ selectedCharityId }: CharityImpactProps) {
   return (
      <div className="mt-12 p-8 border border-border rounded-lg bg-secondary/20">
         <h2 className="text-2xl font-heavy text-foreground mb-4">Your Charity Impact</h2>
         {selectedCharityId ? (
            <div className="p-6 border border-border rounded-lg bg-card">
               <p className="text-foreground font-heavy mb-2">Selected Charity</p>
               <p className="text-muted-foreground font-normal-weight">
                  Your winnings will contribute 10%+ to your selected charity
               </p>
            </div>
         ) : (
            <div className="p-6 border border-border rounded-lg bg-card">
               <p className="text-muted-foreground font-normal-weight mb-4">
                  Choose a charity to support and help make golf matter beyond the course
               </p>
               <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-heavy button-hover">
                  Select Charity
               </Button>
            </div>
         )}
      </div>
   )
}
