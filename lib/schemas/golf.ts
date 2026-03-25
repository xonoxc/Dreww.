import { z } from "zod"

export const golfScoreSchema = z.object({
   stableforfScore: z.number().min(0).max(45, "Stableford score must be between 0-45"),
   courseName: z.string().min(2, "Course name is required"),
   coursePar: z.number().min(9).max(73, "Course par must be between 9-73").optional(),
   scoreDate: z.string().pipe(z.coerce.date()),
   notes: z.string().max(500).optional(),
})

export const charitySchema = z.object({
   name: z.string().min(2, "Charity name is required"),
   description: z.string().min(10).optional(),
   websiteUrl: z.string().url().optional(),
   category: z.string().optional(),
})

export const subscriptionSchema = z.object({
   tier: z.enum(["free", "premium", "elite"]),
})

export type GolfScoreInput = z.infer<typeof golfScoreSchema>
export type CharityInput = z.infer<typeof charitySchema>
export type SubscriptionInput = z.infer<typeof subscriptionSchema>
