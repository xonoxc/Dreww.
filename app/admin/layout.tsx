import { redirect } from "next/navigation"
import { createServerSideClient } from "@/lib/supabase/server"
import { Database } from "@/lib/supabase/database.types"
import SignOutBtn from "@/features/auth/components/SignOutBtn"
import Link from "next/link"
import { Logo } from "@/features/dashboard/components/Logo"

export const metadata = {
   title: "Admin Dashboard - Dreww.",
   description: "Admin panel for managing draws, winners, and platform statistics",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
   const supabase = await createServerSideClient()
   const {
      data: { user },
   } = await supabase.auth.getUser()

   if (!user) {
      redirect("/auth/sign-in")
   }

   const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single<Database["public"]["Tables"]["profiles"]["Row"]>()

   if (!profile?.is_admin) {
      redirect("/dashboard")
   }

   return (
      <div className="min-h-screen bg-background">
         <div className="border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
               <div className="flex items-center justify-between">
                  <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
                     <Logo />
                  </Link>

                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                     Welcome,
                     <span className="font-medium text-foreground">{user.email}</span>
                     <SignOutBtn />
                  </div>
               </div>
            </div>
         </div>

         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
   )
}
