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
      locations: {
        Row: {
          coordinates: Json | null
          created_at: string | null
          full_path: string | null
          id: string
          name: string
          parent_location_id: string | null
          status_id: number
          type_id: string
          updated_at: string | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string | null
          full_path?: string | null
          id?: string
          name: string
          parent_location_id?: string | null
          status_id: number
          type_id: string
          updated_at?: string | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string | null
          full_path?: string | null
          id?: string
          name?: string
          parent_location_id?: string | null
          status_id?: number
          type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_location_id_fkey"
            columns: ["parent_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "master_data"
            referencedColumns: ["id"]
          },
        ]
      }
      master_data: {
        Row: {
          category: string
          created_at: string | null
          id: string
          label: string
          sort_order: number
          status: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          label: string
          sort_order?: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          label?: string
          sort_order?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          aerosol: boolean | null
          approval_status_id: number | null
          brand_name: string | null
          created_at: string | null
          cryogenic_fluid: boolean | null
          description: string | null
          id: string
          other_names: string | null
          product_code: string
          product_name: string
          product_set: boolean | null
          product_status_id: number | null
          sds_id: string | null
          unit: string
          unit_size: number | null
          updated_at: string | null
          uses: string | null
        }
        Insert: {
          aerosol?: boolean | null
          approval_status_id?: number | null
          brand_name?: string | null
          created_at?: string | null
          cryogenic_fluid?: boolean | null
          description?: string | null
          id?: string
          other_names?: string | null
          product_code: string
          product_name: string
          product_set?: boolean | null
          product_status_id?: number | null
          sds_id?: string | null
          unit: string
          unit_size?: number | null
          updated_at?: string | null
          uses?: string | null
        }
        Update: {
          aerosol?: boolean | null
          approval_status_id?: number | null
          brand_name?: string | null
          created_at?: string | null
          cryogenic_fluid?: boolean | null
          description?: string | null
          id?: string
          other_names?: string | null
          product_code?: string
          product_name?: string
          product_set?: boolean | null
          product_status_id?: number | null
          sds_id?: string | null
          unit?: string
          unit_size?: number | null
          updated_at?: string | null
          uses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_approval_status_id_fkey"
            columns: ["approval_status_id"]
            isOneToOne: false
            referencedRelation: "status_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_product_status_id_fkey"
            columns: ["product_status_id"]
            isOneToOne: false
            referencedRelation: "status_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sds_id_fkey"
            columns: ["sds_id"]
            isOneToOne: false
            referencedRelation: "sds"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          id: string
          role_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sds: {
        Row: {
          created_at: string | null
          current_content_type: string | null
          current_file_name: string | null
          current_file_path: string | null
          current_file_size: number | null
          dg_class_id: string | null
          dg_subdivision_id: string | null
          emergency_phone: string | null
          expiry_date: string | null
          hazchem_code: string | null
          id: string
          is_dg: boolean | null
          issue_date: string | null
          other_names: string | null
          packing_group_id: string | null
          product_id: string
          product_name: string
          request_date: string | null
          request_information: string | null
          request_supplier_details: string | null
          request_supplier_name: string | null
          requested_by: string | null
          revision_date: string | null
          status_id: number
          subsidiary_dg_class_id: string | null
          supplier_id: string
          un_number: string | null
          un_proper_shipping_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_content_type?: string | null
          current_file_name?: string | null
          current_file_path?: string | null
          current_file_size?: number | null
          dg_class_id?: string | null
          dg_subdivision_id?: string | null
          emergency_phone?: string | null
          expiry_date?: string | null
          hazchem_code?: string | null
          id?: string
          is_dg?: boolean | null
          issue_date?: string | null
          other_names?: string | null
          packing_group_id?: string | null
          product_id: string
          product_name: string
          request_date?: string | null
          request_information?: string | null
          request_supplier_details?: string | null
          request_supplier_name?: string | null
          requested_by?: string | null
          revision_date?: string | null
          status_id: number
          subsidiary_dg_class_id?: string | null
          supplier_id: string
          un_number?: string | null
          un_proper_shipping_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_content_type?: string | null
          current_file_name?: string | null
          current_file_path?: string | null
          current_file_size?: number | null
          dg_class_id?: string | null
          dg_subdivision_id?: string | null
          emergency_phone?: string | null
          expiry_date?: string | null
          hazchem_code?: string | null
          id?: string
          is_dg?: boolean | null
          issue_date?: string | null
          other_names?: string | null
          packing_group_id?: string | null
          product_id?: string
          product_name?: string
          request_date?: string | null
          request_information?: string | null
          request_supplier_details?: string | null
          request_supplier_name?: string | null
          requested_by?: string | null
          revision_date?: string | null
          status_id?: number
          subsidiary_dg_class_id?: string | null
          supplier_id?: string
          un_number?: string | null
          un_proper_shipping_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_status"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sds_dg_class_id_fkey"
            columns: ["dg_class_id"]
            isOneToOne: false
            referencedRelation: "master_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sds_dg_subdivision_id_fkey"
            columns: ["dg_subdivision_id"]
            isOneToOne: false
            referencedRelation: "master_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sds_packing_group_id_fkey"
            columns: ["packing_group_id"]
            isOneToOne: false
            referencedRelation: "master_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sds_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sds_subsidiary_dg_class_id_fkey"
            columns: ["subsidiary_dg_class_id"]
            isOneToOne: false
            referencedRelation: "master_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sds_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      sds_versions: {
        Row: {
          content_type: string | null
          file_name: string | null
          file_path: string
          file_size: number | null
          id: string
          notes: string | null
          sds_id: string
          uploaded_at: string | null
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          content_type?: string | null
          file_name?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          notes?: string | null
          sds_id: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_number: number
        }
        Update: {
          content_type?: string | null
          file_name?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          notes?: string | null
          sds_id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_sds"
            columns: ["sds_id"]
            isOneToOne: false
            referencedRelation: "sds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sds_versions_sds_id_fkey"
            columns: ["sds_id"]
            isOneToOne: false
            referencedRelation: "sds"
            referencedColumns: ["id"]
          },
        ]
      }
      status_lookup: {
        Row: {
          category: string
          id: number
          status_name: string
        }
        Insert: {
          category: string
          id?: number
          status_name: string
        }
        Update: {
          category?: string
          id?: number
          status_name?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string
          contact_person: string
          created_at: string | null
          email: string
          id: string
          phone_number: string | null
          status_id: number
          supplier_name: string
        }
        Insert: {
          address: string
          contact_person: string
          created_at?: string | null
          email: string
          id?: string
          phone_number?: string | null
          status_id: number
          supplier_name: string
        }
        Update: {
          address?: string
          contact_person?: string
          created_at?: string | null
          email?: string
          id?: string
          phone_number?: string | null
          status_id?: number
          supplier_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status_lookup"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: Database["public"]["Enums"]["user_status"] | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_login_date: string | null
          last_name: string
          location_id: string | null
          manager_id: string | null
          password: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          active?: Database["public"]["Enums"]["user_status"] | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_login_date?: string | null
          last_name: string
          location_id?: string | null
          manager_id?: string | null
          password: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: Database["public"]["Enums"]["user_status"] | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_login_date?: string | null
          last_name?: string
          location_id?: string | null
          manager_id?: string | null
          password?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      user_status: "active" | "inactive"
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
