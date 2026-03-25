import { ResultAsync } from "neverthrow"
import { apiClient } from "./client"
import type { User, Session } from "@supabase/supabase-js"
import type { SignUpSchema, SignInSchema } from "../schemas/auth"
import { getErrorMessage } from "@/lib/supabase/data-actions"

export const signIn = (
   data: SignInSchema
): ResultAsync<Session, { message: string; code?: string }> => {
   return ResultAsync.fromPromise(
      (async () => {
         const { data: sessionData, error } = await apiClient.auth.signInWithPassword({
            email: data.email,
            password: data.password,
         })

         if (error) {
            if (error.message.includes("Invalid login")) {
               throw {
                  message: "Invalid email or password",
                  code: "INVALID_CREDENTIALS",
               }
            }
            throw { message: error.message, code: "AUTH_ERROR" }
         }

         if (!sessionData.session) {
            throw { message: "Failed to create session", code: "NO_SESSION" }
         }

         return sessionData.session
      })(),
      () => ({ message: "An unexpected error occurred", code: "UNKNOWN" })
   )
}

export const signUp = (
   data: SignUpSchema
): ResultAsync<{ user: User; isNewUser: boolean }, { message: string; code?: string }> => {
   return ResultAsync.fromPromise(
      (async () => {
         const { data: authData, error } = await apiClient.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
               data: {
                  full_name: data.fullName,
               },
            },
         })

         if (error) {
            if (error.message.includes("already registered")) {
               throw { message: "An account with this email already exists", code: "EMAIL_EXISTS" }
            }
            throw { message: error.message, code: "AUTH_ERROR" }
         }

         if (!authData.user) {
            throw { message: "Failed to create user", code: "NO_USER" }
         }

         const isNewUser = authData.user.id !== null

         if (isNewUser) {
            // In signUp function, replace:
            const { error: profileError } = await apiClient.from("profiles").insert([
               {
                  id: authData.user.id,
                  email: data.email,
                  full_name: data.fullName,
                  subscription_tier: "free",
                  subscription_status: "active",
               },
            ])

            if (profileError) {
               throw { message: profileError.message, code: "PROFILE_ERROR" }
            }
         }

         return { user: authData.user, isNewUser }
      })(),
      err => {
         if (typeof err === "object" && err !== null && "message" in err) {
            return { message: err.message, code: "UNKNOWN" }
         }

         if (err.status === 400) {
            return { message: "invalid credenetials", code: "UNKNOWN" }
         }

         console.log("Unexpected error during sign-up:", err)

         return { message: "An unexpected error occurred", code: "UNKNOWN" }
      }
   )
}

export function signOut() {
   return apiClient.auth.signOut()
}

export function getCurrentUser() {
   return apiClient.auth.getUser()
}

export function getCurrentSession() {
   return apiClient.auth.getSession()
}
