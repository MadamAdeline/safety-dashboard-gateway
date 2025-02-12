
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SDSRequestEmailData {
  productName: string;
  productCode: string;
  otherProductName: string;
  supplierName: string;
  otherSupplierDetails: string;
  requestInfo: string;
  requestDate: string;
  toEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      productName,
      productCode,
      otherProductName,
      supplierName,
      otherSupplierDetails,
      requestInfo,
      requestDate,
      toEmail,
    }: SDSRequestEmailData = await req.json();

    const emailResponse = await resend.emails.send({
      from: "DGXprt SDS Request <onboarding@resend.dev>",
      to: [toEmail],
      subject: `New SDS Request: ${productName}`,
      html: `
        <h1>New SDS Request</h1>
        <p>A new SDS request has been submitted with the following details:</p>
        
        <h2>Product Details</h2>
        <ul>
          <li><strong>Product Name:</strong> ${productName}</li>
          <li><strong>Product Code:</strong> ${productCode}</li>
          ${otherProductName ? `<li><strong>Other Product Name:</strong> ${otherProductName}</li>` : ''}
        </ul>

        <h2>Supplier Information</h2>
        <ul>
          <li><strong>Supplier Name:</strong> ${supplierName}</li>
          ${otherSupplierDetails ? `<li><strong>Other Supplier Details:</strong> ${otherSupplierDetails}</li>` : ''}
        </ul>

        <h2>Request Details</h2>
        <ul>
          <li><strong>Request Date:</strong> ${requestDate}</li>
          <li><strong>Request Information:</strong> ${requestInfo}</li>
        </ul>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
