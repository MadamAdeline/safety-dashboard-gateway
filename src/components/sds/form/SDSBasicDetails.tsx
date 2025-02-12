
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSDSForm } from "./SDSFormContext";
import { useToast } from "@/components/ui/use-toast";

export function SDSBasicDetails() {
  const { formData, setFormData, initialData, status, readOnly } = useSDSForm();
  const { toast } = useToast();
  const isGlobalLibrary = initialData?.sdsSource === "Global Library";
  const isRequested = status === "REQUESTED";
  const isReadOnly = isGlobalLibrary || isRequested || readOnly;

  const handleInputChange = (field: string, value: string) => {
    console.log("Input change:", field, value);
    
    // Clear any previous error styling
    const input = document.getElementById(field);
    if (input) {
      input.classList.remove('border-red-500');
    }

    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const validateField = (field: string, value: string) => {
    if (!value || value.trim() === '') {
      const input = document.getElementById(field);
      if (input) {
        input.classList.add('border-red-500');
      }
      toast({
        title: "Required Field",
        description: `${field === 'productName' ? 'SDS Product Name' : 
                      field === 'productId' ? 'SDS Product Code' : 
                      'Field'} is required`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="productName" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          SDS Product Name
        </Label>
        <Input 
          id="productName" 
          placeholder="Enter SDS product name" 
          value={formData.productName}
          onChange={(e) => handleInputChange('productName', e.target.value)}
          onBlur={(e) => handleBlur('productName', e.target.value)}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-gray-100 cursor-not-allowed text-gray-600" : ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="otherNames">Other SDS Product Names</Label>
        <Input 
          id="otherNames" 
          placeholder="Enter other SDS product names" 
          value={formData.otherNames}
          onChange={(e) => handleInputChange('otherNames', e.target.value)}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-gray-100 cursor-not-allowed text-gray-600" : ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="productId" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          SDS Product Code
        </Label>
        <Input 
          id="productId" 
          placeholder="Enter SDS code" 
          value={formData.productId}
          onChange={(e) => handleInputChange('productId', e.target.value)}
          onBlur={(e) => handleBlur('productId', e.target.value)}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-gray-100 cursor-not-allowed text-gray-600" : ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emergency">Emergency Phone</Label>
        <Input 
          id="emergency" 
          placeholder="Enter emergency contact" 
          value={formData.emergencyPhone}
          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-gray-100 cursor-not-allowed text-gray-600" : ""}
        />
      </div>
    </div>
  );
}
