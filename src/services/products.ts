
import { supabase } from "@/integrations/supabase/client";
import type { Product } from '@/types/product';

const getUserId = async () => {
  try {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      throw new Error('User must be authenticated to perform this action');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      throw new Error('Could not find user');
    }

    return userData.id;
  } catch (error) {
    console.error('Error in getUserId:', error);
    throw error;
  }
};

export async function createProduct(product: Omit<Product, 'id'>) {
  try {
    const userId = await getUserId();
    console.log('Current user ID:', userId);

    const { data, error } = await supabase
      .from('products')
      .insert({
        product_name: product.name,
        product_code: product.code,
        brand_name: product.brandName,
        unit: product.unit,
        uom_id: product.uomId,
        unit_size: product.unitSize,
        description: product.description,
        product_set: product.productSet,
        aerosol: product.aerosol,
        cryogenic_fluid: product.cryogenicFluid,
        other_names: product.otherNames,
        uses: product.uses,
        product_status_id: product.productStatusId,
        approval_status_id: product.approvalStatusId,
        sds_id: product.sdsId,
        updated_by: userId
      })
      .select(`
        *,
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
      .single();

    if (error) {
      console.error('Supabase error creating product:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned after creating product');
    }

    const transformedData: Product = {
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
      status: (data.product_status_id === 16 ? "ACTIVE" : "INACTIVE") as "ACTIVE" | "INACTIVE",
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

    console.log('Successfully created product:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, product: Partial<Product>) {
  try {
    const userId = await getUserId();
    console.log('Current user ID for update:', userId);

    const updateData = {
      ...product,
      updated_by: userId
    };

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
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
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned after updating product');
    }

    const transformedData: Product = {
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
      status: (data.product_status_id === 16 ? "ACTIVE" : "INACTIVE") as "ACTIVE" | "INACTIVE",
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

    console.log('Successfully updated product:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Failed to update product:', error);
    throw error;
  }
}
