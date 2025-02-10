
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SDS } from "@/types/sds";

export function useSDSList() {
  return useQuery({
    queryKey: ['sds'],
    queryFn: async () => {
      console.log('Fetching SDS data from Supabase');
      const { data, error } = await supabase
        .from('sds')
        .select(`
          *,
          suppliers!sds_supplier_id_fkey(supplier_name),
          status:status_lookup!inner (status_name),
          dg_class:master_data!sds_dg_class_id_fkey (id, label),
          subsidiary_dg_class:master_data!sds_subsidiary_dg_class_id_fkey (id, label),
          packing_group:master_data!sds_packing_group_id_fkey (id, label),
          dg_subdivision:master_data!sds_dg_subdivision_id_fkey (id, label)
        `);

      if (error) {
        console.error('Error fetching SDS:', error);
        throw error;
      }

      console.log('Retrieved SDS data:', data);

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
        status: item.status.status_name as 'ACTIVE' | 'INACTIVE' | 'REQUESTED',
        sdsSource: item.source,
        source: item.source,
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
