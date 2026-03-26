import { SignIn } from "@/features/auth/components/SignIn"
import BackBtn from "@/components/BackBtn"

export default function SignInPage() {
   return (
      <main className="relative min-h-screen bg-background flex items-center justify-center p-4 selection:bg-accent selection:text-accent-foreground">
         <div className="fixed inset-0 grid-ambient pointer-events-none z-0" />

         <div className="absolute top-4 left-4 z-20">
            <BackBtn backRoute="/" contentString="Home" />
         </div>

         <div className="relative z-10 w-full max-w-md">
            <SignIn />
         </div>
      </main>
   )
}
