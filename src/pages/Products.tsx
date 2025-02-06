import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProductList } from "@/components/products/ProductList";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ProductSearch } from "@/components/products/ProductSearch";
import { ProductActions } from "@/components/products/ProductActions";
import { ProductForm } from "@/components/products/ProductForm";
import type { Product, ProductFilters as ProductFiltersType } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products from Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name:product_name,
          code:product_code,
          brandName:brand_name,
          unit,
          unitSize:unit_size,
          description,
          productSet:product_set,
          aerosol,
          cryogenicFluid:cryogenic_fluid,
          otherNames:other_names,
          uses,
          status:product_status_id,
          approvalStatusId:approval_status_id,
          sds:sds_id (
            id,
            isDG:is_dg,
            dgClass:dg_class_id (
              id,
              label
            ),
            supplier:supplier_id (
              id,
              supplier_name
            ),
            packingGroup:packing_group_id (
              id,
              label
            )
          )
        `)
        .order('product_name');

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Products fetched:', data);
      return data as Product[];
    }
  });

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your product data is being exported to Excel..."
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing Data",
      description: "Updating the products list..."
    });
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Loading products...</div>
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
        
        {showForm ? (
          <ProductForm 
            onClose={() => {
              setShowForm(false);
              setSelectedProduct(null);
            }}
            initialData={selectedProduct}
          />
        ) : (
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
        )}
      </div>
    </DashboardLayout>
  );
}