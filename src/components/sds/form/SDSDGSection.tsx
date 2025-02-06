import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSDSForm } from "./SDSFormContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function SDSDGSection() {
  const { 
    isDG, 
    setIsDG, 
    formData, 
    setFormData,
    initialData 
  } = useSDSForm();
  
  const isGlobalLibrary = initialData?.sdsSource === "Global Library";

  const { data: masterData = [] } = useQuery({
    queryKey: ['masterData'],
    queryFn: async () => {
      console.log('Fetching master data for lookups');
      const { data, error } = await supabase
        .from('master_data')
        .select('*')
        .in('category', ['DG_CLASS', 'PACKING_GROUP', 'DG_SUBDIVISION'])
        .eq('status', 'ACTIVE')
        .order('sort_order');

      if (error) {
        console.error('Error fetching master data:', error);
        throw error;
      }

      console.log('Retrieved master data:', data);
      return data;
    }
  });

  const dgClasses = masterData.filter(item => item.category === 'DG_CLASS');
  const packingGroups = masterData.filter(item => item.category === 'PACKING_GROUP');
  const dgSubDivisions = masterData.filter(item => item.category === 'DG_SUBDIVISION');

  const handleInputChange = (field: string, value: string) => {
    console.log("Input change:", field, value);
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isDG) {
    return (
      <div className="space-y-2">
        <Label>Is this shipment considered as Dangerous Goods? *</Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => !isGlobalLibrary && setIsDG(true)}
            disabled={isGlobalLibrary}
            className={isGlobalLibrary ? "opacity-50" : ""}
          >
            Yes
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => !isGlobalLibrary && setIsDG(false)}
            disabled={isGlobalLibrary}
            className={isGlobalLibrary ? "opacity-50" : ""}
          >
            No
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Is this shipment considered as Dangerous Goods? *</Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="default"
            onClick={() => !isGlobalLibrary && setIsDG(true)}
            disabled={isGlobalLibrary}
            className={isGlobalLibrary ? "opacity-50" : ""}
          >
            Yes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => !isGlobalLibrary && setIsDG(false)}
            disabled={isGlobalLibrary}
            className={isGlobalLibrary ? "opacity-50" : ""}
          >
            No
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dgClass">DG Class *</Label>
          <Select 
            value={formData.dgClass?.toString() || ""} 
            onValueChange={(value) => handleInputChange('dgClass', value)}
            disabled={isGlobalLibrary}
          >
            <SelectTrigger id="dgClass" className={isGlobalLibrary ? "bg-gray-100" : ""}>
              <SelectValue placeholder="Select DG Class" />
            </SelectTrigger>
            <SelectContent>
              {dgClasses.map((dgClass) => (
                <SelectItem key={dgClass.id} value={dgClass.label}>
                  {dgClass.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subsidiaryDgClass">Subsidiary DG Class</Label>
          <Select 
            value={formData.subsidiaryDgClass || ""} 
            onValueChange={(value) => handleInputChange('subsidiaryDgClass', value)}
            disabled={isGlobalLibrary}
          >
            <SelectTrigger id="subsidiaryDgClass" className={isGlobalLibrary ? "bg-gray-100" : ""}>
              <SelectValue placeholder="Select Subsidiary DG Class" />
            </SelectTrigger>
            <SelectContent>
              {dgClasses.map((dgClass) => (
                <SelectItem key={dgClass.id} value={dgClass.label}>
                  {dgClass.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="packingGroup">Packing Group</Label>
          <Select 
            value={formData.packingGroup || ""} 
            onValueChange={(value) => handleInputChange('packingGroup', value)}
            disabled={isGlobalLibrary}
          >
            <SelectTrigger id="packingGroup" className={isGlobalLibrary ? "bg-gray-100" : ""}>
              <SelectValue placeholder="Select Packing Group" />
            </SelectTrigger>
            <SelectContent>
              {packingGroups.map((group) => (
                <SelectItem key={group.id} value={group.label}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dgSubDivision">DG Sub Division</Label>
          <Select 
            value={formData.dgSubDivision || ""} 
            onValueChange={(value) => handleInputChange('dgSubDivision', value)}
            disabled={isGlobalLibrary}
          >
            <SelectTrigger id="dgSubDivision" className={isGlobalLibrary ? "bg-gray-100" : ""}>
              <SelectValue placeholder="Select DG Sub Division" />
            </SelectTrigger>
            <SelectContent>
              {dgSubDivisions.map((subdivision) => (
                <SelectItem key={subdivision.id} value={subdivision.label}>
                  {subdivision.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
      </div>
    </div>
  );
}