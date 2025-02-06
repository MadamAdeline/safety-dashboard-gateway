import { supabase } from "@/integrations/supabase/client";

export async function extractSDSData(file: File, showToast: (message: string) => void) {
  console.log('Attempting to extract SDS data from PDF');
  
  try {
    const { data, error } = await supabase.functions.invoke('extract-sds-data');
    
    if (error) {
      console.error('Error calling Edge Function:', error);
      throw error;
    }

    console.log('Successfully extracted SDS data:', data);
    return {
      ...data,
      productName: "BP Regular Unleaded Petrol", // Mock extracted data
      productId: "BP-RUP-001" // Mock extracted data
    };
  } catch (error) {
    console.error('Error extracting SDS data:', error);
    showToast("Could not extract data from PDF. Please fill in the fields manually.");
    return null;
  }
}