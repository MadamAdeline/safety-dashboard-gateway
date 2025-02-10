
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileName } = await req.json();
    console.log('Starting PDF extraction for file:', fileName);

    // Mock extraction for now - in a real implementation this would use a PDF parsing library
    // For demonstration, extracting data based on common patterns
    const extractedData = {
      unNumber: extractUNNumber(fileName),
      dgClass: extractDGClass(fileName),
      packingGroup: extractPackingGroup(fileName),
      hazchemCode: extractHazchemCode(fileName),
      unProperShippingName: extractShippingName(fileName)
    };

    console.log('Extracted data:', extractedData);

    // Connect to Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update SDS record with extracted data
    const { data, error } = await supabaseClient
      .from('sds')
      .update({
        un_number: extractedData.unNumber,
        dg_class_id: extractedData.dgClass,
        packing_group_id: extractedData.packingGroup,
        hazchem_code: extractedData.hazchemCode,
        un_proper_shipping_name: extractedData.unProperShippingName
      })
      .eq('current_file_name', fileName)
      .select();

    if (error) {
      console.error('Error updating SDS:', error);
      throw error;
    }

    return new Response(
      JSON.stringify(extractedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})

// Mock extraction functions - these would need to be replaced with actual PDF parsing logic
function extractUNNumber(text: string): string | null {
  // Look for patterns like "UN 1234" or "UN1234"
  const match = text.match(/UN\s*(\d{4})/i);
  return match ? match[1] : null;
}

function extractDGClass(text: string): string | null {
  // Look for patterns like "Class 3" or "DG Class 3"
  const match = text.match(/Class\s*(\d+(?:\.\d+)?)/i);
  return match ? match[1] : null;
}

function extractPackingGroup(text: string): string | null {
  // Look for patterns like "PG II" or "Packing Group II"
  const match = text.match(/(?:PG|Packing Group)\s*(I{1,3}|IV?)/i);
  return match ? match[1] : null;
}

function extractHazchemCode(text: string): string | null {
  // Look for patterns like "HAZCHEM 2WE"
  const match = text.match(/HAZCHEM\s*([0-9][A-Z]{2})/i);
  return match ? match[1] : null;
}

function extractShippingName(text: string): string | null {
  // Look for patterns between "PROPER SHIPPING NAME:" and the next section
  const match = text.match(/PROPER SHIPPING NAME:?\s*([^\n]+)/i);
  return match ? match[1].trim() : null;
}
