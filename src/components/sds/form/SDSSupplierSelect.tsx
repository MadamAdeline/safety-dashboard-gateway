
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useSDSForm } from "./SDSFormContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function SDSSupplierSelect() {
  const { supplier, setSupplier, initialData, status } = useSDSForm();
  console.log("SDSSupplierSelect - Initial supplier:", supplier);
  console.log("SDSSupplierSelect - Initial data:", initialData);
  
  const isGlobalLibrary = initialData?.sdsSource === "Global Library";
  const isRequested = status === "REQUESTED";
  const isReadOnly = isGlobalLibrary || isRequested;

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

  return (
    <div className="space-y-2">
      <Label htmlFor="supplier">Supplier Name *</Label>
      <div className="flex gap-2">
        <Select 
          value={supplier} 
          onValueChange={setSupplier}
          disabled={isReadOnly}
        >
          <SelectTrigger className={`w-full ${isReadOnly ? "bg-gray-100 cursor-not-allowed text-gray-600" : ""}`}>
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
