import { apiClient } from "@/lib/supabase/client"
import { Database, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types"

export type GolfScore = Database["public"]["Tables"]["golf_scores"]["Row"]
export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"]
export type Charity = Database["public"]["Tables"]["charities"]["Row"]
export type Draw = Database["public"]["Tables"]["draws"]["Row"]
export type DrawResult = Database["public"]["Tables"]["draw_results"]["Row"]
export type Notification = Database["public"]["Tables"]["notifications"]["Row"]

export const getErrorMessage = (error: unknown): string => {
   if (error instanceof Error) return error.message
   return "An unexpected error occurred"
}

export const fetchProfile = async (userId: string) => {
   return apiClient.from("profiles").select("*").eq("id", userId).single()
}

export const updateProfile = async (
   userId: string,
   updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>
) => {
   return apiClient.from("profiles").update(updates).eq("id", userId).select().single()
}

export const fetchDraws = async () => {
   return apiClient.from("draws").select("*").order("created_at", {
      ascending: false,
   })
}

export const fetchDrawResults = async (drawId: string) => {
   return apiClient
      .from("draw_results")
      .select("*")
      .eq("draw_id", drawId)
      .order("position", { ascending: true })
}

export const fetchNotifications = async (userId: string) => {
   return apiClient
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
}

export const markNotificationAsRead = async (notificationId: string) => {
   return apiClient
      .from("notifications")
      .update({
         read: true,
         read_at: new Date().toISOString(),
      } as TablesUpdate<"notifications">)
      .eq("id", notificationId)
}

export const deleteNotification = async (notificationId: string) => {
   return apiClient.from("notifications").delete().eq("id", notificationId)
}

export const fetchGolfScores = async (userId: string) => {
   return apiClient
      .from("golf_scores")
      .select("*")
      .eq("user_id", userId)
      .order("score_date", { ascending: false })
}

export const addGolfScore = async (userId: string, scoreData: TablesInsert<"golf_scores">) => {
   return apiClient
      .from("golf_scores")
      .insert([{ ...scoreData, user_id: userId }])
      .select()
      .single()
}

export const deleteGolfScore = async (scoreId: string) => {
   return apiClient.from("golf_scores").delete().eq("id", scoreId)
}

export const fetchCharities = async () => {
   return apiClient
      .from("charities")
      .select("*")
      .eq("verified", true)
      .order("total_contributed", { ascending: false })
}
