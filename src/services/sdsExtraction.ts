import { supabase } from "@/integrations/supabase/client";
import type { ExtractedSDSData, SDSExtractionResponse } from "@/types/sdsExtraction";

export async function extractSDSDataFromFile(file: File): Promise<SDSExtractionResponse> {
  console.log('Starting SDS data extraction process for file:', file.name);
  
  try {
    const { data, error } = await supabase.functions.invoke('extract-sds-data', {
      body: { fileName: file.name }
    });
    
    if (error) {
      console.error('SDS extraction edge function error:', error);
      return {
        success: false,
        error: 'Failed to extract data from the SDS file'
      };
    }

    console.log('SDS extraction completed successfully:', data);
    
    const extractedData: ExtractedSDSData = {
      productName: data.productName || "",
      productId: data.productId || "",
      dgClass: data.dgClass || null,
      unNumber: data.unNumber || "",
      unProperShippingName: data.unProperShippingName || "",
      packingGroup: data.packingGroup || "",
      hazchemCode: data.hazchemCode || "",
      subsidiaryDgClass: data.subsidiaryDgClass || ""
    };

    return {
      success: true,
      data: extractedData
    };
  } catch (error) {
    console.error('Error during SDS data extraction:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during data extraction'
    };
  }
}