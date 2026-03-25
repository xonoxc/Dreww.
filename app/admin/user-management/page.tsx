"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import BackBtn from "@/components/BackBtn"

interface UserProfile {
   id: string
   email: string
   full_name: string | null
   golf_handicap: number | null
   is_admin: boolean
   subscription_tier: "free" | "premium" | "elite" | null
   created_at: string
   total_scores: number
}

const USERS_QUERY_KEY = ["admin", "users"]

const fetchUsers = async (sortBy: string): Promise<UserProfile[]> => {
   const { data, error } = await apiClient
      .from("profiles")
      .select("*")
      .order(sortBy as any, { ascending: false })

   if (error) throw error
   return data || []
}

const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
   const { error } = await apiClient
      .from("profiles")
      .update({ is_admin: !isAdmin })
      .eq("id", userId)

   if (error) throw error
}

export default function UserManagementPage() {
   const [searchTerm, setSearchTerm] = useState("")
   const [sortBy, setSortBy] = useState("created_at")
   const queryClient = useQueryClient()

   const { data: users = [], isLoading: loading } = useQuery({
      queryKey: [...USERS_QUERY_KEY, sortBy],
      queryFn: () => fetchUsers(sortBy),
   })

   const toggleAdminMutation = useMutation({
      mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
         toggleAdminStatus(userId, isAdmin),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      },
   })

   const filteredUsers = users.filter(
      user =>
         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
   )

   const handleToggleAdmin = (userId: string, isAdmin: boolean) => {
      toggleAdminMutation.mutate({ userId, isAdmin })
   }

   return (
      <div className="space-y-6">
         <div className="flex  gap-4 px-3 flex-col">
            <BackBtn className="w-fit" />
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">View and manage platform users</p>
         </div>

         {/* Search and Filter */}
         <div className="flex gap-4 px-3 items-center justify-around">
            <input
               type="text"
               placeholder="Search users by name or email..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />

            <select
               value={sortBy}
               onChange={e => setSortBy(e.target.value)}
               className="px-12 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
               <option value="created_at">Newest First</option>
               <option value="full_name">Name</option>
               <option value="email">Email</option>
               <option value="subscription_tier">Subscription</option>
            </select>
         </div>

         {/* Users Table */}
         <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-border bg-secondary/30">
                        <th className="px-6 py-3 text-left text-sm font-bold text-foreground">
                           User
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-foreground">
                           Golf Handicap
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-foreground">
                           Subscription
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-foreground">
                           Scores
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-foreground">
                           Admin
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-foreground">
                           Actions
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                           <tr key={i} className="border-b border-border">
                              <td className="px-6 py-4">
                                 <Skeleton className="h-4 w-48" />
                              </td>
                              <td className="px-6 py-4">
                                 <Skeleton className="h-4 w-12" />
                              </td>
                              <td className="px-6 py-4">
                                 <Skeleton className="h-4 w-20" />
                              </td>
                              <td className="px-6 py-4">
                                 <Skeleton className="h-4 w-8" />
                              </td>
                              <td className="px-6 py-4">
                                 <Skeleton className="h-4 w-10" />
                              </td>
                              <td className="px-6 py-4">
                                 <Skeleton className="h-4 w-24" />
                              </td>
                           </tr>
                        ))
                     ) : filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                           <tr
                              key={user.id}
                              className="border-b border-border hover:bg-secondary/20 transition-all duration-300 ease-out"
                           >
                              <td className="px-6 py-4">
                                 <div>
                                    <p className="font-medium text-foreground">
                                       {user.full_name || "N/A"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                 {user.golf_handicap !== null
                                    ? user.golf_handicap?.toFixed(1)
                                    : "N/A"}
                              </td>
                              <td className="px-6 py-4">
                                 <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                       user.subscription_tier === "elite"
                                          ? "bg-yellow-500/20 text-yellow-400"
                                          : user.subscription_tier === "premium"
                                            ? "bg-blue-500/20 text-blue-400"
                                            : "bg-gray-500/20 text-gray-400"
                                    }`}
                                 >
                                    {user.subscription_tier?.charAt(0).toUpperCase() +
                                       (user.subscription_tier?.slice(1) || "")}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">
                                 {user.total_scores || 0}
                              </td>
                              <td className="px-6 py-4">
                                 {user.is_admin ? (
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                                       Admin
                                    </span>
                                 ) : (
                                    <span className="text-xs text-muted-foreground">User</span>
                                 )}
                              </td>
                              <td className="px-6 py-4">
                                 <Button
                                    onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    disabled={toggleAdminMutation.isPending}
                                 >
                                    {user.is_admin ? "Remove Admin" : "Make Admin"}
                                 </Button>
                              </td>
                           </tr>
                        ))
                     ) : (
                        <tr>
                           <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                              No users found matching your search.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Stats */}
         <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card/50 p-4">
               <p className="text-sm text-muted-foreground">Total Users</p>
               <p className="text-2xl font-bold mt-2">{users.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4">
               <p className="text-sm text-muted-foreground">Admins</p>
               <p className="text-2xl font-bold mt-2">{users.filter(u => u.is_admin).length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4">
               <p className="text-sm text-muted-foreground">Premium Users</p>
               <p className="text-2xl font-bold mt-2">
                  {users.filter(u => u.subscription_tier === "premium").length}
               </p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4">
               <p className="text-sm text-muted-foreground">Elite Users</p>
               <p className="text-2xl font-bold mt-2">
                  {users.filter(u => u.subscription_tier === "elite").length}
               </p>
            </div>
         </div>
      </div>
   )
}
