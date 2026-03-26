import { redirect } from "next/navigation"
import { createServerSideClient } from "@/lib/supabase/server"
import { Database } from "@/lib/supabase/database.types"
import SignOutBtn from "@/features/auth/components/SignOutBtn"

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
                  <div>
                     <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                     <p className="text-sm text-muted-foreground mt-1">
                        Platform management and monitoring
                     </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
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
