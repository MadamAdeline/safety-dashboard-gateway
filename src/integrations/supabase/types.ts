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
      audit_trail: {
        Row: {
          component_updated: string
          id: number
          timestamp: string | null
          update_summary: string
          user_id: string
        }
        Insert: {
          component_updated: string
          id?: number
          timestamp?: string | null
          update_summary: string
          user_id: string
        }
        Update: {
          component_updated?: string
          id?: number
          timestamp?: string | null
          update_summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          coordinates: Json | null
          created_at: string | null
          full_path: string | null
          id: string
          is_storage_location: boolean | null
          name: string
          parent_location_id: string | null
          status_id: number
          storage_type_id: string | null
          type_id: string
          updated_at: string | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string | null
          full_path?: string | null
          id?: string
          is_storage_location?: boolean | null
          name: string
          parent_location_id?: string | null
          status_id: number
          storage_type_id?: string | null
          type_id: string
          updated_at?: string | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string | null
          full_path?: string | null
          id?: string
          is_storage_location?: boolean | null
          name?: string
          parent_location_id?: string | null
          status_id?: number
          storage_type_id?: string | null
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
            foreignKeyName: "locations_storage_type_id_fkey"
            columns: ["storage_type_id"]
            isOneToOne: false
            referencedRelation: "master_data"
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
          value: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          label: string
          sort_order?: number
          status?: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          label?: string
          sort_order?: number
          status?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      product_approvals: {
        Row: {
          approved_at: string | null
          assigned_to: string
          decision_comment: string | null
          id: string
          product_id: string
          status_id: number
        }
        Insert: {
          approved_at?: string | null
          assigned_to: string
          decision_comment?: string | null
          id?: string
          product_id: string
          status_id: number
        }
        Update: {
          approved_at?: string | null
          assigned_to?: string
          decision_comment?: string | null
          id?: string
          product_id?: string
          status_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_approvals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_approvals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_approvals_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status_lookup"
            referencedColumns: ["id"]
          },
        ]
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
          unit: string | null
          unit_size: number | null
          uom_id: string | null
          updated_at: string | null
          updated_by: string | null
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
          unit?: string | null
          unit_size?: number | null
          uom_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
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
          unit?: string | null
          unit_size?: number | null
          uom_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          uses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_sds"
            columns: ["sds_id"]
            isOneToOne: false
            referencedRelation: "sds"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "products_uom_id_fkey"
            columns: ["uom_id"]
            isOneToOne: false
            referencedRelation: "master_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
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
          source: string | null
          status_id: number
          subsidiary_dg_class_id: string | null
          supplier_id: string
          un_number: string | null
          un_proper_shipping_name: string | null
          updated_at: string | null
          updated_by: string | null
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
          source?: string | null
          status_id: number
          subsidiary_dg_class_id?: string | null
          supplier_id: string
          un_number?: string | null
          un_proper_shipping_name?: string | null
          updated_at?: string | null
          updated_by?: string | null
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
          source?: string | null
          status_id?: number
          subsidiary_dg_class_id?: string | null
          supplier_id?: string
          un_number?: string | null
          un_proper_shipping_name?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
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
          {
            foreignKeyName: "sds_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
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
            foreignKeyName: "sds_versions_sds_id_fkey"
            columns: ["sds_id"]
            isOneToOne: false
            referencedRelation: "sds"
            referencedColumns: ["id"]
          },
        ]
      }
      site_registers: {
        Row: {
          created_at: string | null
          current_stock_level: number | null
          exact_location: string | null
          fire_protection_required: boolean | null
          id: string
          location_id: string
          manifest_required: boolean | null
          max_stock_level: number | null
          override_product_name: string | null
          placarding_required: boolean | null
          product_id: string
          status_id: number
          storage_conditions: string | null
          total_qty: number | null
          uom_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          current_stock_level?: number | null
          exact_location?: string | null
          fire_protection_required?: boolean | null
          id?: string
          location_id: string
          manifest_required?: boolean | null
          max_stock_level?: number | null
          override_product_name?: string | null
          placarding_required?: boolean | null
          product_id: string
          status_id: number
          storage_conditions?: string | null
          total_qty?: number | null
          uom_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          current_stock_level?: number | null
          exact_location?: string | null
          fire_protection_required?: boolean | null
          id?: string
          location_id?: string
          manifest_required?: boolean | null
          max_stock_level?: number | null
          override_product_name?: string | null
          placarding_required?: boolean | null
          product_id?: string
          status_id?: number
          storage_conditions?: string | null
          total_qty?: number | null
          uom_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_registers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_registers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_registers_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_registers_uom_id_fkey"
            columns: ["uom_id"]
            isOneToOne: false
            referencedRelation: "master_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_registers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      stock_movements: {
        Row: {
          action: Database["public"]["Enums"]["stock_action"]
          comments: string | null
          created_at: string | null
          id: string
          movement_date: string
          quantity: number
          reason_id: string
          site_register_id: string
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          action: Database["public"]["Enums"]["stock_action"]
          comments?: string | null
          created_at?: string | null
          id?: string
          movement_date?: string
          quantity: number
          reason_id: string
          site_register_id: string
          updated_at?: string | null
          updated_by: string
        }
        Update: {
          action?: Database["public"]["Enums"]["stock_action"]
          comments?: string | null
          created_at?: string | null
          id?: string
          movement_date?: string
          quantity?: number
          reason_id?: string
          site_register_id?: string
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_reason_id_fkey"
            columns: ["reason_id"]
            isOneToOne: false
            referencedRelation: "master_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_site_register_id_fkey"
            columns: ["site_register_id"]
            isOneToOne: false
            referencedRelation: "site_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string
          contact_person: string
          created_at: string | null
          email: string
          id: string
          phone_number: string | null
          status_id: number | null
          supplier_name: string
          updated_by: string | null
        }
        Insert: {
          address: string
          contact_person: string
          created_at?: string | null
          email: string
          id?: string
          phone_number?: string | null
          status_id?: number | null
          supplier_name: string
          updated_by?: string | null
        }
        Update: {
          address?: string
          contact_person?: string
          created_at?: string | null
          email?: string
          id?: string
          phone_number?: string | null
          status_id?: number | null
          supplier_name?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status_lookup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      get_location_hierarchy: {
        Args: {
          selected_location_id: string
        }
        Returns: {
          id: string
        }[]
      }
      set_user_context: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      stock_action: "INCREASE" | "DECREASE" | "OVERRIDE"
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
