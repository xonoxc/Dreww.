import { z } from "zod"

export const signUpSchema = z.object({
   email: z.string().email("Invalid email address"),
   password: z.string().min(8, "Password must be at least 8 characters"),
   fullName: z.string().min(2, "Full name must be at least 2 characters"),
})

export const signInSchema = z.object({
   email: z.string().email("Invalid email address"),
   password: z.string().min(1, "Password is required"),
})

export const updateProfileSchema = z.object({
   fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
   handicap: z.number().min(0).max(36, "Handicap must be between 0-36").optional(),
   preferredCharityId: z.string().uuid().optional().nullable(),
})

export type SignUpSchema = z.infer<typeof signUpSchema>
export type SignInSchema = z.infer<typeof signInSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
