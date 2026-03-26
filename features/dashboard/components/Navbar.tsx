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
               <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-accent" />
                  <span className="text-xl font-bold tracking-tighter uppercase">Dreww</span>
               </div>
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
