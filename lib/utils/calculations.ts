/**
 * Calculate prize amount based on position and pool
 */
export const calculatePrizeAmount = (position: 1 | 2 | 3, prizePool: number): number => {
   const percentages = {
      1: 0.4,
      2: 0.35,
      3: 0.25,
   }

   return Math.round(prizePool * percentages[position])
}

/**
 * Calculate charity contribution from winnings
 */
export const calculateCharityContribution = (
   winnings: number,
   contributionPercentage: number = 0.1
): number => {
   return Math.round(winnings * contributionPercentage)
}

/**
 * Determine draw type weight for algorithmic draws
 * Higher scores = better chance of winning
 */
export const calculateDrawWeight = (stableforfScore: number, totalScores: number): number => {
   return (stableforfScore / totalScores) * 100
}

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = "USD"): string => {
   return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
   }).format(amount)
}

/**
 * Format date for display
 */
export const formatDate = (date: string | Date): string => {
   const dateObj = typeof date === "string" ? new Date(date) : date
   return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
   })
}

/**
 * Calculate days until next draw closes
 */
export const daysUntilDrawClose = (closeDate: Date): number => {
   const today = new Date()
   const difference = closeDate.getTime() - today.getTime()
   return Math.ceil(difference / (1000 * 60 * 60 * 24))
}

/**
 * Validate Stableford score (0-45)
 */
export const isValidStableforfScore = (score: number): boolean => {
   return Number.isInteger(score) && score >= 0 && score <= 45
}

/**
 * Validate golf course par (9-73)
 */
export const isValidCoursePar = (par: number): boolean => {
   return Number.isInteger(par) && par >= 9 && par <= 73
}

/**
 * Get subscription tier benefits
 */
export const getSubscriptionBenefits = (tier: "free" | "premium" | "elite"): string[] => {
   const benefits = {
      free: ["Score tracking", "Monthly draw entry", "5% charity contribution", "Basic statistics"],
      premium: [
         "Unlimited scoring",
         "Priority draw entry",
         "10% charity contribution",
         "Advanced analytics",
         "Custom golf courses",
      ],
      elite: [
         "All premium features",
         "Exclusive draws",
         "15% charity contribution",
         "Dedicated support",
         "Custom charity page",
         "VIP recognition",
      ],
   }

   return benefits[tier]
}

/**
 * Calculate subscription price
 */
export const getSubscriptionPrice = (tier: "free" | "premium" | "elite"): number => {
   const prices = {
      free: 0,
      premium: 9.99,
      elite: 19.99,
   }

   return prices[tier]
}

/**
 * Determine if user is eligible for draw
 */
export const isEligibleForDraw = (scoresCount: number, minScoresRequired: number = 1): boolean => {
   return scoresCount >= minScoresRequired
}

/**
 * Calculate average score
 */
export const calculateAverageScore = (scores: number[]): number => {
   if (scores.length === 0) return 0
   const sum = scores.reduce((a, b) => a + b, 0)
   return Math.round(sum / scores.length)
}

/**
 * Get best score from array
 */
export const getBestScore = (scores: number[]): number => {
   return scores.length > 0 ? Math.max(...scores) : 0
}

/**
 * Get worst score from array
 */
export const getWorstScore = (scores: number[]): number => {
   return scores.length > 0 ? Math.min(...scores) : 0
}
