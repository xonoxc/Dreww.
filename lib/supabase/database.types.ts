export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
   // Allows to automatically instantiate createClient with right options
   // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
   __InternalSupabase: {
      PostgrestVersion: "14.4"
   }
   public: {
      Tables: {
         admin_logs: {
            Row: {
               action: string
               admin_id: string
               created_at: string | null
               details: Json | null
               entity_id: string | null
               entity_type: string | null
               id: string
               ip_address: string | null
            }
            Insert: {
               action: string
               admin_id: string
               created_at?: string | null
               details?: Json | null
               entity_id?: string | null
               entity_type?: string | null
               id?: string
               ip_address?: string | null
            }
            Update: {
               action?: string
               admin_id?: string
               created_at?: string | null
               details?: Json | null
               entity_id?: string | null
               entity_type?: string | null
               id?: string
               ip_address?: string | null
            }
            Relationships: [
               {
                  foreignKeyName: "admin_logs_admin_id_fkey"
                  columns: ["admin_id"]
                  isOneToOne: false
                  referencedRelation: "profiles"
                  referencedColumns: ["id"]
               },
            ]
         }
         charities: {
            Row: {
               category: string | null
               created_at: string | null
               description: string | null
               id: string
               logo_url: string | null
               mission: string | null
               name: string
               total_contributed: number | null
               updated_at: string | null
               verified: boolean | null
               website_url: string | null
            }
            Insert: {
               category?: string | null
               created_at?: string | null
               description?: string | null
               id?: string
               logo_url?: string | null
               mission?: string | null
               name: string
               total_contributed?: number | null
               updated_at?: string | null
               verified?: boolean | null
               website_url?: string | null
            }
            Update: {
               category?: string | null
               created_at?: string | null
               description?: string | null
               id?: string
               logo_url?: string | null
               mission?: string | null
               name?: string
               total_contributed?: number | null
               updated_at?: string | null
               verified?: boolean | null
               website_url?: string | null
            }
            Relationships: []
         }
         charity_contributions: {
            Row: {
               amount: number
               charity_id: string
               created_at: string | null
               draw_result_id: string | null
               id: string
               source: string | null
               user_id: string
            }
            Insert: {
               amount: number
               charity_id: string
               created_at?: string | null
               draw_result_id?: string | null
               id?: string
               source?: string | null
               user_id: string
            }
            Update: {
               amount?: number
               charity_id?: string
               created_at?: string | null
               draw_result_id?: string | null
               id?: string
               source?: string | null
               user_id?: string
            }
            Relationships: [
               {
                  foreignKeyName: "charity_contributions_charity_id_fkey"
                  columns: ["charity_id"]
                  isOneToOne: false
                  referencedRelation: "charities"
                  referencedColumns: ["id"]
               },
               {
                  foreignKeyName: "charity_contributions_draw_result_id_fkey"
                  columns: ["draw_result_id"]
                  isOneToOne: false
                  referencedRelation: "draw_results"
                  referencedColumns: ["id"]
               },
               {
                  foreignKeyName: "charity_contributions_user_id_fkey"
                  columns: ["user_id"]
                  isOneToOne: false
                  referencedRelation: "profiles"
                  referencedColumns: ["id"]
               },
            ]
         }
         draw_results: {
            Row: {
               claimed_at: string | null
               created_at: string | null
               draw_id: string
               id: string
               position: number
               prize_amount: number | null
               score_used: number | null
               status: string | null
               updated_at: string | null
               user_id: string
               verification_note: string | null
               verified_at: string | null
               verified_by: string | null
            }
            Insert: {
               claimed_at?: string | null
               created_at?: string | null
               draw_id: string
               id?: string
               position: number
               prize_amount?: number | null
               score_used?: number | null
               status?: string | null
               updated_at?: string | null
               user_id: string
               verification_note?: string | null
               verified_at?: string | null
               verified_by?: string | null
            }
            Update: {
               claimed_at?: string | null
               created_at?: string | null
               draw_id?: string
               id?: string
               position?: number
               prize_amount?: number | null
               score_used?: number | null
               status?: string | null
               updated_at?: string | null
               user_id?: string
               verification_note?: string | null
               verified_at?: string | null
               verified_by?: string | null
            }
            Relationships: [
               {
                  foreignKeyName: "draw_results_draw_id_fkey"
                  columns: ["draw_id"]
                  isOneToOne: false
                  referencedRelation: "draws"
                  referencedColumns: ["id"]
               },
               {
                  foreignKeyName: "draw_results_user_id_fkey"
                  columns: ["user_id"]
                  isOneToOne: false
                  referencedRelation: "profiles"
                  referencedColumns: ["id"]
               },
               {
                  foreignKeyName: "draw_results_verified_by_fkey"
                  columns: ["verified_by"]
                  isOneToOne: false
                  referencedRelation: "profiles"
                  referencedColumns: ["id"]
               },
            ]
         }
         draws: {
            Row: {
               closed_at: string | null
               completed_at: string | null
               created_at: string | null
               draw_type: string
               eligible_users_count: number | null
               first_place_pct: number | null
               id: string
               month: number
               prize_pool: number | null
               second_place_pct: number | null
               status: string | null
               third_place_pct: number | null
               year: number
            }
            Insert: {
               closed_at?: string | null
               completed_at?: string | null
               created_at?: string | null
               draw_type: string
               eligible_users_count?: number | null
               first_place_pct?: number | null
               id?: string
               month: number
               prize_pool?: number | null
               second_place_pct?: number | null
               status?: string | null
               third_place_pct?: number | null
               year: number
            }
            Update: {
               closed_at?: string | null
               completed_at?: string | null
               created_at?: string | null
               draw_type?: string
               eligible_users_count?: number | null
               first_place_pct?: number | null
               id?: string
               month?: number
               prize_pool?: number | null
               second_place_pct?: number | null
               status?: string | null
               third_place_pct?: number | null
               year?: number
            }
            Relationships: []
         }
         golf_scores: {
            Row: {
               course_name: string
               course_par: number | null
               created_at: string | null
               id: string
               notes: string | null
               score_date: string
               stableford_score: number
               updated_at: string | null
               user_id: string
            }
            Insert: {
               course_name: string
               course_par?: number | null
               created_at?: string | null
               id?: string
               notes?: string | null
               score_date: string
               stableford_score: number
               updated_at?: string | null
               user_id: string
            }
            Update: {
               course_name?: string
               course_par?: number | null
               created_at?: string | null
               id?: string
               notes?: string | null
               score_date?: string
               stableford_score?: number
               updated_at?: string | null
               user_id?: string
            }
            Relationships: [
               {
                  foreignKeyName: "golf_scores_user_id_fkey"
                  columns: ["user_id"]
                  isOneToOne: false
                  referencedRelation: "profiles"
                  referencedColumns: ["id"]
               },
            ]
         }
         notifications: {
            Row: {
               created_at: string | null
               data: Json | null
               id: string
               message: string | null
               read: boolean | null
               read_at: string | null
               title: string
               type: string
               user_id: string
            }
            Insert: {
               created_at?: string | null
               data?: Json | null
               id?: string
               message?: string | null
               read?: boolean | null
               read_at?: string | null
               title: string
               type: string
               user_id: string
            }
            Update: {
               created_at?: string | null
               data?: Json | null
               id?: string
               message?: string | null
               read?: boolean | null
               read_at?: string | null
               title?: string
               type?: string
               user_id?: string
            }
            Relationships: [
               {
                  foreignKeyName: "notifications_user_id_fkey"
                  columns: ["user_id"]
                  isOneToOne: false
                  referencedRelation: "profiles"
                  referencedColumns: ["id"]
               },
            ]
         }
         profiles: {
            Row: {
               avatar_url: string | null
               created_at: string | null
               email: string
               full_name: string | null
               handicap: number | null
               id: string
               is_admin: boolean | null
               preferred_charity_id: string | null
               subscription_end_date: string | null
               subscription_start_date: string | null
               subscription_status: string | null
               subscription_tier: string | null
               updated_at: string | null
            }
            Insert: {
               avatar_url?: string | null
               created_at?: string | null
               email: string
               full_name?: string | null
               handicap?: number | null
               id: string
               is_admin?: boolean | null
               preferred_charity_id?: string | null
               subscription_end_date?: string | null
               subscription_start_date?: string | null
               subscription_status?: string | null
               subscription_tier?: string | null
               updated_at?: string | null
            }
            Update: {
               avatar_url?: string | null
               created_at?: string | null
               email?: string
               full_name?: string | null
               handicap?: number | null
               id?: string
               is_admin?: boolean | null
               preferred_charity_id?: string | null
               subscription_end_date?: string | null
               subscription_start_date?: string | null
               subscription_status?: string | null
               subscription_tier?: string | null
               updated_at?: string | null
            }
            Relationships: []
         }
         subscriptions: {
            Row: {
               cancel_at: string | null
               cancelled_at: string | null
               created_at: string | null
               current_period_end: string | null
               current_period_start: string | null
               id: string
               status: string | null
               stripe_subscription_id: string | null
               tier: string
               updated_at: string | null
               user_id: string
            }
            Insert: {
               cancel_at?: string | null
               cancelled_at?: string | null
               created_at?: string | null
               current_period_end?: string | null
               current_period_start?: string | null
               id?: string
               status?: string | null
               stripe_subscription_id?: string | null
               tier: string
               updated_at?: string | null
               user_id: string
            }
            Update: {
               cancel_at?: string | null
               cancelled_at?: string | null
               created_at?: string | null
               current_period_end?: string | null
               current_period_start?: string | null
               id?: string
               status?: string | null
               stripe_subscription_id?: string | null
               tier?: string
               updated_at?: string | null
               user_id?: string
            }
            Relationships: [
               {
                  foreignKeyName: "subscriptions_user_id_fkey"
                  columns: ["user_id"]
                  isOneToOne: false
                  referencedRelation: "profiles"
                  referencedColumns: ["id"]
               },
            ]
         }
      }
      Views: {
         rolling_scores: {
            Row: {
               avg_last_five: number | null
               last_five_scores: number[] | null
               latest_score_date: string | null
               user_id: string | null
            }
            Relationships: [
               {
                  foreignKeyName: "golf_scores_user_id_fkey"
                  columns: ["user_id"]
                  isOneToOne: false
                  referencedRelation: "profiles"
                  referencedColumns: ["id"]
               },
            ]
         }
      }
      Functions: {
         exec_monthly_draw: { Args: never; Returns: Json }
      }
      Enums: {
         [_ in never]: never
      }
      CompositeTypes: {
         [_ in never]: never
      }
   }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
   DefaultSchemaTableNameOrOptions extends
      | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
      | { schema: keyof DatabaseWithoutInternals },
   TableName extends DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals
   }
      ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
           DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
   schema: keyof DatabaseWithoutInternals
}
   ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
        Row: infer R
     }
      ? R
      : never
   : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
          DefaultSchema["Views"])
     ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
          Row: infer R
       }
        ? R
        : never
     : never

