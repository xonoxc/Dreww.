"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema } from "@/lib/schemas/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { signUp } from "@/lib/supabase/actions"
import { useRouter } from "next/navigation"

export function SignUp() {
   const router = useRouter()

   const {
      register,
      handleSubmit,
      setError,
      formState: { errors, isSubmitting },
   } = useForm({
      resolver: zodResolver(signUpSchema),
      defaultValues: {
         email: "",
         password: "",
         fullName: "",
      },
   })

   const onSubmit = async (data: { email: string; password: string; fullName: string }) => {
      const result = await signUp(data)
      if (result.isErr()) {
         setError("root", { message: result.error.message })
         return
      }
      router.refresh()
   }

   return (
      <div className="w-full max-w-md mx-auto space-y-6">
         <div className="space-y-2 text-center">
            <h1 className="text-3xl font-heavy text-foreground">Join Dreww.</h1>
            <p className="text-muted-foreground font-normal-weight">
               Create your account and start playing
            </p>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
               <label className="text-sm font-heavy">Full Name</label>
               <Input
                  type="text"
                  placeholder="John Doe"
                  {...register("fullName")}
                  disabled={isSubmitting}
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground"
               />
               {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
               )}
            </div>

            <div className="space-y-2">
               <label className="text-sm font-heavy">Email</label>
               <Input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  disabled={isSubmitting}
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground"
               />
               {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
               <label className="text-sm font-heavy">Password</label>
               <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isSubmitting}
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground"
               />
               {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
               )}
            </div>

            {errors.root && (
               <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {errors.root.message}
               </div>
            )}

            <Button
               type="submit"
               disabled={isSubmitting}
               className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-heavy button-hover"
            >
               {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
         </form>

         <div className="text-center text-sm">
            <p className="text-muted-foreground font-normal-weight">
               Already have an account?{" "}
               <Link href="/auth/sign-in" className="text-accent font-heavy hover:underline">
                  Sign in
               </Link>
            </p>
         </div>
      </div>
   )
}
