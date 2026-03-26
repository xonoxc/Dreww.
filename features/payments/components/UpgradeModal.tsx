"use client"

import { useState, useEffect } from "react"
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useCharities } from "@/features"
import { TIER_PRICING } from "@/lib/utils/razorpay"
import { useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/supabase/client"
import axios from "axios"

interface UpgradeModalProps {
   open: boolean
   onOpenChange: (open: boolean) => void
   selectedTier?: "premium" | "elite"
   onSuccess?: () => void
   currentCharityId?: string | null
}

export function UpgradeModal({
   open,
   onOpenChange,
   selectedTier: initialTier,
   onSuccess,
   currentCharityId,
}: UpgradeModalProps) {
   const [selectedTier, setSelectedTier] = useState<"premium" | "elite">(initialTier || "premium")
   const [charityPercentage, setCharityPercentage] = useState(10)
   const [selectedCharityId, setSelectedCharityId] = useState<string | null>(
      currentCharityId || null
   )
   const [showCharitySelector, setShowCharitySelector] = useState<boolean>(false)
   const [isSaving, setIsSaving] = useState<boolean>(false)
   const [isProcessing, setIsProcessing] = useState(false)
   const [error, setError] = useState<string | null>(null)

   const { data: charities, isLoading: charitiesLoading } = useCharities()
   const queryClient = useQueryClient()

   useEffect(() => {
      if (open) {
         setSelectedCharityId(currentCharityId || null)
      }
   }, [open, currentCharityId])

   useEffect(() => {
      if (initialTier) {
         setSelectedTier(initialTier)
      }
   }, [initialTier])

   const basePrice = TIER_PRICING[selectedTier]
   const donationAmount = Math.round(basePrice * (charityPercentage / 100))
   const totalPrice = basePrice

   const selectedCharity = charities?.find(c => c.id === selectedCharityId)

   const saveCharityToProfile = async () => {
      const userId = (await apiClient.auth.getUser()).data.user?.id
      if (!userId || !selectedCharityId) return

      const { error } = await apiClient
         .from("profiles")
         .update({
            preferred_charity_id: selectedCharityId,
         })
         .eq("id", userId)

      if (error) {
         console.error("Error saving charity to profile:", error)
      }
   }

   const insertCharityContribution = async () => {
      const userId = (await apiClient.auth.getUser()).data.user?.id
      if (!userId || !selectedCharityId || !selectedCharity) return

      const amountInRupees = donationAmount / 100

      const { error } = await apiClient.from("charity_contributions").insert({
         user_id: userId,
         charity_id: selectedCharityId,
         amount: amountInRupees,
         source: "subscription_fee",
      })

      if (error) {
         console.error("Error inserting charity contribution:", error)
      } else {
         console.log("Charity contribution inserted:", amountInRupees)
      }
   }

   const saveCharitySettings = async () => {
      setIsSaving(true)
      await saveCharityToProfile()
      setIsSaving(false)
   }

   const handlePaymentClick = async () => {
      if (!window.Razorpay) {
         setError("Razorpay SDK not loaded")
         return
      }

      setIsProcessing(true)
      setError(null)

      try {
         const desc = `Upgrade to ${selectedTier} tier`

         const order = await axios.post("/api/order", {
            amount: totalPrice,
            tier: selectedTier,
            description: desc,
         })

         if (order.status !== 200) {
            throw new Error(order.data?.error || "Failed to create order")
         }

         const orderData = order.data

         const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            amount: orderData.amount,
            currency: "INR",
            name: "Golf Dreww",
            description: desc,
            order_id: orderData.orderId,
            prefill: {
               email: (await apiClient.auth.getUser()).data.user?.email,
            },
            handler: async function () {
               try {
                  await saveCharityToProfile()
                  await insertCharityContribution()
                  queryClient.invalidateQueries({ queryKey: ["profile"] })
                  onSuccess?.()
                  onOpenChange(false)
               } catch (err) {
                  console.error("Payment handler error:", err)
                  setIsProcessing(false)
               } finally {
                  setIsProcessing(false)
               }
            },
            theme: {
               color: "#ff6b35",
            },
            modal: {
               ondismiss: () => {
                  setIsProcessing(false)
               },
            },
         }

         const rzp = new window.Razorpay(options)
         rzp.open()
      } catch (err: any) {
         setError(err.message || "Payment initiation failed")
      } finally {
         setIsProcessing(false)
      }
   }

   const handleSaveOnly = async () => {
      await saveCharitySettings()
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      onSuccess?.()
      onOpenChange(false)
   }

   const isAlreadySubscribed = initialTier && (initialTier === "premium" || initialTier === "elite")

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle>
                  {isAlreadySubscribed ? "Update Charity Settings" : "Upgrade to Participate"}
               </DialogTitle>
               <DialogDescription>
                  {isAlreadySubscribed
                     ? "Update your charity selection and donation percentage"
                     : "Upgrade to Premium or Elite to participate in draws"}
               </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
               {!isAlreadySubscribed && (
                  <div>
                     <label className="text-sm font-medium mb-2 block">Select Plan</label>
                     <div className="grid grid-cols-2 gap-3">
                        <button
                           onClick={() => setSelectedTier("premium")}
                           className={`p-4 border rounded-lg text-center transition-all ${
                              selectedTier === "premium"
                                 ? "border-accent bg-accent/10"
                                 : "border-border hover:border-accent"
                           }`}
                        >
                           <p className="font-semibold">Premium</p>
                           <p className="text-accent">
                              ₹{(TIER_PRICING.premium / 100).toFixed(0)}/mo
                           </p>
                        </button>
                        <button
                           onClick={() => setSelectedTier("elite")}
                           className={`p-4 border rounded-lg text-center transition-all ${
                              selectedTier === "elite"
                                 ? "border-accent bg-accent/10"
                                 : "border-border hover:border-accent"
                           }`}
                        >
                           <p className="font-semibold">Elite</p>
                           <p className="text-accent">
                              ₹{(TIER_PRICING.elite / 100).toFixed(0)}/mo
                           </p>
                        </button>
                     </div>
                  </div>
               )}

               <div>
                  <label className="text-sm font-medium mb-2 block">🎗️ Support a Charity</label>
                  <button
                     onClick={() => setShowCharitySelector(!showCharitySelector)}
                     className="w-full p-3 border border-border rounded-lg text-left hover:border-accent transition-colors"
                  >
                     {selectedCharity ? (
                        <div className="flex items-center gap-2">
                           {selectedCharity.logo_url && (
                              <img
                                 src={selectedCharity.logo_url}
                                 alt={selectedCharity.name}
                                 className="w-8 h-8 rounded object-cover"
                              />
                           )}
                           <span>{selectedCharity.name}</span>
                        </div>
                     ) : (
                        <span className="text-muted-foreground">Select a charity...</span>
                     )}
                  </button>

                  {showCharitySelector && (
                     <div className="mt-2 p-3 border border-border rounded-lg max-h-48 overflow-y-auto space-y-2">
                        {charitiesLoading ? (
                           <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : (
                           charities?.map(charity => (
                              <button
                                 key={charity.id}
                                 onClick={() => {
                                    setSelectedCharityId(charity.id)
                                    setShowCharitySelector(false)
                                 }}
                                 className={`w-full p-2 text-left rounded hover:bg-secondary transition-colors ${
                                    selectedCharityId === charity.id ? "bg-secondary" : ""
                                 }`}
                              >
                                 <p className="font-medium text-sm">{charity.name}</p>
                              </button>
                           ))
                        )}
                     </div>
                  )}
               </div>

               {selectedCharity && (
                  <div>
                     <label className="text-sm font-medium mb-2 block">
                        💝 Donation Percentage: {charityPercentage}%
                     </label>
                     <div className="space-y-2">
                        <Slider
                           value={[charityPercentage]}
                           onValueChange={([value]) => setCharityPercentage(value)}
                           min={10}
                           max={100}
                           step={5}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                           <span>10%</span>
                           <span>100%</span>
                        </div>
                     </div>
                     <p className="text-sm text-muted-foreground mt-2">
                        You&apos;ll donate ₹{(donationAmount / 100).toFixed(2)} of your subscription
                        to {selectedCharity.name}
                     </p>
                  </div>
               )}

               {!isAlreadySubscribed && (
                  <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                     <div className="flex justify-between">
                        <span>Plan ({selectedTier})</span>
                        <span>₹{(basePrice / 100).toFixed(2)}</span>
                     </div>
                     {selectedCharity && (
                        <div className="flex justify-between text-accent">
                           <span>Charity Donation</span>
                           <span>- ₹{(donationAmount / 100).toFixed(2)}</span>
                        </div>
                     )}
                     <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total</span>
                        <span>₹{(totalPrice / 100).toFixed(2)}</span>
                     </div>
                  </div>
               )}

               {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/50">
                     <p className="text-sm text-destructive">{error}</p>
                  </div>
               )}

               {isAlreadySubscribed ? (
                  <div className="space-y-2">
                     <Button
                        className="w-full bg-accent hover:bg-accent/90"
                        onClick={handleSaveOnly}
                        disabled={isSaving}
                     >
                        {isSaving ? "Saving..." : "Save Changes"}
                     </Button>
                  </div>
               ) : (
                  <Button
                     className="w-full bg-accent hover:bg-accent/90"
                     onClick={handlePaymentClick}
                     disabled={isProcessing}
                  >
                     {isProcessing ? "Processing..." : `Pay ₹${(totalPrice / 100).toFixed(2)}`}
                  </Button>
               )}
            </div>
         </DialogContent>
      </Dialog>
   )
}
