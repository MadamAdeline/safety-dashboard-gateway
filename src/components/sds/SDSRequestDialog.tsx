import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface SDSRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestComplete?: () => void;
}

export function SDSRequestDialog({ open, onOpenChange, onRequestComplete }: SDSRequestDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    productName: "",
    productCode: "",
    otherProductName: "",
    supplierName: "",
    otherSupplierDetails: "",
    requestInfo: ""
  });

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
            status_id: statusData.id // Using the same status ID as it's active
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
          supplier_id: supplierId
        })
        .select()
        .single();

      if (sdsError) throw sdsError;

      toast({
        title: "Request Submitted",
        description: "Your SDS request has been sent to the DGXprt team.",
      });
      
      // Close the dialog and reset form
      onOpenChange(false);
      if (onRequestComplete) {
        onRequestComplete();
      }
      queryClient.invalidateQueries({ queryKey: ['sds'] });
      
      setFormData({
        productName: "",
        productCode: "",
        otherProductName: "",
        supplierName: "",
        otherSupplierDetails: "",
        requestInfo: ""
      });
    } catch (error) {
      console.error("Error submitting SDS request:", error);
      toast({
        title: "Error",
        description: "Failed to submit SDS request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request SDS from DGXprt</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">SDS Product Name *</Label>
            <Input 
              id="productName"
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="productCode">SDS Product Code *</Label>
            <Input 
              id="productCode"
              value={formData.productCode}
              onChange={(e) => setFormData(prev => ({ ...prev, productCode: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="otherProductName">Other Product Name</Label>
            <Input 
              id="otherProductName"
              value={formData.otherProductName}
              onChange={(e) => setFormData(prev => ({ ...prev, otherProductName: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name *</Label>
            <Input 
              id="supplierName"
              value={formData.supplierName}
              onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="otherSupplierDetails">Other Supplier Details</Label>
            <Textarea 
              id="otherSupplierDetails"
              value={formData.otherSupplierDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, otherSupplierDetails: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requestInfo">Request Information *</Label>
            <Textarea 
              id="requestInfo"
              value={formData.requestInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, requestInfo: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requestDate">Request Date</Label>
            <Input 
              id="requestDate" 
              value={format(new Date(), "yyyy-MM-dd")} 
              readOnly 
              className="bg-gray-100" 
            />
          </div>
          
          <Button type="submit" className="w-full">Submit Request</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}