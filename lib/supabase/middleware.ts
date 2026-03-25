import { Database } from "@/lib/supabase/database.types"
import { createServerSideClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

const PUBLIC_ROUTES = ["/", "/auth/sign-in", "/auth/sign-up"]
const PRIVATE_ROUTES = ["/dashboard", "/admin"]

/*
 *
 * route matcher utility function
 * **/
function matchesRoute(pathname: string, routes: string[]) {
   return routes.some(route => pathname === route || pathname.startsWith(route + "/"))
}

/*
 * helper functio to redirect user to a specific URL
 * **/

function createRequestRedirector(request: NextRequest) {
   return (url: string) => {
      return NextResponse.redirect(new URL(url, request.url))
   }
}

export async function updateSession(request: NextRequest) {
   const redirectTo = createRequestRedirector(request)
   const pathName = request.nextUrl.pathname

   let supabaseResponse = NextResponse.next({
      request,
   })

   const supabase = await createServerSideClient()

   const isPublicRoute = matchesRoute(pathName, PUBLIC_ROUTES)
   const isPrivateRoute = matchesRoute(pathName, PRIVATE_ROUTES)

   const {
      data: { user },
   } = await supabase.auth.getUser()

   if (!user) {
      if (isPrivateRoute) return redirectTo("/auth/sign-in")
      return supabaseResponse
   }

   const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single<Database["public"]["Tables"]["profiles"]["Row"]>()

   if (error || !profile) {
      await supabase.auth.signOut()
      return redirectTo("/auth/sign-in")
   }

   if (profile.is_admin && pathName.startsWith("/dashboard")) {
      return redirectTo("/admin")
   }

   if (!profile.is_admin && pathName.startsWith("/admin")) {
      return redirectTo("/dashboard")
   }

   if (isPublicRoute) {
      if (profile.is_admin) return redirectTo("/admin")
      return redirectTo("/dashboard")
   }

   return supabaseResponse
}
