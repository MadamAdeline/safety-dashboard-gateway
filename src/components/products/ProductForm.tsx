
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import type { Product } from "@/types/product";
import type { SDS } from "@/types/sds";
import { supabase } from "@/integrations/supabase/client";
import { ProductFormHeader } from "./ProductFormHeader";
import { ProductDetailsTab } from "./ProductDetailsTab";
import { ProductSDSTab } from "./ProductSDSTab";

interface ProductFormProps {
  onClose: () => void;
  onSave: () => void;
  initialData?: Product | null;
}

export function ProductForm({ onClose, onSave, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    code: initialData?.code ?? "",
    brandName: initialData?.brandName ?? "",
    uomId: initialData?.uomId ?? "",
    unitSize: initialData?.unitSize ?? 0,
    description: initialData?.description ?? "",
    productSet: initialData?.productSet ?? false,
    aerosol: initialData?.aerosol ?? false,
    cryogenicFluid: initialData?.cryogenicFluid ?? false,
    otherNames: initialData?.otherNames ?? "",
    uses: initialData?.uses ?? "",
    approvalStatusId: initialData?.approvalStatusId ?? null,
    productStatusId: initialData?.productStatusId ?? 12, // Default to ACTIVE (12)
    sdsId: initialData?.sdsId ?? null,
    isDuplicating: false
  });

  const handleDuplicate = () => {
    setFormData(prev => ({
      ...prev,
      name: "",
      code: "",
      isDuplicating: true
    }));
    initialData = null;
  };

  const [statusOptions, setStatusOptions] = useState<{ id: number; name: string; category: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('status_lookup')
          .select('id, status_name, category')
          .in('category', ['PRODUCT_APPROVAL', 'PRODUCT_STATUS'])
          .order('category', { ascending: true })
          .order('status_name', { ascending: true });

        if (error) throw error;

        setStatusOptions(data.map(item => ({
          id: item.id,
          name: item.status_name,
          category: item.category
        })));
      } catch (error) {
        console.error('Failed to fetch status options:', error);
        toast({
          title: "Error",
          description: "Failed to load status options",
          variant: "destructive",
        });
      }
    };

    fetchStatusOptions();
  }, [toast]);

  useEffect(() => {
    if (initialData?.id) {
      const fetchProductData = async () => {
        try {
          const { data, error } = await supabase
            .from('products')
            .select(`
              *,
              uom:master_data!products_uom_id_fkey (
                id,
                label
              )
            `)
            .eq('id', initialData.id)
            .single();

          if (error) throw error;

          if (data) {
            setFormData(prev => ({
              ...prev,
              uomId: data.uom_id || "",
            }));
          }
        } catch (error) {
          console.error('Failed to fetch product details:', error);
          toast({
            title: "Error",
            description: "Failed to load product details",
            variant: "destructive",
          });
        }
      };

      fetchProductData();
    }
  }, [initialData?.id, toast]);

  const handleDuplicateError = (error: any) => {
    try {
      // Extract error details from the response
      const errorDetails = typeof error.message === 'object' ? error.message : JSON.parse(error.message);
      const constraintMatch = errorDetails.details.match(/\((.*?)\)=\((.*?)\)/);
      
      if (!constraintMatch) {
        throw new Error('Unable to parse error details');
      }
      
      const [fields, values] = [constraintMatch[1].split(', '), constraintMatch[2].split(', ')];
      const conflictingFields = fields.map((field: string, i: number) => {
        const fieldName = field.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return `${fieldName}: ${values[i]}`;
      });

      toast({
        title: "Duplicate Product",
        description: `Cannot save product. The following combination already exists:\n${conflictingFields.join('\n')}\n\nPlease modify at least one of these fields.`,
        variant: "destructive",
      });
    } catch (parseError) {
      console.error('Error parsing duplicate error:', parseError);
      toast({
        title: "Duplicate Product",
        description: "A product with the same name, code, and SDS combination already exists. Please modify at least one of these fields.",
        variant: "destructive",
      });
    }
  };

  const validateProduct = async (productData: any) => {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('product_name', productData.product_name)
      .eq('product_code', productData.product_code)
      .eq('sds_id', productData.sds_id)
      .maybeSingle();

    if (data && (!initialData?.id || data.id !== initialData.id)) {
      toast({
        title: "Validation Error",
        description: "A product with this name, code, and SDS combination already exists.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    try {
      const productData = {
        product_name: formData.name,
        product_code: formData.code,
        brand_name: formData.brandName,
        uom_id: formData.uomId || null,
        unit: null,
        unit_size: formData.unitSize,
        description: formData.description,
        product_set: formData.productSet,
        aerosol: formData.aerosol,
        cryogenic_fluid: formData.cryogenicFluid,
        other_names: formData.otherNames,
        uses: formData.uses,
        approval_status_id: formData.approvalStatusId,
        product_status_id: formData.productStatusId,
        sds_id: formData.sdsId
      };

      // Validate before saving
      const isValid = await validateProduct(productData);
      if (!isValid) return;

      if (initialData?.id && !formData.isDuplicating) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id);

        if (error) {
          if (error.code === '23505') {
            handleDuplicateError(error);
            return;
          }
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) {
          if (error.code === '23505') {
            handleDuplicateError(error);
            return;
          }
          throw error;
        }
      }

      onSave();
      
      toast({
        title: "Success",
        description: `Product ${initialData ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const approvalStatusOptions = statusOptions.filter(option => option.category === 'PRODUCT_APPROVAL');
  const productStatusOptions = statusOptions.filter(option => option.category === 'PRODUCT_STATUS');

  const handleSDSSelect = (selectedSDS: SDS | SDS[]) => {
    if (!Array.isArray(selectedSDS)) {
      setFormData(prev => ({ ...prev, sdsId: selectedSDS.id }));
    } else if (selectedSDS.length > 0) {
      setFormData(prev => ({ ...prev, sdsId: selectedSDS[0].id }));
    }
  };

  return (
    <div className="max-w-full">
      <ProductFormHeader
        isEditing={!!initialData}
        onClose={onClose}
        onSave={handleSave}
        onDuplicate={handleDuplicate}
        showDuplicate={!!initialData}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="sds">SDS Information</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <ProductDetailsTab
              formData={formData}
              setFormData={setFormData}
              approvalStatusOptions={approvalStatusOptions}
              productStatusOptions={productStatusOptions}
            />
          </TabsContent>

          <TabsContent value="sds">
            <ProductSDSTab
              sdsId={formData.sdsId}
              onSDSSelect={handleSDSSelect}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
