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
      bookings: {
        Row: {
          additional_notes: string | null
          booking_date: string
          created_at: string
          destination: string
          id: string
          origin: string
          passengers: number | null
          reference_code: string
          return_date: string | null
          status: string
          total_price: number
          travel_date: string
          user_id: string
          vehicle_type: string | null
        }
        Insert: {
          additional_notes?: string | null
          booking_date: string
          created_at?: string
          destination: string
          id?: string
          origin: string
          passengers?: number | null
          reference_code: string
          return_date?: string | null
          status?: string
          total_price: number
          travel_date: string
          user_id: string
          vehicle_type?: string | null
        }
        Update: {
          additional_notes?: string | null
          booking_date?: string
          created_at?: string
          destination?: string
          id?: string
          origin?: string
          passengers?: number | null
          reference_code?: string
          return_date?: string | null
          status?: string
          total_price?: number
          travel_date?: string
          user_id?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          cnpj: string | null
          created_at: string | null
          id: string
          last_order_assigned: string | null
          name: string
          queue_position: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          last_order_assigned?: string | null
          name: string
          queue_position?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          last_order_assigned?: string | null
          name?: string
          queue_position?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          id: string
          is_password_changed: boolean | null
          last_login: string | null
          license_number: string | null
          name: string
          phone: string | null
          status: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_password_changed?: boolean | null
          last_login?: string | null
          license_number?: string | null
          name: string
          phone?: string | null
          status?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_password_changed?: boolean | null
          last_login?: string | null
          license_number?: string | null
          name?: string
          phone?: string | null
          status?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: []
      }
      service_orders: {
        Row: {
          company_id: string
          created_at: string
          delivery_date: string | null
          destination: string
          driver_id: string | null
          id: string
          notes: string | null
          origin: string
          pickup_date: string
          status: string
          vehicle_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          delivery_date?: string | null
          destination: string
          driver_id?: string | null
          id?: string
          notes?: string | null
          origin: string
          pickup_date: string
          status?: string
          vehicle_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          delivery_date?: string | null
          destination?: string
          driver_id?: string | null
          id?: string
          notes?: string | null
          origin?: string
          pickup_date?: string
          status?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          license_plate: string
          model: string
          status: string
          year: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          license_plate: string
          model: string
          status?: string
          year?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          license_plate?: string
          model?: string
          status?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
