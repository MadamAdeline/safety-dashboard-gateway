import { supabase } from "@/integrations/supabase/client";
import type { SDS } from "@/types/sds";

export async function createSDS(data: {
  productName: string;
  productId: string;
  supplierId: string;
  isDG: boolean;
  issueDate?: string;
  expiryDate?: string;
  statusId: number;
  currentFilePath?: string;
  currentFileName?: string;
  currentFileSize?: number;
  currentContentType?: string;
  unNumber?: string;
  unProperShippingName?: string;
  hazchemCode?: string;
  dgClassId?: string;
  subsidiaryDgClassId?: string;
  packingGroupId?: string;
  dgSubDivisionId?: string;
}) {
  console.log("Creating SDS with data:", data);
  
  // Handle empty dates by setting them to null
  const formattedData = {
    ...data,
    issue_date: data.issueDate || null,
    expiry_date: data.expiryDate || null,
    // Handle empty UUID fields by converting empty strings to null
    dg_class_id: data.dgClassId || null,
    subsidiary_dg_class_id: data.subsidiaryDgClassId || null,
    packing_group_id: data.packingGroupId || null,
    dg_subdivision_id: data.dgSubDivisionId || null
  };
  
  const { data: result, error } = await supabase
    .from('sds')
    .insert({
      product_name: data.productName,
      product_id: data.productId,
      supplier_id: data.supplierId,
      is_dg: data.isDG,
      issue_date: formattedData.issue_date,
      expiry_date: formattedData.expiry_date,
      status_id: data.statusId,
      current_file_path: data.currentFilePath,
      current_file_name: data.currentFileName,
      current_file_size: data.currentFileSize,
      current_content_type: data.currentContentType,
      un_number: data.unNumber,
      un_proper_shipping_name: data.unProperShippingName,
      hazchem_code: data.hazchemCode,
      dg_class_id: formattedData.dg_class_id,
      subsidiary_dg_class_id: formattedData.subsidiary_dg_class_id,
      packing_group_id: formattedData.packing_group_id,
      dg_subdivision_id: formattedData.dg_subdivision_id
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating SDS:", error);
    throw error;
  }

  return result;
}

export async function uploadSDSFile(file: File) {
  console.log("Uploading SDS file:", file.name);
  
  const fileExt = file.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('sds_documents')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    throw uploadError;
  }

  return {
    filePath,
    fileName: file.name,
    fileSize: file.size,
    contentType: file.type
  };
}

export async function getStatusId(statusName: string, category: string = 'SDS_Library') {
  console.log("Getting status ID for:", statusName, "in category:", category);
  
  const { data, error } = await supabase
    .from('status_lookup')
    .select('id')
    .eq('category', category)
    .eq('status_name', statusName)
    .single();

  if (error) {
    console.error("Error getting status ID:", error);
    throw error;
  }

  return data.id;
}