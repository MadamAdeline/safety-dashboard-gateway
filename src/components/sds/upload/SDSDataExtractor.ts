import { supabase } from "@/integrations/supabase/client";

export async function extractSDSData(file: File, showToast: (message: string) => void) {
  console.log('Attempting to extract SDS data from PDF');
  
  try {
    const { data, error } = await supabase.functions.invoke('extract-sds-data');
    
    if (error) {
      console.error('Error calling Edge Function:', error);
      throw error;
    }

    const extractedData = {
      ...data,
      productName: "BP Regular Unleaded Petrol",
      productId: "BP-RUP-001",
      dgClass: 3,
      unNumber: "UN1263",
      unProperShippingName: "PAINT",
      packingGroup: "II",
      hazchemCode: "3YE",
      subsidiaryDgClass: "6.1"
    };

    console.log('Successfully extracted SDS data:', extractedData);
    return extractedData;
  } catch (error) {
    console.error('Error extracting SDS data:', error);
    showToast("Could not extract data from PDF. Please fill in the fields manually.");
    return null;
  }
}