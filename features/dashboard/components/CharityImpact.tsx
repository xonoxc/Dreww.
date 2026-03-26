"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCharityById } from "@/features/charity/hooks/useCharities"

interface CharityImpactProps {
   selectedCharityId?: string | null
}

export function CharityImpact({ selectedCharityId }: CharityImpactProps) {
   const router = useRouter()
   const charity = useCharityById(selectedCharityId || "")

   return (
      <div className="mt-12 p-8 border border-border rounded-lg bg-secondary/20">
         <h2 className="text-2xl font-heavy text-foreground mb-4">Your Charity Impact</h2>

         {selectedCharityId && charity ? (
            <div className="space-y-4">
               <div className="p-6 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-4">
                     {charity.logo_url && (
                        <img
                           src={charity.logo_url}
                           alt={charity.name}
                           className="w-16 h-16 rounded-lg object-cover"
                        />
                     )}
                     <div className="flex-1">
                        <p className="text-lg font-semibold text-foreground">{charity.name}</p>
                        {charity.description && (
                           <p className="text-sm text-muted-foreground line-clamp-2">
                              {charity.description}
                           </p>
                        )}
                     </div>
                  </div>
               </div>

               <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/subscription")}
               >
                  Change Charity
               </Button>
            </div>
         ) : (
            <div className="p-6 border border-border rounded-lg bg-card">
               <p className="text-muted-foreground font-normal-weight mb-4">
                  Choose a charity to support and help make golf matter beyond the course
               </p>
               <Button
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-heavy button-hover"
                  onClick={() => router.push("/subscription")}
               >
                  Select Charity
               </Button>
            </div>
         )}
      </div>
   )
}
