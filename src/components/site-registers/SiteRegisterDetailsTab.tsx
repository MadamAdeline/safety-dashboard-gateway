
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Location } from "@/types/location";
import type { Product } from "@/types/product";
import { LocationSelection } from "./LocationSelection";
import { ProductSelection } from "./ProductSelection";

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
  selectedProduct: Product | null;
}

export function SiteRegisterDetailsTab({ 
  formData, 
  onChange,
  onProductSelect,
  selectedProduct
}: SiteRegisterDetailsTabProps) {
  const handleLocationSelect = (location: Location) => {
    onChange("location_id", location.id);
  };

  return (
    <div className="space-y-6">
      <LocationSelection
        locationId={formData.location_id}
        onLocationSelect={handleLocationSelect}
      />

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
