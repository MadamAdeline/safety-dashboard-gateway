
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteRegisterFormHeader } from "./SiteRegisterFormHeader";
import { SiteRegisterDetailsTab } from "./SiteRegisterDetailsTab";
import { ProductInformationTab } from "./ProductInformationTab";
import type { Product } from "@/types/product";

interface SiteRegisterFormProps {
  onClose: () => void;
  initialData?: any | null;
}

export function SiteRegisterForm({ onClose, initialData }: SiteRegisterFormProps) {
  const [formData, setFormData] = useState({
    location_id: initialData?.location_id || "",
    product_id: initialData?.product_id || "",
    override_product_name: initialData?.override_product_name || "",
    exact_location: initialData?.exact_location || "",
    storage_conditions: initialData?.storage_conditions || "",
    status_id: initialData?.status_id || "",
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  console.log("SiteRegisterForm - Selected Product (before passing to ProductInformationTab):", selectedProduct);

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log("Saving site register:", formData);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductSelect = (product: Product) => {
    console.log("SiteRegisterForm - Handling product selection:", product);
    if (product) {
      // Ensure we're setting the complete product object
      setSelectedProduct({
        id: product.id,
        name: product.name,
        code: product.code,
        brandName: product.brandName,
        unit: product.unit,
        uomId: product.uomId,
        uom: product.uom,
        unitSize: product.unitSize,
        description: product.description,
        productSet: product.productSet,
        aerosol: product.aerosol,
        cryogenicFluid: product.cryogenicFluid,
        otherNames: product.otherNames,
        uses: product.uses,
        status: product.status,
        approvalStatusId: product.approvalStatusId,
        productStatusId: product.productStatusId,
        sdsId: product.sdsId,
        sds: product.sds
      });
    }
  };

  return (
    <div className="max-w-full">
      <SiteRegisterFormHeader
        isEditing={!!initialData}
        onClose={onClose}
        onSave={handleSave}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Site Register Product Details</TabsTrigger>
            <TabsTrigger value="master-info">Master Product Information</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <SiteRegisterDetailsTab
              formData={formData}
              onChange={handleFieldChange}
              onProductSelect={handleProductSelect}
            />
          </TabsContent>

          <TabsContent value="master-info">
            <ProductInformationTab product={selectedProduct} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
