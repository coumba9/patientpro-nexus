export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_metrics: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          period: string
          updated_at: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          period: string
          updated_at?: string
          value: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          period?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      appointments: {
        Row: {
          cancellation_reason: string | null
          cancellation_type: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          date: string
          doctor_id: string
          id: string
          location: string | null
          mode: string
          notes: string | null
          patient_id: string
          previous_date: string | null
          previous_time: string | null
          reschedule_reason: string | null
          reschedule_requested_at: string | null
          reschedule_requested_by: string | null
          status: string
          time: string
          type: string
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancellation_type?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          date: string
          doctor_id: string
          id?: string
          location?: string | null
          mode?: string
          notes?: string | null
          patient_id: string
          previous_date?: string | null
          previous_time?: string | null
          reschedule_reason?: string | null
          reschedule_requested_at?: string | null
          reschedule_requested_by?: string | null
          status?: string
          time: string
          type?: string
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancellation_type?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          date?: string
          doctor_id?: string
          id?: string
          location?: string | null
          mode?: string
          notes?: string | null
          patient_id?: string
          previous_date?: string | null
          previous_time?: string | null
          reschedule_reason?: string | null
          reschedule_requested_at?: string | null
          reschedule_requested_by?: string | null
          status?: string
          time?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_policies: {
        Row: {
          created_at: string
          id: string
          minimum_hours_before: number
          updated_at: string
          user_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          minimum_hours_before?: number
          updated_at?: string
          user_type: string
        }
        Update: {
          created_at?: string
          id?: string
          minimum_hours_before?: number
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      doctor_applications: {
        Row: {
          created_at: string
          diploma_url: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          license_number: string
          license_url: string | null
          other_documents_urls: string[] | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          specialty_id: string | null
          status: string
          updated_at: string
          years_of_experience: number
        }
        Insert: {
          created_at?: string
          diploma_url?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          license_number: string
          license_url?: string | null
          other_documents_urls?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialty_id?: string | null
          status?: string
          updated_at?: string
          years_of_experience: number
        }
        Update: {
          created_at?: string
          diploma_url?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          license_number?: string
          license_url?: string | null
          other_documents_urls?: string[] | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialty_id?: string | null
          status?: string
          updated_at?: string
          years_of_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "doctor_applications_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          latitude: number | null
          license_number: string
          longitude: number | null
          specialty_id: string | null
          updated_at: string
          years_of_experience: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id: string
          is_verified?: boolean | null
          latitude?: number | null
          license_number: string
          longitude?: number | null
          specialty_id?: string | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          license_number?: string
          longitude?: number | null
          specialty_id?: string | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          doctor_id: string
          file_size: number | null
          file_url: string | null
          id: string
          is_signed: boolean
          patient_id: string
          signed_at: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_signed?: boolean
          patient_id: string
          signed_at?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_signed?: boolean
          patient_id?: string
          signed_at?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          created_at: string
          date: string
          diagnosis: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          prescription: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          diagnosis: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          prescription?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          diagnosis?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          prescription?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          appointment_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      moderation_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_id: string | null
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          date: string
          doctor_id: string
          id: string
          patient_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          date: string
          doctor_id: string
          id?: string
          patient_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          allergies: string[] | null
          birth_date: string | null
          blood_type: string | null
          created_at: string
          gender: string | null
          id: string
          medical_record_id: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string
          gender?: string | null
          id: string
          medical_record_id?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string
          gender?: string | null
          id?: string
          medical_record_id?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      queue_entries: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          preferred_dates: string[] | null
          requested_doctor_id: string | null
          specialty_id: string | null
          status: string
          updated_at: string
          urgency: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          preferred_dates?: string[] | null
          requested_doctor_id?: string | null
          specialty_id?: string | null
          status?: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          preferred_dates?: string[] | null
          requested_doctor_id?: string | null
          specialty_id?: string | null
          status?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          appointment_id: string
          comment: string | null
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          appointment_id: string
          comment?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          comment?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          appointment_id: string
          attempts: number
          created_at: string
          id: string
          method: string
          patient_id: string
          reminder_type: string
          scheduled_for: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          attempts?: number
          created_at?: string
          id?: string
          method: string
          patient_id: string
          reminder_type: string
          scheduled_for: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          attempts?: number
          created_at?: string
          id?: string
          method?: string
          patient_id?: string
          reminder_type?: string
          scheduled_for?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          created_at: string | null
          id: string
          message: string
          phone_number: string
          provider_response: Json | null
          sent_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          phone_number: string
          provider_response?: Json | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          phone_number?: string
          provider_response?: Json | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          total_doctors: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          total_doctors?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          total_doctors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_available_doctors: {
        Args: { specialty_filter?: string; verified_only?: boolean }
        Returns: {
          email: string
          first_name: string
          id: string
          is_verified: boolean
          last_name: string
          license_number: string
          specialty_id: string
          specialty_name: string
          years_of_experience: number
        }[]
      }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_doctor_brief: {
        Args: { doctor_id: string }
        Returns: {
          email: string
          first_name: string
          id: string
          last_name: string
          specialty_id: string
          specialty_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "doctor" | "patient"
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
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    Enums: {
      app_role: ["admin", "doctor", "patient"],
    },
  },
} as const
