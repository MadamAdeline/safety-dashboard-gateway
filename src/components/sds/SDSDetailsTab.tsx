import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
}

export function SDSDetailsTab(props: SDSDetailsTabProps) {
  const isGlobalLibrary = props.initialData?.sdsSource === "Global Library";
  const isRequested = props.status === "REQUESTED" && isGlobalLibrary;

  return (
    <SDSFormContext.Provider value={props}>
      <div className="space-y-4">
        {isRequested && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
            SDS has been requested from DGXprt. You will be notified when it is added
          </div>
        )}

        <SDSBasicDetails />
        
        <div className="grid grid-cols-2 gap-4">
          <SDSSupplierSelect />

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={props.status} 
              onValueChange={(value: "ACTIVE" | "INACTIVE" | "REQUESTED") => props.setStatus(value)}
              disabled={props.status === "REQUESTED"}
            >
              <SelectTrigger id="status" className={props.status === "REQUESTED" ? "bg-gray-100" : ""}>
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
              value={isGlobalLibrary ? "Global Library" : "Customer"}
              readOnly
              className="bg-gray-100"
            />
          </div>
        </div>

        <SDSDatesSection />
        <SDSDGSection />
      </div>
    </SDSFormContext.Provider>
  );
}