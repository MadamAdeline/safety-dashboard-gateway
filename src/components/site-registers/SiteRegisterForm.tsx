
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteRegisterFormHeader } from "./SiteRegisterFormHeader";
import { SiteRegisterDetailsTab } from "./SiteRegisterDetailsTab";
import { ProductInformationTab } from "./ProductInformationTab";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types/product";
import { useProductDetails } from "@/hooks/use-product-details";

interface SiteRegisterFormProps {
  onClose: () => void;
  initialData?: any | null;
}

export function SiteRegisterForm({ onClose, initialData }: SiteRegisterFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    location_id: initialData?.location_id || "",
    product_id: initialData?.product_id || "",
    override_product_name: initialData?.override_product_name || "",
    exact_location: initialData?.exact_location || "",
    storage_conditions: initialData?.storage_conditions || "",
    status_id: initialData?.status_id || 16, // Default to ACTIVE status
    current_stock_level: initialData?.current_stock_level || null,
    max_stock_level: initialData?.max_stock_level || null,
    uom_id: initialData?.uom_id || null,
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch product details when editing
  const { data: productData } = useProductDetails(initialData?.product_id || "");

  // Update selected product when product data is fetched
  useEffect(() => {
    if (productData) {
      setSelectedProduct(productData);
    }
  }, [productData]);

  const handleSave = async () => {
    if (!formData.location_id || !formData.product_id) {
      toast({
        title: "Error",
        description: "Please select both a location and a product",
        variant: "destructive",
      });
      return;
    }

    // Set the UOM ID from the selected product before saving
    const dataToSave = {
      ...formData,
      uom_id: selectedProduct?.uomId || formData.uom_id,
    };

    setIsSaving(true);
    try {
      if (initialData?.id) {
        // Update existing record
        const { error } = await supabase
          .from('site_registers')
          .update(dataToSave)
          .eq('id', initialData.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Site register updated successfully",
        });
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('site_registers')
          .insert([dataToSave])
          .select();

        if (error) throw error;

        // Update initialData with the newly created record
        if (data && data[0]) {
          initialData = data[0];
        }

        toast({
          title: "Success",
          description: "Site register created successfully",
        });
      }
    } catch (error: any) {
      console.error('Error saving site register:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save site register",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductSelect = (product: Product) => {
    console.log("SiteRegisterForm - Handling product selection with full product:", product);
    setSelectedProduct(product);
    handleFieldChange("product_id", product.id);
    // Set the UOM ID when product is selected
    if (product.uomId) {
      handleFieldChange("uom_id", product.uomId);
    }
  };

  return (
    <div className="max-w-full">
      <SiteRegisterFormHeader
        isEditing={!!initialData}
        onClose={onClose}
        onSave={handleSave}
        isSaving={isSaving}
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
              selectedProduct={selectedProduct}
              isEditing={!!initialData}
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
