import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SDS } from "@/types/sds";

export function useActiveSdsList() {
  return useQuery({
    queryKey: ['active-sds-list'],
    queryFn: async () => {
      console.log('Fetching active SDS list...');
      
      // First, get the active status ID from status_lookup
      const { data: statusData, error: statusError } = await supabase
        .from('status_lookup')
        .select('id')
        .eq('category', 'SDS_Library')  // Fixed case to match database
        .eq('status_name', 'ACTIVE')
        .maybeSingle();  // Changed from single() to maybeSingle()

      if (statusError) {
        console.error('Error fetching active status:', statusError);
        throw statusError;
      }

      if (!statusData) {
        console.error('No active status found for SDS_Library');
        return [];
      }

      const activeStatusId = statusData.id;
      console.log('Found active status ID:', activeStatusId);

      // Then fetch SDS records with this status
      const { data, error } = await supabase
        .from('sds')
        .select(`
          id,
          product_name,
          product_id,
          is_dg,
          suppliers!fk_supplier (
            id,
            supplier_name
          ),
          issue_date,
          expiry_date,
          status_id,
          current_file_path,
          current_file_name,
          dg_class:master_data!sds_dg_class_id_fkey (
            id,
            label
          ),
          dg_subdivision:master_data!sds_dg_subdivision_id_fkey (
            id,
            label
          ),
          packing_group:master_data!sds_packing_group_id_fkey (
            id,
            label
          )
        `)
        .eq('status_id', activeStatusId);

      if (error) {
        console.error('Error fetching active SDS list:', error);
        throw error;
      }

      console.log('Found active SDS records:', data?.length);

      return data.map(item => ({
        id: item.id,
        productName: item.product_name,
        productId: item.product_id,
        isDG: item.is_dg,
        supplier: item.suppliers?.supplier_name || 'Unknown',
        supplierId: item.suppliers?.id,
        issueDate: item.issue_date,
        expiryDate: item.expiry_date,
        status: 'ACTIVE',
        sdsSource: 'Customer',
        currentFilePath: item.current_file_path,
        currentFileName: item.current_file_name,
        dgClass: item.dg_class ? {
          id: item.dg_class.id,
          label: item.dg_class.label
        } : undefined,
        dgSubDivision: item.dg_subdivision ? {
          id: item.dg_subdivision.id,
          label: item.dg_subdivision.label
        } : undefined,
        packingGroup: item.packing_group ? {
          id: item.packing_group.id,
          label: item.packing_group.label
        } : undefined
      })) as SDS[];
    }
  });
}