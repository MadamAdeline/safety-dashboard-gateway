
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Location } from "@/types/location";
import type { Product } from "@/types/product";
import { LocationSelection } from "./LocationSelection";
import { ProductSelection } from "./ProductSelection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockMovementsGrid } from "./StockMovementsGrid";

interface SiteRegisterDetailsTabProps {
  formData: {
    id?: string;
    location_id: string;
    product_id: string;
    override_product_name: string;
    exact_location: string;
    storage_conditions: string;
    current_stock_level?: number;
    max_stock_level?: number;
    uom_id?: string;
  };
  onChange: (field: string, value: string | number) => void;
  onProductSelect: (product: Product) => void;
  selectedProduct: Product | null;
  isEditing: boolean;
}

export function SiteRegisterDetailsTab({ 
  formData, 
  onChange,
  onProductSelect,
  selectedProduct,
  isEditing
}: SiteRegisterDetailsTabProps) {
  console.log('SiteRegisterDetailsTab rendering with:', {
    isEditing,
    formDataId: formData?.id,
    hasFormData: !!formData,
    fullFormData: formData
  });

  const handleLocationSelect = (location: Location) => {
    onChange("location_id", location.id);
  };

  // Fetch UOM options from master_data
  const { data: uomOptions } = useQuery({
    queryKey: ['uomOptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_data')
        .select('id, label')
        .eq('category', 'UOM')
        .eq('status', 'ACTIVE')
        .order('sort_order');
      
      if (error) throw error;
      return data;
    }
  });

  // Only show stock movements if we're in edit mode and have a valid ID
  const showStockMovements = isEditing && typeof formData.id === 'string';

  console.log('Stock movements visibility check:', {
    isEditing,
    formDataId: formData?.id,
    showStockMovements,
    typeofId: typeof formData.id
  });

  return (
    <div className="space-y-6">
      <LocationSelection
        locationId={formData.location_id}
        onLocationSelect={handleLocationSelect}
      />

      <div className="space-y-2">
        <Label htmlFor="exact_location">Exact Location (Free Text)</Label>
        <Input
          id="exact_location"
          value={formData.exact_location}
          onChange={(e) => onChange("exact_location", e.target.value)}
        />
      </div>

      <ProductSelection
        productId={formData.product_id}
        selectedProduct={selectedProduct}
        onProductSelect={onProductSelect}
      />

      <div className="space-y-2">
        <Label htmlFor="override_product_name">Override Product Name</Label>
        <Input
          id="override_product_name"
          value={formData.override_product_name}
          onChange={(e) => onChange("override_product_name", e.target.value)}
          placeholder={selectedProduct?.name || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="storage_conditions">Storage Conditions</Label>
        <Textarea
          id="storage_conditions"
          value={formData.storage_conditions}
          onChange={(e) => onChange("storage_conditions", e.target.value)}
          rows={4}
        />
      </div>

      {isEditing && (
        <>
          <div className="pt-4">
            <Label className="text-lg font-semibold">Stock Information</Label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock_level">Current Stock Level</Label>
              <Input
                id="current_stock_level"
                type="number"
                value={formData.current_stock_level || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_stock_level">Max Stock Level</Label>
              <Input
                id="max_stock_level"
                type="number"
                value={formData.max_stock_level || ''}
                onChange={(e) => onChange("max_stock_level", parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uom_id">Unit of Measure</Label>
              <Select
                value={formData.uom_id || selectedProduct?.uomId || ''}
                onValueChange={(value) => onChange("uom_id", value)}
                disabled={true}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit of measure" />
                </SelectTrigger>
                <SelectContent>
                  {uomOptions?.map((uom) => (
                    <SelectItem key={uom.id} value={uom.id}>
                      {uom.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showStockMovements && (
            <div className="pt-8">
              <StockMovementsGrid siteRegisterId={formData.id!} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
