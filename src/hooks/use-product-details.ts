
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

export function useProductDetails(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      
      console.log("=== START: Product Details Query ===");
      console.log("Fetching product with ID:", productId);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          product_name,
          product_code,
          brand_name,
          unit,
          uom_id,
          unit_size,
          description,
          product_set,
          aerosol,
          cryogenic_fluid,
          other_names,
          uses,
          product_status_id,
          approval_status_id,
          sds_id,
          uom:master_data!products_uom_id_fkey (
            id,
            label
          ),
          sds:sds!products_sds_id_fkey (
            id,
            is_dg,
            expiry_date,
            issue_date,
            revision_date,
            current_file_path,
            current_file_name,
            current_file_size,
            current_content_type,
            dg_class:master_data!sds_dg_class_id_fkey (
              id,
              label
            ),
            supplier:suppliers!sds_supplier_id_fkey (
              id,
              supplier_name
            ),
            packing_group:master_data!sds_packing_group_id_fkey (
              id,
              label
            ),
            dg_subdivision:master_data!sds_dg_subdivision_id_fkey (
              id,
              label
            )
          )
        `)
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
      
      if (!data) {
        console.log("No data returned from query");
        return null;
      }
      
      console.log("=== Raw Data ===");
      console.log("Complete data object:", data);
      console.log("SDS data:", data.sds);
      
      if (data.sds) {
        console.log("=== SDS Date Fields ===");
        console.log("Expiry date:", data.sds.expiry_date);
        console.log("Issue date:", data.sds.issue_date);
        console.log("Revision date:", data.sds.revision_date);
      }

      const product: Product = {
        id: data.id,
        name: data.product_name,
        code: data.product_code,
        brandName: data.brand_name,
        unit: data.unit,
        uomId: data.uom_id,
        uom: data.uom ? {
          id: data.uom.id,
          label: data.uom.label
        } : undefined,
        unitSize: data.unit_size,
        description: data.description,
        productSet: data.product_set,
        aerosol: data.aerosol,
        cryogenicFluid: data.cryogenic_fluid,
        otherNames: data.other_names,
        uses: data.uses,
        status: data.product_status_id === 16 ? "ACTIVE" : "INACTIVE",
        approvalStatusId: data.approval_status_id,
        productStatusId: data.product_status_id,
        sdsId: data.sds_id,
        sds: data.sds ? {
          id: data.sds.id,
          isDG: data.sds.is_dg,
          currentFilePath: data.sds.current_file_path,
          currentFileName: data.sds.current_file_name,
          currentFileSize: data.sds.current_file_size,
          currentContentType: data.sds.current_content_type,
          expiryDate: data.sds.expiry_date,  // Changed from camelCase to snake_case
          issueDate: data.sds.issue_date,    // Changed from camelCase to snake_case
          revisionDate: data.sds.revision_date, // Changed from camelCase to snake_case
          dgClass: data.sds.dg_class ? {
            id: data.sds.dg_class.id,
            label: data.sds.dg_class.label
          } : undefined,
          supplier: data.sds.supplier ? {
            id: data.sds.supplier.id,
            supplier_name: data.sds.supplier.supplier_name
          } : undefined,
          packingGroup: data.sds.packing_group ? {
            id: data.sds.packing_group.id,
            label: data.sds.packing_group.label
          } : undefined,
          dgSubDivision: data.sds.dg_subdivision ? {
            id: data.sds.dg_subdivision.id,
            label: data.sds.dg_subdivision.label
          } : undefined
        } : undefined
      };

      console.log("=== Mapped Data ===");
      console.log("Final product object:", product);
      if (product.sds) {
        console.log("Mapped SDS dates:", {
          expiryDate: product.sds.expiryDate,
          issueDate: product.sds.issueDate,
          revisionDate: product.sds.revisionDate
        });
      }
      
      console.log("=== END: Product Details Query ===");
      return product;
    },
    enabled: !!productId
  });
}
