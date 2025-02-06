import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SDS } from "@/types/sds";

export function useSDSList() {
  return useQuery({
    queryKey: ['sds'],
    queryFn: async () => {
      console.log('Fetching ACTIVE SDS data from Supabase');
      
      // First, get the correct status ID for ACTIVE SDS_Library
      const { data: statusData, error: statusError } = await supabase
        .from('status_lookup')
        .select('id')
        .eq('category', 'SDS_Library')
        .eq('status_name', 'ACTIVE')
        .single();

      if (statusError) {
        console.error('Error fetching status ID:', statusError);
        throw statusError;
      }

      console.log('Retrieved ACTIVE status ID:', statusData.id);

      const { data, error } = await supabase
        .from('sds')
        .select(`
          *,
          suppliers!fk_supplier (supplier_name),
          status:status_lookup!fk_status (status_name),
          dg_class:master_data!sds_dg_class_id_fkey (id, label),
          subsidiary_dg_class:master_data!sds_subsidiary_dg_class_id_fkey (id, label),
          packing_group:master_data!sds_packing_group_id_fkey (id, label),
          dg_subdivision:master_data!sds_dg_subdivision_id_fkey (id, label)
        `)
        .eq('status_id', statusData.id);

      if (error) {
        console.error('Error fetching SDS:', error);
        throw error;
      }

      console.log('Retrieved ACTIVE SDS data:', data);

      return data.map(item => ({
        id: item.id,
        productName: item.product_name,
        productId: item.product_id,
        isDG: item.is_dg,
        supplier: item.suppliers?.supplier_name || 'Unknown',
        supplierId: item.supplier_id,
        issueDate: item.issue_date,
        expiryDate: item.expiry_date,
        dgClassId: item.dg_class_id,
        dgClass: item.dg_class,
        subsidiaryDgClassId: item.subsidiary_dg_class_id,
        subsidiaryDgClass: item.subsidiary_dg_class,
        packingGroupId: item.packing_group_id,
        packingGroup: item.packing_group,
        dgSubDivisionId: item.dg_subdivision_id,
        dgSubDivision: item.dg_subdivision,
        status: item.status?.status_name as 'ACTIVE' | 'INACTIVE' | 'REQUESTED',
        sdsSource: 'Customer' as const,
        currentFilePath: item.current_file_path,
        currentFileName: item.current_file_name,
        currentFileSize: item.current_file_size,
        currentContentType: item.current_content_type,
        unNumber: item.un_number,
        unProperShippingName: item.un_proper_shipping_name,
        hazchemCode: item.hazchem_code,
        otherNames: item.other_names,
        emergencyPhone: item.emergency_phone,
        revisionDate: item.revision_date,
        requestSupplierName: item.request_supplier_name,
        requestSupplierDetails: item.request_supplier_details,
        requestInformation: item.request_information,
        requestDate: item.request_date,
        requestedBy: item.requested_by
      }));
    }
  });
}