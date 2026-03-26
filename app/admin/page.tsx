"use client"

import { Suspense } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminOverview } from "@/features/admin/compoennts/AdminOverview"
import { DrawsManager } from "@/features/admin/compoennts/DrawsManager"
import { WinnerVerification } from "@/features/admin/compoennts/WinnerVerification"
import { AuditLogs } from "@/features/admin/compoennts/AuditLogs"
import { UserManagement } from "@/features/admin/compoennts/UserManagement"
import { IconLayoutDashboard, IconTrophy, IconHistory, IconUsers } from "@tabler/icons-react"

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
      <div className="space-y-8">
         {/* Overview - Always Visible */}
         <Suspense fallback={<OverviewSkeleton />}>
            <AdminOverview />
         </Suspense>

         {/* Tabs */}
         <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
               <TabsTrigger value="overview" className="gap-2">
                  <IconLayoutDashboard className="w-4 h-4" />
                  Overview
               </TabsTrigger>
               <TabsTrigger value="winners" className="gap-2">
                  <IconTrophy className="w-4 h-4" />
                  Winners
               </TabsTrigger>
               <TabsTrigger value="audit" className="gap-2">
                  <IconHistory className="w-4 h-4" />
                  Audit Logs
               </TabsTrigger>
               <TabsTrigger value="users" className="gap-2">
                  <IconUsers className="w-4 h-4" />
                  Users
               </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
               <Suspense fallback={<SectionSkeleton />}>
                  <DrawsManager />
               </Suspense>
            </TabsContent>

            <TabsContent value="winners">
               <Suspense fallback={<SectionSkeleton />}>
                  <WinnerVerification />
               </Suspense>
            </TabsContent>

            <TabsContent value="audit">
               <Suspense fallback={<SectionSkeleton />}>
                  <AuditLogs />
               </Suspense>
            </TabsContent>

            <TabsContent value="users">
               <Suspense fallback={<SectionSkeleton />}>
                  <UserManagement />
               </Suspense>
            </TabsContent>
         </Tabs>
      </div>
   )
}
