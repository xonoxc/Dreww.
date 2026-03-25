"use client"

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminOverview } from "@/features/admin/compoennts/AdminOverview"
import { DrawsManager } from "@/features/admin/compoennts/DrawsManager"
import { WinnerVerification } from "@/features/admin/compoennts/WinnerVerification"
import { AuditLogs } from "@/features/admin/compoennts/AuditLogs"
import Link from "next/link"
import SignOutBtn from "@/features/auth/components/SignOutBtn"

function OverviewSkeleton() {
   return (
      <div className="grid gap-4 md:grid-cols-5">
         {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
         ))}
      </div>
   )
}

function SectionSkeleton() {
   return (
      <div className="space-y-3">
         <Skeleton className="h-8 w-48 rounded-lg" />
         <Skeleton className="h-40 rounded-lg" />
      </div>
   )
}

export default function AdminPage() {
   return (
      <div className="space-y-12">
         {/* Overview Cards */}
         <Suspense fallback={<OverviewSkeleton />}>
            <AdminOverview />
         </Suspense>

         {/* Two Column Layout */}
         <div className="grid gap-12 lg:grid-cols-2">
            {/* Draws Manager */}
            <Suspense fallback={<SectionSkeleton />}>
               <DrawsManager />
            </Suspense>

            {/* Winner Verification */}
            <Suspense fallback={<SectionSkeleton />}>
               <WinnerVerification />
            </Suspense>
         </div>

         {/* Audit Logs */}
         <Suspense fallback={<SectionSkeleton />}>
            <AuditLogs />
         </Suspense>

         {/* Admin Resources */}
         <div className="rounded-lg border border-border bg-card/30 p-6">
            <h3 className="text-lg font-bold mb-4">Admin Resources</h3>
            <div className="grid gap-4 md:grid-cols-3">
               <Link
                  href="/admin/documentation"
                  className="group flex items-start gap-3 p-4 rounded-lg border border-border hover:border-accent hover:bg-card/50 transition-all"
               >
                  <span className="text-2xl">📚</span>
                  <div>
                     <h4 className="font-bold group-hover:text-accent">Admin Documentation</h4>
                     <p className="text-sm text-muted-foreground">
                        Complete guide to admin features
                     </p>
                  </div>
               </Link>

               <Link
                  href="/admin/user-management"
                  className="group flex items-start gap-3 p-4 rounded-lg border border-border hover:border-accent hover:bg-card/50 transition-all"
               >
                  <span className="text-2xl">👥</span>
                  <div>
                     <h4 className="font-bold group-hover:text-accent">User Management</h4>
                     <p className="text-sm text-muted-foreground">Manage platform users</p>
                  </div>
               </Link>

               <Link
                  href="/admin/system-settings"
                  className="group flex items-start gap-3 p-4 rounded-lg border border-border hover:border-accent hover:bg-card/50 transition-all"
               >
                  <span className="text-2xl">⚙️</span>
                  <div>
                     <h4 className="font-bold group-hover:text-accent">System Settings</h4>
                     <p className="text-sm text-muted-foreground">Configure platform settings</p>
                  </div>
               </Link>
            </div>
         </div>
      </div>
   )
}
