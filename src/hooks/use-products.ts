
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { useToast } from "@/components/ui/use-toast";

export function useProducts() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products from Supabase...');
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            product_name,
            product_code,
            brand_name,
            unit,
            uom_id,
            uom:master_data!products_uom_id_fkey (
              id,
              label
            ),
            unit_size,
            description,
            product_set,
            aerosol,
            cryogenic_fluid,
            other_names,
            uses,
            approval_status_id,
            product_status_id,
            sds_id,
            sds!products_sds_id_fkey (
              id,
              is_dg,
              dg_class:master_data!sds_dg_class_id_fkey (
                id,
                label
              ),
              supplier_id,
              supplier!sds_supplier_id_fkey (
                id,
                supplier_name
              ),
              packing_group:master_data!sds_packing_group_id_fkey (
                id,
                label
              )
            )
          `);
        
        if (productsError) {
          console.error('Error fetching product details:', productsError);
          throw productsError;
        }

        console.log('Fetched products:', productsData);
        
        return productsData.map(item => ({
          id: item.id,
          name: item.product_name,
          code: item.product_code,
          brandName: item.brand_name,
          unit: item.unit,
          uomId: item.uom_id,
          uom: item.uom ? {
            id: item.uom.id,
            label: item.uom.label
          } : undefined,
          unitSize: item.unit_size,
          description: item.description,
          productSet: item.product_set,
          aerosol: item.aerosol,
          cryogenicFluid: item.cryogenic_fluid,
          otherNames: item.other_names,
          uses: item.uses,
          status: (item.product_status_id === 16 ? "ACTIVE" : "INACTIVE") as "ACTIVE" | "INACTIVE",
          approvalStatusId: item.approval_status_id,
          productStatusId: item.product_status_id,
          sdsId: item.sds_id,
          sds: item.sds ? {
            id: item.sds.id,
            isDG: item.sds.is_dg,
            dgClass: item.sds.dg_class ? {
              id: item.sds.dg_class.id,
              label: item.sds.dg_class.label
            } : undefined,
            supplier: item.sds.supplier ? {
              id: item.sds.supplier.id,
              supplier_name: item.sds.supplier.supplier_name
            } : undefined,
            packingGroup: item.sds.packing_group ? {
              id: item.sds.packing_group.id,
              label: item.sds.packing_group.label
            } : undefined
          } : undefined
        })) as Product[];
      } catch (err) {
        console.error('Failed to fetch products:', err);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
        throw err;
      }
    }
  });
}
