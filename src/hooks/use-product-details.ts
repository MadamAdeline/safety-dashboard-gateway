
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

export function useProductDetails(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      
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
            )
          )
        `)
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
      
      if (!data) return null;
      
      console.log("Raw product data from DB:", data);

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
          } : undefined
        } : undefined
      };

      console.log("Mapped product object:", product);
      return product;
    },
    enabled: !!productId
  });
}
