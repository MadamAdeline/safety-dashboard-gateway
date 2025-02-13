import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SDS } from "@/types/sds";
import { SDSFormContext } from "./form/SDSFormContext";
import { SDSBasicDetails } from "./form/SDSBasicDetails";
import { SDSSupplierSelect } from "./form/SDSSupplierSelect";
import { SDSDatesSection } from "./form/SDSDatesSection";
import { SDSDGSection } from "./form/SDSDGSection";

interface SDSDetailsTabProps {
  initialData?: SDS | null;
  isDG: boolean;
  setIsDG: (value: boolean) => void;
  status: "ACTIVE" | "INACTIVE" | "REQUESTED";
  setStatus: (value: "ACTIVE" | "INACTIVE" | "REQUESTED") => void;
  supplier: string;
  setSupplier: (value: string) => void;
  formData: any;
  setFormData: (value: any) => void;
  dgClassId: string;
  setDgClassId: (value: string) => void;
  subsidiaryDgClassId: string;
  setSubsidiaryDgClassId: (value: string) => void;
  packingGroupId: string;
  setPackingGroupId: (value: string) => void;
  dgSubDivisionId: string;
  setDgSubDivisionId: (value: string) => void;
  readOnly?: boolean;
}

export function SDSDetailsTab(props: SDSDetailsTabProps) {
  console.log("SDSDetailsTab - Initial Data:", props.initialData);
  const isGlobalLibrary = props.initialData?.sdsSource === "Global Library";
  const isRequested = props.status === "REQUESTED";
  const source = props.initialData?.sdsSource || "Customer";

  const validateForm = (): string[] => {
    const missingFields: string[] = [];
    
    // Validate product name
    if (!props.formData.productName?.trim()) {
      const input = document.getElementById('productName');
      if (input) input.classList.add('border-red-500');
      missingFields.push('SDS Product Name');
    }

    // Validate product code
    if (!props.formData.productId?.trim()) {
      const input = document.getElementById('productId');
      if (input) input.classList.add('border-red-500');
      missingFields.push('SDS Product Code');
    }

    // Validate supplier
    if (!props.supplier) {
      const select = document.getElementById('supplier-select');
      if (select) select.classList.add('border-red-500');
      missingFields.push('Supplier Name');
    }

    return missingFields;
  };

  return (
    <SDSFormContext.Provider value={{ ...props, readOnly: props.readOnly, validateForm }}>
      <div className="space-y-4">
        {isRequested && (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md mb-4">
            This SDS has been requested from DGXprt. It will be updated when the SDS is added.
          </div>
        )}

        <SDSBasicDetails />
        
        <SDSSupplierSelect />

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select 
            value={props.status} 
            onValueChange={(value: "ACTIVE" | "INACTIVE" | "REQUESTED") => props.setStatus(value)}
            disabled={isRequested || props.readOnly}
          >
            <SelectTrigger id="status" className={isRequested || props.readOnly ? "bg-gray-100 w-full" : "w-full"}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="REQUESTED">Requested</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input 
            id="source" 
            value={source}
            readOnly
            className="bg-gray-100"
          />
        </div>

        <SDSDatesSection />

        {isRequested && props.initialData && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Request Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Request Date</Label>
                <Input 
                  value={props.initialData.requestDate || ''} 
                  readOnly 
                  className="bg-gray-100" 
                />
              </div>

              <div className="space-y-2">
                <Label>Requested By</Label>
                <Input 
                  value={props.initialData.requestedBy || ''} 
                  readOnly 
                  className="bg-gray-100" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Requested Supplier Name</Label>
              <Input 
                value={props.initialData.requestSupplierName || ''} 
                readOnly 
                className="bg-gray-100" 
              />
            </div>

            <div className="space-y-2">
              <Label>Other Supplier Details</Label>
              <Textarea 
                value={props.initialData.requestSupplierDetails || ''} 
                readOnly 
                className="bg-gray-100 min-h-[100px]" 
              />
            </div>

            <div className="space-y-2">
              <Label>Request Information</Label>
              <Textarea 
                value={props.initialData.requestInformation || ''} 
                readOnly 
                className="bg-gray-100 min-h-[100px]" 
              />
            </div>
          </div>
        )}

        {!isRequested && <SDSDGSection />}
      </div>
    </SDSFormContext.Provider>
  );
}
