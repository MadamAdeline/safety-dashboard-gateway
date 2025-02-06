import { supabase } from "@/integrations/supabase/client";
import type { SDS } from "@/types/sds";

export async function createSDS(data: {
  productName: string;
  productId: string;
  supplierId: string;
  isDG: boolean;
  issueDate?: string;
  expiryDate?: string;
  dgClass?: number;
  statusId: number;
  currentFilePath?: string;
  currentFileName?: string;
  currentFileSize?: number;
  currentContentType?: string;
  unNumber?: string;
  unProperShippingName?: string;
  packingGroup?: string;
  hazchemCode?: string;
  subsidiaryDgClass?: string;
}) {
  console.log("Creating SDS with data:", data);
  
  // Handle empty dates by setting them to null
  const formattedData = {
    ...data,
    issue_date: data.issueDate || null,
    expiry_date: data.expiryDate || null
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
      dg_class: data.dgClass,
      status_id: data.statusId,
      current_file_path: data.currentFilePath,
      current_file_name: data.currentFileName,
      current_file_size: data.currentFileSize,
      current_content_type: data.currentContentType,
      un_number: data.unNumber,
      un_proper_shipping_name: data.unProperShippingName,
      packing_group: data.packingGroup,
      hazchem_code: data.hazchemCode,
      subsidiary_dg_class: data.subsidiaryDgClass
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