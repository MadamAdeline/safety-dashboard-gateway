
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { SDSRequestFormData } from "@/types/sdsRequest";

interface SDSRequestFormProps {
  formData: SDSRequestFormData;
  onFormChange: (formData: SDSRequestFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SDSRequestForm({ formData, onFormChange, onSubmit }: SDSRequestFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="productName">SDS Product Name *</Label>
        <Input 
          id="productName"
          value={formData.productName}
          onChange={(e) => onFormChange({ ...formData, productName: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="productCode">SDS Product Code *</Label>
        <Input 
          id="productCode"
          value={formData.productCode}
          onChange={(e) => onFormChange({ ...formData, productCode: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="otherProductName">Other Product Name</Label>
        <Input 
          id="otherProductName"
          value={formData.otherProductName}
          onChange={(e) => onFormChange({ ...formData, otherProductName: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="supplierName">Supplier Name *</Label>
        <Input 
          id="supplierName"
          value={formData.supplierName}
          onChange={(e) => onFormChange({ ...formData, supplierName: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="otherSupplierDetails">Other Supplier Details</Label>
        <Textarea 
          id="otherSupplierDetails"
          value={formData.otherSupplierDetails}
          onChange={(e) => onFormChange({ ...formData, otherSupplierDetails: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="requestInfo">Request Information *</Label>
        <Textarea 
          id="requestInfo"
          value={formData.requestInfo}
          onChange={(e) => onFormChange({ ...formData, requestInfo: e.target.value })}
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
  );
}
