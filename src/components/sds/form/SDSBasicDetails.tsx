import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSDSForm } from "./SDSFormContext";

export function SDSBasicDetails() {
  const { formData, setFormData, initialData } = useSDSForm();
  const isGlobalLibrary = initialData?.sdsSource === "Global Library";

  const handleInputChange = (field: string, value: string) => {
    console.log("Input change:", field, value);
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
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
          value={formData.otherNames}
          onChange={(e) => handleInputChange('otherNames', e.target.value)}
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
        <Label htmlFor="emergency">Emergency Phone</Label>
        <Input 
          id="emergency" 
          placeholder="Enter emergency contact" 
          value={formData.emergencyPhone}
          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
          readOnly={isGlobalLibrary}
          className={isGlobalLibrary ? "bg-gray-100" : ""}
        />
      </div>
    </div>
  );
}