import { SignUp } from "@/features/auth/components/SignUp"

export default function SignUpPage() {
   return (
      <main className="min-h-screen bg-background  flex items-center justify-center p-4">
         <div className="absolute inset-0 pointer-events-none grid-ambient">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
         </div>

         <div className="relative z-10 w-full">
            <SignUp />
         </div>
      </main>
   )
}
