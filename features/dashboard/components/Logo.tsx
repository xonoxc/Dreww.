"use client"

export function Logo({ size = "default" }: { size?: "small" | "default" }) {
   const sizeClasses = size === "small" ? "w-3 h-3 text-lg" : "w-4 h-4 text-xl"

   return (
      <div className="flex items-center gap-2">
         <div className={`${size === "small" ? "w-3 h-3" : "w-4 h-4"} bg-accent`} />
         <span
            className={`font-bold tracking-tighter uppercase ${size === "small" ? "text-lg" : "text-xl"}`}
         >
            Dreww
         </span>
      </div>
   )
}
