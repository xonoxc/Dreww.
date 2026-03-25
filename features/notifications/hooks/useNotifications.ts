import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
   fetchNotifications,
   markNotificationAsRead,
   deleteNotification,
   type Notification,
} from "@/lib/supabase/data-actions"
import { useAuth } from "@/features/auth/hooks/useAuth"

export const NOTIFICATIONS_QUERY_KEY = ["notifications"]

export const useNotifications = () => {
   const { user, loading: authLoading } = useAuth()

   return useQuery({
      queryKey: [...NOTIFICATIONS_QUERY_KEY, user?.id],
      queryFn: async () => {
         if (!user) return []
         const { data, error } = await fetchNotifications(user.id)
         if (error) {
            throw error
         }
         return data
      },
      enabled: !!user && !authLoading,
   })
}

export const useUnreadNotificationCount = () => {
   const { data: notifications } = useNotifications()
   return notifications?.filter(n => !n.read).length ?? 0
}

export const useMarkNotificationAsRead = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: async (notificationId: string) => {
         const { data, error } = await markNotificationAsRead(notificationId)
         if (error) {
            throw error
         }
         return data
      },
      onSuccess: (_data, notificationId) => {
         queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, old => {
            if (!old) return old
            return old.map(n =>
               n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
            )
         })
      },
   })
}

export const useDeleteNotification = () => {
   const queryClient = useQueryClient()

   return useMutation({
      mutationFn: async (notificationId: string) => {
         const { data, error } = await deleteNotification(notificationId)
         if (error) {
            throw error
         }
         return data
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      },
   })
}
