"use client"

import { useState } from "react"
import { useCharities } from "../hooks/useCharities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fromPromise } from "neverthrow"
import { IconCheck } from "@tabler/icons-react"

interface CharitySelectorProps {
   onSelect: (charityId: string) => Promise<void>
   selectedId?: string | null
}

export const CharitySelector = ({ onSelect, selectedId }: CharitySelectorProps) => {
   const { data: charities, isLoading } = useCharities()
   const [searchQuery, setSearchQuery] = useState("")
   const [selectedCharityId, setSelectedCharityId] = useState<string | null>(selectedId || null)
   const [isSubmitting, setIsSubmitting] = useState(false)

   const filteredCharities = (charities ?? []).filter(
      charity =>
         charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (charity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
   )

   const handleSelect = (charityId: string) => {
      setSelectedCharityId(charityId)
   }

   const handleConfirm = async () => {
      if (!selectedCharityId) return

      setIsSubmitting(true)
      await fromPromise(onSelect(selectedCharityId), () => {
         setIsSubmitting(false)
      })
      setIsSubmitting(false)
   }

   if (isLoading) {
      return (
         <div className="space-y-4">
            <div className="h-10 bg-secondary/50 rounded-lg animate-pulse" />
            {[...Array(3)].map((_, i) => (
               <div key={i} className="h-24 bg-secondary/50 rounded-lg animate-pulse" />
            ))}
         </div>
      )
   }

   return (
      <div className="space-y-4">
         <Input
            type="search"
            placeholder="Search charities..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground"
         />

         <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredCharities.length === 0 ? (
               <p className="text-center text-muted-foreground font-normal-weight py-8">
                  No charities found
               </p>
            ) : (
               filteredCharities.map(charity => (
                  <button
                     key={charity.id}
                     onClick={() => handleSelect(charity.id)}
                     className={`w-full p-4 border rounded-lg text-left smooth-transition ${
                        selectedCharityId === charity.id
                           ? "border-accent bg-secondary/50"
                           : "border-border hover:border-accent hover:bg-secondary/30"
                     }`}
                  >
                     <div className="flex items-start gap-3">
                        {charity.logo_url && (
                           <img
                              src={charity.logo_url}
                              alt={charity.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                           />
                        )}
                        <div className="flex-1 min-w-0">
                           <p className="font-heavy text-foreground">{charity.name}</p>
                           {charity.description && (
                              <p className="text-sm text-muted-foreground font-normal-weight line-clamp-2">
                                 {charity.description}
                              </p>
                           )}
                           <p className="text-xs text-accent font-normal-weight mt-1">
                              Total Donated: ${charity.total_contributed}
                           </p>
                        </div>
                        {selectedCharityId === charity.id && (
                           <IconCheck className="w-5 h-5 text-accent" />
                        )}
                     </div>
                  </button>
               ))
            )}
         </div>

         <Button
            onClick={handleConfirm}
            disabled={!selectedCharityId || isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-heavy button-hover"
         >
            {isSubmitting ? "Saving..." : "Confirm Selection"}
         </Button>
      </div>
   )
}
