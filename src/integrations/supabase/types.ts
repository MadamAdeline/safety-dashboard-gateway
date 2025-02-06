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
      sds: {
        Row: {
          created_at: string | null
          current_content_type: string | null
          current_file_name: string | null
          current_file_path: string | null
          current_file_size: number | null
          dg_class: number | null
          expiry_date: string | null
          id: string
          is_dg: boolean | null
          issue_date: string | null
          product_id: string
          product_name: string
          status_id: number
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_content_type?: string | null
          current_file_name?: string | null
          current_file_path?: string | null
          current_file_size?: number | null
          dg_class?: number | null
          expiry_date?: string | null
          id?: string
          is_dg?: boolean | null
          issue_date?: string | null
          product_id: string
          product_name: string
          status_id: number
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_content_type?: string | null
          current_file_name?: string | null
          current_file_path?: string | null
          current_file_size?: number | null
          dg_class?: number | null
          expiry_date?: string | null
          id?: string
          is_dg?: boolean | null
          issue_date?: string | null
          product_id?: string
          product_name?: string
          status_id?: number
          supplier_id?: string
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
            foreignKeyName: "sds_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status_lookup"
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
