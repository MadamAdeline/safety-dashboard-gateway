import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export async function extractSDSData(file: File) {
  const { toast } = useToast();
  console.log('Attempting to extract SDS data from PDF');
  
  try {
    const { data, error } = await supabase.functions.invoke('extract-sds-data');
    
    if (error) {
      console.error('Error calling Edge Function:', error);
      throw error;
    }

    console.log('Successfully extracted SDS data:', data);
    return data;
  } catch (error) {
    console.error('Error extracting SDS data:', error);
    toast({
      title: "Warning",
      description: "Could not extract data from PDF. Please fill in the fields manually.",
      variant: "destructive"
    });
    return null;
  }
}