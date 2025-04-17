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
        Relationships: []
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
      toners: {
        Row: {
          brand: string
          color: string
          compatible_printers: Json | null
          created_at: string
          id: string
          model: string
          page_yield: number
          stock: number
          threshold: number
          updated_at: string
        }
        Insert: {
          brand: string
          color: string
          compatible_printers?: Json | null
          created_at?: string
          id?: string
          model: string
          page_yield: number
          stock?: number
          threshold?: number
          updated_at?: string
        }
        Update: {
          brand?: string
          color?: string
          compatible_printers?: Json | null
          created_at?: string
          id?: string
          model?: string
          page_yield?: number
          stock?: number
          threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
