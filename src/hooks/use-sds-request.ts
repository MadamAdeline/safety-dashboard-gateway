
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { SDSRequestFormData } from "@/types/sdsRequest";

export function useSDSRequest(onRequestComplete?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SDSRequestFormData>({
    productName: "",
    productCode: "",
    otherProductName: "",
    supplierName: "",
    otherSupplierDetails: "",
    requestInfo: ""
  });

  const resetForm = () => {
    setFormData({
      productName: "",
      productCode: "",
      otherProductName: "",
      supplierName: "",
      otherSupplierDetails: "",
      requestInfo: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting SDS request:", formData);
    
    try {
      // Get the status ID for "REQUESTED"
      const { data: statusData } = await supabase
        .from('status_lookup')
        .select('id')
        .eq('category', 'SDS_Library')
        .eq('status_name', 'REQUESTED')
        .single();

      if (!statusData) {
        throw new Error("Could not find REQUESTED status ID");
      }

      // Get or create the DGXprt supplier
      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('id')
        .eq('supplier_name', 'DGXprt')
        .maybeSingle();

      if (supplierError) throw supplierError;

      let supplierId;
      if (!supplierData) {
        // Create DGXprt supplier if it doesn't exist
        const { data: newSupplier, error: createError } = await supabase
          .from('suppliers')
          .insert({
            supplier_name: 'DGXprt',
            contact_person: 'DGXprt Team',
            email: 'support@dgxprt.com',
            address: 'DGXprt HQ',
            status_id: statusData.id
          })
          .select('id')
          .single();

        if (createError) throw createError;
        supplierId = newSupplier.id;
      } else {
        supplierId = supplierData.id;
      }

      // Create new SDS record
      const { data: sdsData, error: sdsError } = await supabase
        .from('sds')
        .insert({
          product_name: formData.productName,
          product_id: formData.productCode,
          other_names: formData.otherProductName,
          request_supplier_name: formData.supplierName,
          request_supplier_details: formData.otherSupplierDetails,
          request_information: formData.requestInfo,
          request_date: format(new Date(), 'yyyy-MM-dd'),
          requested_by: "d.c.adeline@gmail.com",
          status_id: statusData.id,
          supplier_id: supplierId,
          source: "Global Library"
        })
        .select()
        .single();

      if (sdsError) throw sdsError;

      toast({
        title: "Request Submitted",
        description: "Your SDS request has been sent to the DGXprt team.",
      });
      
      if (onRequestComplete) {
        onRequestComplete();
      }
      queryClient.invalidateQueries({ queryKey: ['sds'] });
      resetForm();
      
    } catch (error) {
      console.error("Error submitting SDS request:", error);
      toast({
        title: "Error",
        description: "Failed to submit SDS request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    formData,
    setFormData,
    handleSubmit
  };
}
