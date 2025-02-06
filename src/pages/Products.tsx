import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProductList } from "@/components/products/ProductList";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductSearch } from "@/components/products/ProductSearch";
import { ProductActions } from "@/components/products/ProductActions";
import { ProductForm } from "@/components/products/ProductForm";
import type { Product, ProductFilters as ProductFiltersType } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Products() {
  const [filters, setFilters] = useState<ProductFiltersType>({
    search: "",
    supplier: [],
    status: [],
    dgClass: [],
    isDG: null
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products from Supabase...');
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          product_name,
          product_code,
          brand_name,
          unit,
          unit_size,
          description,
          product_set,
          aerosol,
          cryogenic_fluid,
          other_names,
          uses,
          product_status_id,
          approval_status_id,
          sds_id,
          sds (
            id,
            is_dg,
            dg_class_id:master_data!sds_dg_class_id_fkey (
              id,
              label
            ),
            suppliers!fk_supplier (
              id,
              supplier_name
            ),
            packing_group_id:master_data!sds_packing_group_id_fkey (
              id,
              label
            )
          )
        `);

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Raw products data:', data);

      // Transform the data to match the Product type
      const transformedData = data.map(item => ({
        id: item.id,
        name: item.product_name,
        code: item.product_code,
        brandName: item.brand_name,
        unit: item.unit,
        unitSize: item.unit_size,
        description: item.description,
        productSet: item.product_set,
        aerosol: item.aerosol,
        cryogenicFluid: item.cryogenic_fluid,
        otherNames: item.other_names,
        uses: item.uses,
        status: item.product_status_id === 12 ? "ACTIVE" : "INACTIVE" as "ACTIVE" | "INACTIVE",
        approvalStatusId: item.approval_status_id,
        productStatusId: item.product_status_id,
        sdsId: item.sds_id,
        sds: item.sds ? {
          id: item.sds.id,
          isDG: item.sds.is_dg,
          dgClass: item.sds.dg_class_id ? {
            id: item.sds.dg_class_id.id,
            label: item.sds.dg_class_id.label
          } : undefined,
          supplier: item.sds.suppliers ? {
            id: item.sds.suppliers.id,
            supplier_name: item.sds.suppliers.supplier_name
          } : undefined,
          packingGroup: item.sds.packing_group_id ? {
            id: item.sds.packing_group_id.id,
            label: item.sds.packing_group_id.label
          } : undefined
        } : undefined
      }));

      console.log('Transformed products data:', transformedData);
      return transformedData;
    }
  });

  useEffect(() => {
    if (error) {
      console.error('Query error:', error);
      toast({
        title: "Error loading products",
        description: "There was a problem loading the products list. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your product data is being exported to Excel..."
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Data",
      description: "Updating the products list..."
    });
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedProduct(null);
  };

  const handleFormSave = () => {
    refetch();
    toast({
      title: "Success",
      description: "Product saved successfully"
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Loading products...</div>
      </DashboardLayout>
    );
  }

  if (showForm) {
    return (
      <DashboardLayout>
        <ProductForm 
          onClose={handleFormClose}
          onSave={handleFormSave}
          initialData={selectedProduct}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button 
            onClick={() => {
              setSelectedProduct(null);
              setShowForm(true);
            }} 
            className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
          >
            <Plus className="mr-2 h-4 w-4" /> New Product
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <ProductSearch 
              value={filters.search}
              onChange={(value) => setFilters({ ...filters, search: value })}
            />
            <ProductActions 
              onToggleFilters={() => setShowFilters(!showFilters)}
              onExport={handleExport}
              onRefresh={handleRefresh}
            />
          </div>
          
          {showFilters && (
            <ProductFilters filters={filters} onFiltersChange={setFilters} />
          )}
          
          <ProductList 
            data={products} 
            filters={filters} 
            onEdit={handleEdit}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}