export type TablesInsert<
   DefaultSchemaTableNameOrOptions extends
      | keyof DefaultSchema["Tables"]
      | { schema: keyof DatabaseWithoutInternals },
   TableName extends DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals
   }
      ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
   schema: keyof DatabaseWithoutInternals
}
   ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
     }
      ? I
      : never
   : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
     ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
          Insert: infer I
       }
        ? I
        : never
     : never

export type TablesUpdate<
   DefaultSchemaTableNameOrOptions extends
      | keyof DefaultSchema["Tables"]
      | { schema: keyof DatabaseWithoutInternals },
   TableName extends DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals
   }
      ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
   schema: keyof DatabaseWithoutInternals
}
   ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
     }
      ? U
      : never
   : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
     ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
          Update: infer U
       }
        ? U
        : never
     : never

export type Enums<
   DefaultSchemaEnumNameOrOptions extends
      | keyof DefaultSchema["Enums"]
      | { schema: keyof DatabaseWithoutInternals },
   EnumName extends DefaultSchemaEnumNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals
   }
      ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
      : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
   schema: keyof DatabaseWithoutInternals
}
   ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
   : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
     ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
     : never

export type CompositeTypes<
   PublicCompositeTypeNameOrOptions extends
      | keyof DefaultSchema["CompositeTypes"]
      | { schema: keyof DatabaseWithoutInternals },
   CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals
   }
      ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
      : never = never,
> = PublicCompositeTypeNameOrOptions extends {
   schema: keyof DatabaseWithoutInternals
}
   ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
   : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
     ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
     : never

export const Constants = {
   public: {
      Enums: {},
   },
} as const
