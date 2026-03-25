"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import type { Route } from "next"
import { cn } from "@/lib/utils"

interface BackBtnProps extends React.HTMLAttributes<HTMLButtonElement> {
   contentString?: string
   backRoute?: Route
}

export default function BackBtn({
   contentString,
   backRoute,
   children,
   className,
}: React.PropsWithChildren<BackBtnProps>) {
   const router = useRouter()

   const handleBackButtonClick = () => {
      if (backRoute) {
         router.push(backRoute)
         return
      }
      router.back()
   }

   return (
      <button
         className={cn(
            "flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300 shadow-sm",
            "text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white",
            "bg-white hover:bg-neutral-200 dark:bg-neutral-900/40 dark:hover:bg-neutral-800/60",
            "border border-neutral-300 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-700",
            "hover:shadow-md",
            className
         )}
         onClick={handleBackButtonClick}
      >
         {children ?? <ArrowLeft strokeWidth={2} size={14} />}
         <span>{contentString ?? "Back"}</span>
      </button>
   )
}
