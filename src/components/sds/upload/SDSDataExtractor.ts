import { supabase } from "@/integrations/supabase/client";

export async function extractSDSData(file: File, showToast: (message: string) => void) {
  console.log('Attempting to extract SDS data from PDF:', file.name);
  
  try {
    // Call the edge function to extract data
    const { data, error } = await supabase.functions.invoke('extract-sds-data', {
      body: { fileName: file.name }
    });
    
    if (error) {
      console.error('Error calling Edge Function:', error);
      throw error;
    }

    // Return empty values for now until the edge function is implemented
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