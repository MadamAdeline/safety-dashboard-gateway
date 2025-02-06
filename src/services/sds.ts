import { supabase } from "@/integrations/supabase/client";
import type { SDS } from "@/types/sds";

export async function createSDS(data: {
  productName: string;
  productId: string;
  supplierId: string;
  isDG: boolean;
  issueDate?: string;
  revisionDate?: string;
  expiryDate?: string;
  statusId: number;
  currentFilePath?: string;
  currentFileName?: string;
  currentFileSize?: number;
  currentContentType?: string;
  unNumber?: string;
  unProperShippingName?: string;
  hazchemCode?: string;
  dgClassId?: string | null;
  subsidiaryDgClassId?: string | null;
  packingGroupId?: string | null;
  dgSubDivisionId?: string | null;
  otherNames?: string;
  emergencyPhone?: string;
}) {
  console.log("Creating SDS with data:", data);
  
  const formattedData = {
    product_name: data.productName,
    product_id: data.productId,
    other_names: data.otherNames || null,
    emergency_phone: data.emergencyPhone || null,
    supplier_id: data.supplierId,
    is_dg: data.isDG,
    issue_date: data.issueDate || null,
    revision_date: data.revisionDate || null,
    expiry_date: data.expiryDate || null,
    status_id: data.statusId,
    current_file_path: data.currentFilePath || null,
    current_file_name: data.currentFileName || null,
    current_file_size: data.currentFileSize || null,
    current_content_type: data.currentContentType || null,
    un_number: data.unNumber || null,
    un_proper_shipping_name: data.unProperShippingName || null,
    hazchem_code: data.hazchemCode || null,
    dg_class_id: data.dgClassId || null,
    subsidiary_dg_class_id: data.subsidiaryDgClassId || null,
    packing_group_id: data.packingGroupId || null,
    dg_subdivision_id: data.dgSubDivisionId || null
  };

  console.log("Formatted data for Supabase:", formattedData);

  const { data: result, error } = await supabase
    .from('sds')
    .insert(formattedData)
    .select()
    .single();

  if (error) {
    console.error("Error creating SDS:", error);
    throw error;
  }

  return result;
}

export async function updateSDS(id: string, data: {
  productName: string;
  productId: string;
  supplierId: string;
  isDG: boolean;
  issueDate?: string;
  revisionDate?: string;
  expiryDate?: string;
  statusId: number;
  currentFilePath?: string;
  currentFileName?: string;
  currentFileSize?: number;
  currentContentType?: string;
  unNumber?: string;
  unProperShippingName?: string;
  hazchemCode?: string;
  dgClassId?: string | null;
  subsidiaryDgClassId?: string | null;
  packingGroupId?: string | null;
  dgSubDivisionId?: string | null;
  otherNames?: string;
  emergencyPhone?: string;
}) {
  console.log("Updating SDS with ID:", id, "and data:", data);
  
  const formattedData = {
    product_name: data.productName,
    product_id: data.productId,
    other_names: data.otherNames || null,
    emergency_phone: data.emergencyPhone || null,
    supplier_id: data.supplierId,
    is_dg: data.isDG,
    issue_date: data.issueDate || null,
    revision_date: data.revisionDate || null,
    expiry_date: data.expiryDate || null,
    status_id: data.statusId,
    current_file_path: data.currentFilePath || null,
    current_file_name: data.currentFileName || null,
    current_file_size: data.currentFileSize || null,
    current_content_type: data.currentContentType || null,
    un_number: data.unNumber || null,
    un_proper_shipping_name: data.unProperShippingName || null,
    hazchem_code: data.hazchemCode || null,
    dg_class_id: data.dgClassId || null,
    subsidiary_dg_class_id: data.subsidiaryDgClassId || null,
    packing_group_id: data.packingGroupId || null,
    dg_subdivision_id: data.dgSubDivisionId || null
  };

  console.log("Formatted data for Supabase:", formattedData);

  const { data: result, error } = await supabase
    .from('sds')
    .update(formattedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating SDS:", error);
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