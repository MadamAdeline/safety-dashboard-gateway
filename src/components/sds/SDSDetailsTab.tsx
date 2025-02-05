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
  status: "ACTIVE" | "INACTIVE";
  setStatus: (value: "ACTIVE" | "INACTIVE") => void;
  supplier: string;
  setSupplier: (value: string) => void;
}

const suppliers = [
  { value: "supplier1", label: "AUSTRALIAN CHEMICAL REAGENTS" },
  { value: "supplier2", label: "SIGMA ALDRICH" },
  { value: "supplier3", label: "MERCK" },
  { value: "supplier4", label: "THERMO FISHER" },
];

export function SDSDetailsTab({ 
  initialData, 
  isDG, 
  setIsDG, 
  status, 
  setStatus,
  supplier,
  setSupplier 
}: SDSDetailsTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="productName">SDS Product Name *</Label>
          <Input 
            id="productName" 
            placeholder="Enter SDS product name" 
            defaultValue={initialData?.productName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otherNames">Other SDS Product Names</Label>
          <Input id="otherNames" placeholder="Enter other SDS product names" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sdsCode">SDS Product Code *</Label>
          <Input 
            id="sdsCode" 
            placeholder="Enter SDS code" 
            defaultValue={initialData?.productId}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier Name *</Label>
          <div className="flex gap-2">
            <Select 
              value={supplier} 
              onValueChange={setSupplier}
            >
              <SelectTrigger className="w-full">
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
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select 
            value={status} 
            onValueChange={(value: "ACTIVE" | "INACTIVE") => setStatus(value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergency">Emergency Phone</Label>
          <Input id="emergency" placeholder="Enter emergency contact" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="issueDate">Issue Date *</Label>
          <Input 
            id="issueDate" 
            type="date" 
            defaultValue={initialData?.issueDate}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="revisionDate">Revision Date *</Label>
          <Input id="revisionDate" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date *</Label>
          <Input 
            id="expiryDate" 
            type="date" 
            defaultValue={initialData?.expiryDate}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Is this shipment considered as Dangerous Goods? *</Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={isDG ? "default" : "outline"}
              onClick={() => setIsDG(true)}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={!isDG ? "default" : "outline"}
              onClick={() => setIsDG(false)}
            >
              No
            </Button>
          </div>
        </div>
        {isDG && (
          <>
            <div className="space-y-2">
              <Label htmlFor="dgClass">DG Class *</Label>
              <Select defaultValue={initialData?.dgClass?.toString()}>
                <SelectTrigger id="dgClass">
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
              <Select>
                <SelectTrigger id="dgSubDivision">
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