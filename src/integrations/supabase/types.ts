export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      commercial_toner_products: {
        Row: {
          category: string[] | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          reorder_point: number
          sku: string
          stock_level: number
          toner_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          reorder_point?: number
          sku: string
          stock_level?: number
          toner_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          reorder_point?: number
          sku?: string
          stock_level?: number
          toner_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_toner_products_toner_id_fkey"
            columns: ["toner_id"]
            isOneToOne: false
            referencedRelation: "toners"
            referencedColumns: ["id"]
          },
        ]
      }
      frontend_settings: {
        Row: {
          created_at: string
          id: string
          settings: Json | null
          store_info: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json | null
          store_info?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json | null
          store_info?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_records: {
        Row: {
          activity_type: string | null
          completed_at: string | null
          cost: number | null
          created_at: string
          diagnosed_by: string | null
          diagnosis_date: string | null
          diagnostic_notes: string | null
          id: string
          issue_description: string | null
          next_maintenance_date: string | null
          parts_used: Json | null
          printer_id: string | null
          remarks: string | null
          repair_notes: string | null
          reported_at: string | null
          reported_by: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          technician: string | null
          updated_at: string
        }
        Insert: {
          activity_type?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          diagnosed_by?: string | null
          diagnosis_date?: string | null
          diagnostic_notes?: string | null
          id?: string
          issue_description?: string | null
          next_maintenance_date?: string | null
          parts_used?: Json | null
          printer_id?: string | null
          remarks?: string | null
          repair_notes?: string | null
          reported_at?: string | null
          reported_by?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          technician?: string | null
          updated_at?: string
        }
        Update: {
          activity_type?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          diagnosed_by?: string | null
          diagnosis_date?: string | null
          diagnostic_notes?: string | null
          id?: string
          issue_description?: string | null
          next_maintenance_date?: string | null
          parts_used?: Json | null
          printer_id?: string | null
          remarks?: string | null
          repair_notes?: string | null
          reported_at?: string | null
          reported_by?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          technician?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_reports: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          maintenance_record_id: string | null
          report_content: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          maintenance_record_id?: string | null
          report_content: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          maintenance_record_id?: string | null
          report_content?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_reports_maintenance_record_id_fkey"
            columns: ["maintenance_record_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
        ]
      }
      printer_client_assignments: {
        Row: {
          assigned_at: string
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          printer_id: string
          unassigned_at: string | null
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          printer_id: string
          unassigned_at?: string | null
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          printer_id?: string
          unassigned_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "printer_client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "printer_client_assignments_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
        ]
      }
      printer_toner_compatibility: {
        Row: {
          created_at: string
          id: string
          printer_wiki_id: string
          toner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          printer_wiki_id: string
          toner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          printer_wiki_id?: string
          toner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "printer_toner_compatibility_printer_wiki_id_fkey"
            columns: ["printer_wiki_id"]
            isOneToOne: false
            referencedRelation: "printer_wiki"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "printer_toner_compatibility_toner_id_fkey"
            columns: ["toner_id"]
            isOneToOne: false
            referencedRelation: "toners"
            referencedColumns: ["id"]
          },
        ]
      }
      printer_wiki: {
        Row: {
          created_at: string
          id: string
          maintenance_tips: string | null
          make: string
          model: string
          series: string
          specs: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          maintenance_tips?: string | null
          make: string
          model: string
          series: string
          specs?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          maintenance_tips?: string | null
          make?: string
          model?: string
          series?: string
          specs?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      printers: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string
          department: string | null
          id: string
          is_for_rent: boolean | null
          location: string | null
          make: string
          model: string
          owned_by: string
          series: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          department?: string | null
          id?: string
          is_for_rent?: boolean | null
          location?: string | null
          make: string
          model: string
          owned_by: string
          series: string
          status: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          department?: string | null
          id?: string
          is_for_rent?: boolean | null
          location?: string | null
          make?: string
          model?: string
          owned_by?: string
          series?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "printers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      rental_options: {
        Row: {
          availability: Json | null
          cancellation_policy: string | null
          created_at: string
          duration_unit: string
          id: string
          is_for_rent: boolean | null
          minimum_duration: number
          printer_id: string
          rate_unit: string
          rental_rate: number
          security_deposit: number
          terms: string | null
          updated_at: string
        }
        Insert: {
          availability?: Json | null
          cancellation_policy?: string | null
          created_at?: string
          duration_unit: string
          id?: string
          is_for_rent?: boolean | null
          minimum_duration: number
          printer_id: string
          rate_unit: string
          rental_rate: number
          security_deposit: number
          terms?: string | null
          updated_at?: string
        }
        Update: {
          availability?: Json | null
          cancellation_policy?: string | null
          created_at?: string
          duration_unit?: string
          id?: string
          is_for_rent?: boolean | null
          minimum_duration?: number
          printer_id?: string
          rate_unit?: string
          rental_rate?: number
          security_deposit?: number
          terms?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_options_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          agreement_url: string | null
          booking_count: number | null
          client: string
          client_id: string | null
          created_at: string
          end_date: string
          id: string
          inquiry_count: number | null
          next_available_date: string | null
          printer: string
          printer_id: string | null
          signature_url: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          agreement_url?: string | null
          booking_count?: number | null
          client: string
          client_id?: string | null
          created_at?: string
          end_date: string
          id?: string
          inquiry_count?: number | null
          next_available_date?: string | null
          printer: string
          printer_id?: string | null
          signature_url?: string | null
          start_date: string
          status: string
          updated_at?: string
        }
        Update: {
          agreement_url?: string | null
          booking_count?: number | null
          client?: string
          client_id?: string | null
          created_at?: string
          end_date?: string
          id?: string
          inquiry_count?: number | null
          next_available_date?: string | null
          printer?: string
          printer_id?: string | null
          signature_url?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          live_chat: Json | null
          office_hours: string | null
          phone_number: string | null
          social_media: Json | null
          store_name: string
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          live_chat?: Json | null
          office_hours?: string | null
          phone_number?: string | null
          social_media?: Json | null
          store_name: string
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          live_chat?: Json | null
          office_hours?: string | null
          phone_number?: string | null
          social_media?: Json | null
          store_name?: string
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      toners: {
        Row: {
          aliases: Json | null
          base_model_reference: string | null
          brand: string
          category: string[] | null
          color: string
          compatible_printers: Json | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_base_model: boolean | null
          is_commercial_product: boolean | null
          model: string
          oem_code: string | null
          page_yield: number
          sku: string | null
          stock: number
          threshold: number
          updated_at: string
          variant_details: Json | null
          variant_group_id: string | null
          variant_name: string | null
        }
        Insert: {
          aliases?: Json | null
          base_model_reference?: string | null
          brand: string
          category?: string[] | null
          color: string
          compatible_printers?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_base_model?: boolean | null
          is_commercial_product?: boolean | null
          model: string
          oem_code?: string | null
          page_yield: number
          sku?: string | null
          stock?: number
          threshold?: number
          updated_at?: string
          variant_details?: Json | null
          variant_group_id?: string | null
          variant_name?: string | null
        }
        Update: {
          aliases?: Json | null
          base_model_reference?: string | null
          brand?: string
          category?: string[] | null
          color?: string
          compatible_printers?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_base_model?: boolean | null
          is_commercial_product?: boolean | null
          model?: string
          oem_code?: string | null
          page_yield?: number
          sku?: string | null
          stock?: number
          threshold?: number
          updated_at?: string
          variant_details?: Json | null
          variant_group_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_base_model"
            columns: ["base_model_reference"]
            isOneToOne: false
            referencedRelation: "toners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_variant_group"
            columns: ["variant_group_id"]
            isOneToOne: false
            referencedRelation: "toners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      chat_type: "messenger" | "whatsapp" | "custom"
      maintenance_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "unrepairable"
        | "decommissioned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      chat_type: ["messenger", "whatsapp", "custom"],
      maintenance_status: [
        "pending",
        "in_progress",
        "completed",
        "unrepairable",
        "decommissioned",
      ],
    },
  },
} as const
