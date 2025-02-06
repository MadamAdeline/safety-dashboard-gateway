import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSDSForm } from "./SDSFormContext";
import { useEffect } from "react";
import { addYears, format, isValid, parse } from "date-fns";

export function SDSDatesSection() {
  const { formData, setFormData, initialData } = useSDSForm();
  const isGlobalLibrary = initialData?.sdsSource === "Global Library";

  useEffect(() => {
    if (formData.issueDate) {
      console.log("Calculating expiry date from issue date:", formData.issueDate);
      try {
        const issueDate = parse(formData.issueDate, 'yyyy-MM-dd', new Date());
        if (isValid(issueDate)) {
          const expiryDate = addYears(issueDate, 5);
          setFormData(prev => ({
            ...prev,
            expiryDate: format(expiryDate, 'yyyy-MM-dd')
          }));
        } else {
          console.error("Invalid issue date:", formData.issueDate);
        }
      } catch (error) {
        console.error("Error calculating expiry date:", error);
      }
    }
  }, [formData.issueDate, setFormData]);

  const handleInputChange = (field: string, value: string) => {
    console.log("Input change:", field, value);
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="grid grid-cols-3 gap-4">
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
          value={formData.revisionDate}
          onChange={(e) => handleInputChange('revisionDate', e.target.value)}
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
    </div>
  );
}