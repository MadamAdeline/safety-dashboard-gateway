
export interface SystemSettings {
  id: string;
  customer_name: string;
  customer_email: string;
  logo_path?: string | null;
  auto_update_sds: boolean;
  updated_at?: string;
  updated_by?: string;
}
