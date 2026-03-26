"use client"

import { useCharityById } from "@/features/charity/hooks/useCharities"

interface DonationBadgeProps {
   charityId: string | null
   percentage: number
}

export function DonationBadge({ charityId, percentage }: DonationBadgeProps) {
   const charity = useCharityById(charityId || "")

   if (!charityId || !charity) {
      return null
   }

   return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-accent/10 border border-accent/30">
         <span className="text-lg">🎗️</span>
         <span className="text-sm">
            You&apos;re donating <span className="font-bold text-accent">{percentage}%</span> to{" "}
            <span className="font-medium">{charity.name}</span>
         </span>
      </div>
   )
}
