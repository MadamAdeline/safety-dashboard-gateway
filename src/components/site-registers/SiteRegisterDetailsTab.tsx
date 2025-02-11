
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationSearch } from "@/components/locations/LocationSearch";
import { ProductSearch } from "@/components/products/ProductSearch";
import type { Location } from "@/types/location";
import type { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteRegisterDetailsTabProps {
  formData: {
    location_id: string;
    product_id: string;
    override_product_name: string;
    exact_location: string;
    storage_conditions: string;
  };
  onChange: (field: string, value: string) => void;
  onProductSelect: (product: Product) => void;
}

export function SiteRegisterDetailsTab({ 
  formData, 
  onChange,
  onProductSelect 
}: SiteRegisterDetailsTabProps) {
  // Fetch current location if location_id exists
  const { data: currentLocation } = useQuery({
    queryKey: ['location', formData.location_id],
    queryFn: async () => {
      if (!formData.location_id) return null;
      
      const { data, error } = await supabase
        .from('locations')
        .select(`
          id,
          name,
          type_id,
          parent_location_id,
          status_id,
          coordinates,
          full_path,
          master_data (id, label),
          status_lookup (id, status_name)
        `)
        .eq('id', formData.location_id)
        .single();
      
      if (error) throw error;
      return data ? {
        ...data,
        coordinates: data.coordinates || null,
        parent_location_id: data.parent_location_id || null,
      } as Location : null;
    },
    enabled: !!formData.location_id
  });

  const handleLocationSelect = (location: Location) => {
    onChange("location_id", location.id);
  };

  const handleProductSelect = (product: Product) => {
    onChange("product_id", product.id);
    onProductSelect(product);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Location</Label>
        <LocationSearch
          selectedLocationId={formData.location_id}
          initialLocation={currentLocation}
          onLocationSelect={handleLocationSelect}
          className="w-full"
        />
        {currentLocation?.full_path && (
          <Input
            value={currentLocation.full_path}
            readOnly
            className="mt-2 bg-gray-50 text-gray-600"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Product</Label>
        <ProductSearch
          selectedProductId={formData.product_id}
          onProductSelect={handleProductSelect}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="override_product_name">Override Product Name</Label>
        <Input
          id="override_product_name"
          value={formData.override_product_name}
          onChange={(e) => onChange("override_product_name", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exact_location">Exact Location</Label>
        <Input
          id="exact_location"
          value={formData.exact_location}
          onChange={(e) => onChange("exact_location", e.target.value)}
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
    </div>
  );
}
