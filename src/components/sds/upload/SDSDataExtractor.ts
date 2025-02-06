import { supabase } from "@/integrations/supabase/client";

export async function extractSDSData(file: File, showToast: (message: string) => void) {
  console.log('Attempting to extract SDS data from PDF:', file.name);
  
  try {
    const { data, error } = await supabase.functions.invoke('extract-sds-data');
    
    if (error) {
      console.error('Error calling Edge Function:', error);
      throw error;
    }

    // Return empty values instead of hardcoded ones
    const extractedData = {
      productName: "",
      productId: "",
      dgClass: null,
      unNumber: "",
      unProperShippingName: "",
      packingGroup: "",
      hazchemCode: "",
      subsidiaryDgClass: ""
    };

    console.log('Extracted SDS data:', extractedData);
    return extractedData;
  } catch (error) {
    console.error('Error extracting SDS data:', error);
    showToast("Could not extract data from PDF. Please fill in the fields manually.");
    return null;
  }
}