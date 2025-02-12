
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useSDSForm } from "./SDSFormContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function SDSSupplierSelect() {
  const { supplier, setSupplier, initialData, status, readOnly } = useSDSForm();
  const { toast } = useToast();
  
  console.log("SDSSupplierSelect - Initial supplier:", supplier);
  console.log("SDSSupplierSelect - Initial data:", initialData);
  
  const isGlobalLibrary = initialData?.sdsSource === "Global Library";
  const isRequested = status === "REQUESTED";
  const isReadOnly = isGlobalLibrary || isRequested || readOnly;

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

      console.log('Retrieved suppliers:', data);
      return data.map(supplier => ({
        id: supplier.id,
        name: supplier.supplier_name
      }));
    }
  });

  const handleSupplierChange = (value: string) => {
    const select = document.getElementById('supplier-select');
    if (select) {
      select.classList.remove('border-red-500');
    }
    setSupplier(value);
  };

  const handleBlur = () => {
    if (!supplier) {
      const select = document.getElementById('supplier-select');
      if (select) {
        select.classList.add('border-red-500');
      }
      toast({
        title: "Required Field",
        description: "Supplier Name is required",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="supplier" className="after:content-['*'] after:ml-0.5 after:text-red-500">
        Supplier Name
      </Label>
      <div className="flex gap-2">
        <Select 
          value={supplier} 
          onValueChange={handleSupplierChange}
          onOpenChange={(open) => !open && handleBlur()}
          disabled={isReadOnly}
        >
          <SelectTrigger 
            id="supplier-select"
            className={`w-full ${isReadOnly ? "bg-gray-100 cursor-not-allowed text-gray-600" : ""}`}
          >
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
        <Button 
          variant="outline" 
          size="icon" 
          disabled={isReadOnly}
          className={isReadOnly ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
