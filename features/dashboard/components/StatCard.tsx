"use client"

import { IconProps } from "@tabler/icons-react"

interface StatCardProps {
   label: string
   value: string | number
   icon: React.ComponentType<IconProps>
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
   return (
      <div className="p-6 border border-border rounded-lg bg-secondary/20 hover:border-accent hover:bg-secondary/30 smooth-transition">
         <div className="text-3xl mb-2">
            <Icon className="w-8 h-8 text-accent" />
         </div>
         <p className="text-sm text-muted-foreground font-normal-weight mb-1">{label}</p>
         <p className="text-3xl font-heavy text-accent">{value}</p>
      </div>
   )
}
