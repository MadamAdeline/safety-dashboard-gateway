
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
    isDuplicating: false // Add this flag to track duplication state
  });

  const handleDuplicate = () => {
    // Create a new form state by duplicating the current data
    setFormData(prev => ({
      ...prev,
      name: "",
      code: "",
      isDuplicating: true // Set the flag when duplicating
    }));
    // Clear the initialData to trigger creation mode
    initialData = null;
  };

  const [statusOptions, setStatusOptions] = useState<{ id: number; name: string; category: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStatusOptions = async () => {
      console.log('Fetching status options...');
      try {
        const { data, error } = await supabase
          .from('status_lookup')
          .select('id, status_name, category')
          .in('category', ['PRODUCT_APPROVAL', 'PRODUCT_STATUS'])
          .order('category', { ascending: true })
          .order('status_name', { ascending: true });

        if (error) {
          console.error('Error fetching status options:', error);
          throw error;
        }

        console.log('Fetched status options:', data);
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
      // Fetch the complete product data including UOM when editing
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

          if (error) {
            console.error('Error fetching product details:', error);
            throw error;
          }

          if (data) {
            setFormData(prev => ({
              ...prev,
              uomId: data.uom_id || "",
              // Update other fields if needed
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

  const checkDuplicateCode = async (code: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('product_code', code)
      .maybeSingle();

    if (error) {
      console.error('Error checking duplicate code:', error);
      return false;
    }

    // If we're editing and the found product is the current one, it's not a duplicate
    if (data && initialData && data.id === initialData.id) {
      return false;
    }

    return !!data;
  };

  const checkDuplicateProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('product_name', formData.name)
      .eq('product_code', formData.code)
      .eq('sds_id', formData.sdsId)
      .maybeSingle();

    if (error) {
      console.error('Error checking duplicate product:', error);
      return false;
    }

    // If we're editing and the found product is the current one, it's not a duplicate
    if (data && initialData && data.id === initialData.id) {
      return false;
    }

    return !!data;
  };

  const handleSave = async () => {
    try {
      // Check for duplicate product code
      const isDuplicateCode = await checkDuplicateCode(formData.code);
      if (isDuplicateCode) {
        toast({
          title: "Error",
          description: "This product code is already in use. Please use a different code.",
          variant: "destructive",
        });
        return;
      }

      // Check for duplicate product (name, code, and SDS combination)
      const isDuplicateProduct = await checkDuplicateProduct();
      if (isDuplicateProduct) {
        toast({
          title: "Error",
          description: "Product already exists. Please update the Product Name, Code or SDS",
          variant: "destructive",
        });
        return;
      }

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

      // Always insert a new record when duplicating (initialData will be null)
      if (initialData?.id && !formData.isDuplicating) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
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
