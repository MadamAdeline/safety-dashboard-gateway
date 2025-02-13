
export interface SiteRegister {
  id: string;
  location_id: string;
  product_id: string;
  status_id: number;
  current_stock_level?: number;
  max_stock_level?: number;
  total_qty?: number;
  exact_location?: string;
  override_product_name?: string;
  storage_conditions?: string;
  placarding_required?: boolean;
  manifest_required?: boolean;
  fire_protection_required?: boolean;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
  uom_id?: string;
}
