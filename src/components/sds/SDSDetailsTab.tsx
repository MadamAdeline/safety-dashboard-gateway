import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { SDS } from "@/types/sds";

interface SDSDetailsTabProps {
  initialData?: SDS | null;
  isDG: boolean;
  setIsDG: (value: boolean) => void;
  status: "ACTIVE" | "INACTIVE" | "REQUESTED";
  setStatus: (value: "ACTIVE" | "INACTIVE" | "REQUESTED") => void;
  supplier: string;
  setSupplier: (value: string) => void;
  formData: {
    productName: string;
    productId: string;
    issueDate: string;
    expiryDate: string;
    dgClass?: number;
  };
  setFormData: (value: any) => void;
}

const suppliers = [
  { value: "supplier1", label: "AUSTRALIAN CHEMICAL REAGENTS" },
  { value: "supplier2", label: "SIGMA ALDRICH" },
  { value: "supplier3", label: "MERCK" },
  { value: "supplier4", label: "THERMO FISHER" },
  { value: "supplier5", label: "BP Australia Pty Ltd" },
];

export function SDSDetailsTab({ 
  initialData, 
  isDG, 
  setIsDG, 
  status, 
  setStatus,
  supplier,
  setSupplier,
  formData,
  setFormData
}: SDSDetailsTabProps) {
  const isGlobalLibrary = initialData?.sdsSource === "Global Library";
  const isRequested = status === "REQUESTED" && isGlobalLibrary;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      {isRequested && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md mb-4">
          SDS has been requested from DGXprt. You will be notified when it is added
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="productName">SDS Product Name *</Label>
          <Input 
            id="productName" 
            placeholder="Enter SDS product name" 
            value={formData.productName}
            onChange={(e) => handleInputChange('productName', e.target.value)}
            readOnly={isGlobalLibrary}
            className={isGlobalLibrary ? "bg-gray-100" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otherNames">Other SDS Product Names</Label>
          <Input 
            id="otherNames" 
            placeholder="Enter other SDS product names" 
            readOnly={isGlobalLibrary}
            className={isGlobalLibrary ? "bg-gray-100" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sdsCode">SDS Product Code *</Label>
          <Input 
            id="sdsCode" 
            placeholder="Enter SDS code" 
            value={formData.productId}
            onChange={(e) => handleInputChange('productId', e.target.value)}
            readOnly={isGlobalLibrary}
            className={isGlobalLibrary ? "bg-gray-100" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier Name *</Label>
          <div className="flex gap-2">
            <Select 
              value={supplier} 
              onValueChange={setSupplier}
              disabled={isGlobalLibrary}
            >
              <SelectTrigger className={`w-full ${isGlobalLibrary ? "bg-gray-100" : ""}`}>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.value} value={s.label}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" disabled={isGlobalLibrary}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select 
            value={status} 
            onValueChange={(value: "ACTIVE" | "INACTIVE" | "REQUESTED") => setStatus(value)}
            disabled={status === "REQUESTED"}
          >
            <SelectTrigger id="status" className={status === "REQUESTED" ? "bg-gray-100" : ""}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="REQUESTED">Requested</SelectItem>
            </SelectContent>
          </Select>
        </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergency">Emergency Phone</Label>
          <Input 
            id="emergency" 
            placeholder="Enter emergency contact" 
            readOnly={isGlobalLibrary}
            className={isGlobalLibrary ? "bg-gray-100" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="issueDate">Issue Date *</Label>
          <Input 
            id="issueDate" 
            type="date" 
            defaultValue={initialData?.issueDate}
            readOnly={isGlobalLibrary}
            className={isGlobalLibrary ? "bg-gray-100" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="revisionDate">Revision Date *</Label>
          <Input 
            id="revisionDate" 
            type="date"
            readOnly={isGlobalLibrary}
            className={isGlobalLibrary ? "bg-gray-100" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date *</Label>
          <Input 
            id="expiryDate" 
            type="date" 
            defaultValue={initialData?.expiryDate}
            readOnly={isGlobalLibrary}
            className={isGlobalLibrary ? "bg-gray-100" : ""}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Is this shipment considered as Dangerous Goods? *</Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={isDG ? "default" : "outline"}
              onClick={() => !isGlobalLibrary && setIsDG(true)}
              disabled={isGlobalLibrary}
              className={isGlobalLibrary ? "opacity-50" : ""}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={!isDG ? "default" : "outline"}
              onClick={() => !isGlobalLibrary && setIsDG(false)}
              disabled={isGlobalLibrary}
              className={isGlobalLibrary ? "opacity-50" : ""}
            >
              No
            </Button>
          </div>
        </div>

        {isDG && (
          <>
            <div className="space-y-2">
              <Label htmlFor="dgClass">DG Class *</Label>
              <Select 
                value={formData.dgClass?.toString()} 
                onValueChange={(value) => handleInputChange('dgClass', parseInt(value))}
                disabled={isGlobalLibrary}
              >
                <SelectTrigger id="dgClass" className={isGlobalLibrary ? "bg-gray-100" : ""}>
                  <SelectValue placeholder="Select DG Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Class 1 - Explosives</SelectItem>
                  <SelectItem value="2">Class 2 - Gases</SelectItem>
                  <SelectItem value="3">Class 3 - Flammable Liquids</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dgSubDivision">DG Sub Division *</Label>
              <Select disabled={isGlobalLibrary}>
                <SelectTrigger id="dgSubDivision" className={isGlobalLibrary ? "bg-gray-100" : ""}>
                  <SelectValue placeholder="Select Sub Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.1">1.1</SelectItem>
                  <SelectItem value="1.2">1.2</SelectItem>
                  <SelectItem value="1.3">1.3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
