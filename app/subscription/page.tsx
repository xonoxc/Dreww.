"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useProfile, UpgradeModal } from "@/features"
import { Button } from "@/components/ui/button"

interface PricingPlan {
   tier: "free" | "premium" | "elite"
   price: string
   pricePerMonth: string
   features: string[]
   accent: boolean
}

const PLANS: PricingPlan[] = [
   {
      tier: "free",
      price: "0.00",
      pricePerMonth: "Always Free",
      features: [
         "Log unlimited golf scores",
         "Track last 5 scores",
         "View monthly draws",
         "5% charity routing",
      ],
      accent: false,
   },
   {
      tier: "premium",
      price: "₹499",
      pricePerMonth: "₹499/month",
      features: [
         "Everything in Free",
         "Advanced score analytics",
         "Priority in draws",
         "10% charity routing",
         "Premium support",
      ],
      accent: true,
   },
   {
      tier: "elite",
      price: "₹999",
      pricePerMonth: "₹999/month",
      features: [
         "Everything in Premium",
         "AI-powered insights",
         "VIP draw priority",
         "15% charity routing",
         "24/7 VIP support",
      ],
      accent: false,
   },
]

export default function SubscriptionPage() {
   const router = useRouter()
   const { user, loading: authLoading } = useAuth()
   const { data: profile } = useProfile()
   const [selectedTier, setSelectedTier] = useState<"premium" | "elite" | null>(null)
   const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

   const currentTier = profile?.subscription_tier || "free"

   if (authLoading) {
      return (
         <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
         </div>
      )
   }

   if (!user) {
      router.push("/auth/sign-in?redirect=/subscription")
      return null
   }

   const handleUpgradeSuccess = () => {
      router.push("/dashboard?upgrade=success")
   }

   const handlePlanClick = (tier: "premium" | "elite") => {
      setSelectedTier(tier)
      setUpgradeModalOpen(true)
   }

   return (
      <main className="min-h-screen bg-background py-20 px-6">
         <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
               <h1 className="text-4xl font-bold mb-4">Upgrade Your Plan</h1>
               <p className="text-muted-foreground">Choose a plan that fits your golf journey</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {PLANS.map(plan => (
                  <div
                     key={plan.tier}
                     className={`p-8 border rounded-xl flex flex-col ${
                        plan.accent ? "border-accent bg-card relative" : "border-border bg-card/50"
                     }`}
                  >
                     {plan.accent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs px-3 py-1 rounded-full font-medium">
                           Popular
                        </div>
                     )}

                     <div className="mb-6">
                        <h3 className="text-2xl font-bold capitalize mb-2">{plan.tier}</h3>
                        <div className="flex items-baseline gap-2">
                           <span className="text-4xl font-bold">{plan.price}</span>
                           <span className="text-muted-foreground">/mo</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{plan.pricePerMonth}</p>
                     </div>

                     <ul className="space-y-3 mb-8 grow">
                        {plan.features.map((feature, i) => (
                           <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-accent">✓</span>
                              {feature}
                           </li>
                        ))}
                     </ul>

                     {plan.tier === "free" ? (
                        <Button variant="outline" className="w-full" disabled>
                           Current Plan
                        </Button>
                     ) : (
                        <Button
                           onClick={() => handlePlanClick(plan.tier as "premium" | "elite")}
                           className={`w-full ${
                              plan.accent
                                 ? "bg-accent hover:bg-accent/90"
                                 : "bg-secondary hover:bg-secondary/80"
                           }`}
                        >
                           {currentTier === plan.tier ? "Current Plan" : "Upgrade"}
                        </Button>
                     )}
                  </div>
               ))}
            </div>

            <div className="mt-12 text-center">
               <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                  ← Back to Dashboard
               </Button>
            </div>
         </div>

         <UpgradeModal
            open={upgradeModalOpen}
            onOpenChange={setUpgradeModalOpen}
            selectedTier={selectedTier || undefined}
            currentCharityId={profile?.preferred_charity_id}
            onSuccess={handleUpgradeSuccess}
         />
      </main>
   )
}
