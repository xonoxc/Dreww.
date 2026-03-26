"use client"

import { useAuth } from "@/features"
import SignOutBtn from "@/features/auth/components/SignOutBtn"

interface NavbarProps {
   userName?: string | null
}

export function Navbar({ userName }: NavbarProps) {
   const { user } = useAuth()

   return (
      <nav className="sticky top-0 z-20 border-b border-border backdrop-blur-sm bg-background/80">
         <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-foreground font-heavy text-lg">⛳</span>
               </div>
               <span className="text-xl font-heavy text-foreground">Golf Fair</span>
            </div>

            <div className="flex items-center gap-4">
               <span className="text-sm text-muted-foreground font-normal-weight">
                  {userName || user?.email}
               </span>

               <SignOutBtn />
            </div>
         </div>
      </nav>
   )
}
