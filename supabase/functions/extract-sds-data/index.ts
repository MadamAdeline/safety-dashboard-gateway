
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('Edge Function: Starting PDF extraction for file:', fileName);
    
    // Mock extraction data - in a real implementation, this would parse the PDF
    const extractedData = {
      productName: "Sample Product",
      productId: "SDS-001",
      dgClass: 3,
      unNumber: "UN1263",
      unProperShippingName: "PAINT",
      packingGroup: "II",
      hazchemCode: "3YE",
      subsidiaryDgClass: "6.1"
    }

    console.log('Edge Function: Extracted data:', extractedData);

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
    console.error('Edge Function Error:', error);
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
