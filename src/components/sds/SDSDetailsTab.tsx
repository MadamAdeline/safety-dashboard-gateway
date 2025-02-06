import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { SDS } from "@/types/sds";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { addYears, format } from "date-fns";

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
    unNumber?: string;
    unProperShippingName?: string;
    packingGroup?: string;
    hazchemCode?: string;
    subsidiaryDgClass?: string;
  };
  setFormData: (value: any) => void;
}

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

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      console.log('Fetching suppliers from Supabase');
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('status_id', 1);

      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }

      return data.map(supplier => ({
        id: supplier.id,
        name: supplier.supplier_name
      }));
    }
  });

  useEffect(() => {
    if (formData.issueDate) {
      const issueDate = new Date(formData.issueDate);
      const expiryDate = addYears(issueDate, 5);
      setFormData(prev => ({
        ...prev,
        expiryDate: format(expiryDate, 'yyyy-MM-dd')
      }));
    }
  }, [formData.issueDate, setFormData]);

  useEffect(() => {
    // Set initial supplier when editing
    if (initialData?.supplier) {
      const foundSupplier = suppliers.find(s => s.name === initialData.supplier);
      if (foundSupplier) {
        setSupplier(foundSupplier.id);
      }
    }
  }, [initialData, suppliers, setSupplier]);

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
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
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
            value={formData.issueDate}
            onChange={(e) => handleInputChange('issueDate', e.target.value)}
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
            value={formData.expiryDate}
            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unNumber">UN Number</Label>
                <Input 
                  id="unNumber"
                  value={formData.unNumber}
                  onChange={(e) => handleInputChange('unNumber', e.target.value)}
                  placeholder="Enter UN Number"
                  disabled={isGlobalLibrary}
                  className={isGlobalLibrary ? "bg-gray-100" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unProperShippingName">UN Proper Shipping Name</Label>
                <Input 
                  id="unProperShippingName"
                  value={formData.unProperShippingName}
                  onChange={(e) => handleInputChange('unProperShippingName', e.target.value)}
                  placeholder="Enter Proper Shipping Name"
                  disabled={isGlobalLibrary}
                  className={isGlobalLibrary ? "bg-gray-100" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packingGroup">Packing Group</Label>
                <Input 
                  id="packingGroup"
                  value={formData.packingGroup}
                  onChange={(e) => handleInputChange('packingGroup', e.target.value)}
                  placeholder="Enter Packing Group"
                  disabled={isGlobalLibrary}
                  className={isGlobalLibrary ? "bg-gray-100" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hazchemCode">HAZCHEM Code</Label>
                <Input 
                  id="hazchemCode"
                  value={formData.hazchemCode}
                  onChange={(e) => handleInputChange('hazchemCode', e.target.value)}
                  placeholder="Enter HAZCHEM Code"
                  disabled={isGlobalLibrary}
                  className={isGlobalLibrary ? "bg-gray-100" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subsidiaryDgClass">Subsidiary DG Class</Label>
                <Input 
                  id="subsidiaryDgClass"
                  value={formData.subsidiaryDgClass}
                  onChange={(e) => handleInputChange('subsidiaryDgClass', e.target.value)}
                  placeholder="Enter Subsidiary DG Class"
                  disabled={isGlobalLibrary}
                  className={isGlobalLibrary ? "bg-gray-100" : ""}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
