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
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          company_id: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string
          destination: string
          driver_id: string | null
          driver_name: string | null
          driver_phone: string | null
          id: string
          origin: string
          passenger_data: Json | null
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
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_id?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          destination: string
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          origin: string
          passenger_data?: Json | null
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
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_id?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          destination?: string
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          origin?: string
          passenger_data?: Json | null
          passengers?: number | null
          reference_code?: string
          return_date?: string | null
          status?: string
          total_price?: number
          travel_date?: string
          user_id?: string
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          address: string | null
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      city_distances: {
        Row: {
          created_at: string | null
          destination_id: string
          distance: number
          duration: number
          id: string
          origin_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          destination_id: string
          distance: number
          duration: number
          id?: string
          origin_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          destination_id?: string
          distance?: number
          duration?: number
          id?: string
          origin_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_distances_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_distances_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
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
      driver_locations: {
        Row: {
          accuracy: number | null
          driver_id: string
          eta_seconds: number | null
          heading: number | null
          latitude: number
          longitude: number
          order_id: string | null
          speed: number | null
          timestamp: string
        }
        Insert: {
          accuracy?: number | null
          driver_id: string
          eta_seconds?: number | null
          heading?: number | null
          latitude: number
          longitude: number
          order_id?: string | null
          speed?: number | null
          timestamp?: string
        }
        Update: {
          accuracy?: number | null
          driver_id?: string
          eta_seconds?: number | null
          heading?: number | null
          latitude?: number
          longitude?: number
          order_id?: string | null
          speed?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_locations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_ratings: {
        Row: {
          created_at: string
          customer_id: string | null
          driver_id: string
          feedback: string | null
          id: string
          order_id: string
          rating: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          driver_id: string
          feedback?: string | null
          id?: string
          order_id: string
          rating: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          driver_id?: string
          feedback?: string | null
          id?: string
          order_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "driver_ratings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          assignment_score: number | null
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
          assignment_score?: number | null
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
          assignment_score?: number | null
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
      financial_metrics: {
        Row: {
          company_id: string
          created_at: string
          date: string
          expenses: number | null
          id: string
          orders_count: number | null
          profit: number | null
          revenue: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          date: string
          expenses?: number | null
          id?: string
          orders_count?: number | null
          profit?: number | null
          revenue?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          date?: string
          expenses?: number | null
          id?: string
          orders_count?: number | null
          profit?: number | null
          revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_styles: {
        Row: {
          created_at: string | null
          description_color: string
          gradient_from_color: string
          gradient_from_opacity: number
          gradient_to_color: string
          gradient_to_opacity: number
          id: string
          title_color: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_color?: string
          gradient_from_color?: string
          gradient_from_opacity?: number
          gradient_to_color?: string
          gradient_to_opacity?: number
          id?: string
          title_color?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_color?: string
          gradient_from_color?: string
          gradient_from_opacity?: number
          gradient_to_color?: string
          gradient_to_opacity?: number
          id?: string
          title_color?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      investor_company_shares: {
        Row: {
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          investor_id: string
          percentage: number
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          investor_id: string
          percentage: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          investor_id?: string
          percentage?: number
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_company_shares_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_company_shares_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      section_order: {
        Row: {
          componentpath: string
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          componentpath: string
          created_at?: string
          description?: string | null
          id: string
          name: string
          sort_order: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          componentpath?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
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
          passenger_data: Json | null
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
          passenger_data?: Json | null
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
          passenger_data?: Json | null
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
      service_requests: {
        Row: {
          additional_info: string | null
          company_id: string | null
          created_at: string | null
          destination: string
          email: string
          id: string
          name: string
          origin: string
          passengers: string
          phone: string
          request_date: string | null
          service_type: string
          status: string | null
        }
        Insert: {
          additional_info?: string | null
          company_id?: string | null
          created_at?: string | null
          destination: string
          email: string
          id?: string
          name: string
          origin: string
          passengers: string
          phone: string
          request_date?: string | null
          service_type: string
          status?: string | null
        }
        Update: {
          additional_info?: string | null
          company_id?: string | null
          created_at?: string | null
          destination?: string
          email?: string
          id?: string
          name?: string
          origin?: string
          passengers?: string
          phone?: string
          request_date?: string | null
          service_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      site_images: {
        Row: {
          component_path: string | null
          created_at: string | null
          id: string
          image_url: string
          section_id: string
          updated_at: string | null
        }
        Insert: {
          component_path?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          section_id: string
          updated_at?: string | null
        }
        Update: {
          component_path?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          section_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_logos: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string
          mode: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url: string
          mode: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string
          mode?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          category: string
          created_at: string
          details: Json | null
          id: string
          message: string
          severity: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: Json | null
          id?: string
          message: string
          severity: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: Json | null
          id?: string
          message?: string
          severity?: string
        }
        Relationships: []
      }
      vehicle_rates: {
        Row: {
          baseprice: number
          capacity: number
          created_at: string | null
          id: string
          name: string
          priceperkm: number
          updated_at: string | null
        }
        Insert: {
          baseprice?: number
          capacity?: number
          created_at?: string | null
          id: string
          name: string
          priceperkm?: number
          updated_at?: string | null
        }
        Update: {
          baseprice?: number
          capacity?: number
          created_at?: string | null
          id?: string
          name?: string
          priceperkm?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          license_plate: string
          model: string
          status: string
          type: string | null
          year: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          license_plate: string
          model: string
          status?: string
          type?: string | null
          year?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          license_plate?: string
          model?: string
          status?: string
          type?: string | null
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
      admin_create_test_service_order: {
        Args: {
          company_id: string
          origin_location: string
          destination_location: string
          pickup_time: string
          order_notes?: string
        }
        Returns: Json
      }
      admin_delete_financial_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      exec_sql: {
        Args: { query: string }
        Returns: Json
      }
      get_driver_rating: {
        Args: { driver_id: string }
        Returns: number
      }
      increment_queue_position: {
        Args: { row_id: string }
        Returns: number
      }
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
