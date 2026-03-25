interface StatCardProps {
   label: string
   value: string | number
   icon?: string
   trend?: {
      direction: "up" | "down"
      percentage: number
   }
   className?: string
}

export const StatCard = ({ label, value, icon, trend, className = "" }: StatCardProps) => {
   return (
      <div
         className={`p-6 border border-border rounded-lg bg-secondary/20 hover:border-accent hover:bg-secondary/30 smooth-transition ${className}`}
      >
         <div className="flex items-start justify-between">
            <div className="flex-1">
               <p className="text-sm text-muted-foreground font-normal-weight mb-2">{label}</p>
               <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-heavy text-accent">{value}</p>
                  {trend && (
                     <span
                        className={`text-xs font-heavy ${trend.direction === "up" ? "text-green-500" : "text-red-500"}`}
                     >
                        {trend.direction === "up" ? "↑" : "↓"} {trend.percentage}%
                     </span>
                  )}
               </div>
            </div>
            {icon && <div className="text-3xl">{icon}</div>}
         </div>
      </div>
   )
}
