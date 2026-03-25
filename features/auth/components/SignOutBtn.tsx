"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/supabase/actions"
import { fromPromise } from "neverthrow"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignOutBtn() {
   const router = useRouter()
   const [isSigningOut, setIsSigningOut] = useState(false)

   const handleSignOut = async () => {
      setIsSigningOut(true)

      const result = await fromPromise(signOut(), err => err)
      if (result.isErr()) {
         setIsSigningOut(false)
         console.error("Sign out error:", result.error)
         return
      }

      setIsSigningOut(false)
      router.push("/auth/sign-in")
   }

   return (
      <Button
         onClick={handleSignOut}
         variant="outline"
         className="border-border hover:bg-secondary text-foreground font-normal-weight"
         disabled={isSigningOut}
      >
         {isSigningOut ? "Signing out..." : "Sign Out"}
      </Button>
   )
}
