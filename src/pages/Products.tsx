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
import { exportProductsToExcel } from "@/utils/exportUtils";
import { useLocation } from "react-router-dom";

export default function Products() {
  const location = useLocation();
  const showFormFromState = location.state?.showForm ?? false;
  
  const [filters, setFilters] = useState<ProductFiltersType>({
    search: "",
    supplier: [],
    status: [],
    dgClass: [],
    isDG: null
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(showFormFromState);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isExporting, setIsExporting] = useState(false);
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
            suppliers!sds_supplier_id_fkey (
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

      return data.map(item => ({
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
        status: (item.product_status_id === 12 ? "ACTIVE" : "INACTIVE") as "ACTIVE" | "INACTIVE",
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
      })) as Product[];
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

  const handleExport = async () => {
    console.log('Starting export process');
    setIsExporting(true);
    try {
      // Get the filtered data from the ProductList component
      const filteredData = products?.filter((item) => {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const searchableFields = [
            item.name,
            item.code,
            item.brandName,
            item.unit,
            item.description,
            item.otherNames,
            item.uses,
            item.sds?.supplier?.supplier_name,
            item.sds?.dgClass?.label,
          ].filter(Boolean);

          const matchesSearch = searchableFields.some(
            field => field?.toLowerCase().includes(searchTerm)
          );

          if (!matchesSearch) return false;
        }

        if (filters.supplier.length > 0 && item.sds?.supplier?.supplier_name && !filters.supplier.includes(item.sds.supplier.supplier_name)) {
          return false;
        }
        if (filters.status.length > 0 && !filters.status.includes(item.status)) {
          return false;
        }
        if (filters.isDG !== null && item.sds?.isDG !== filters.isDG) {
          return false;
        }
        if (filters.dgClass.length > 0 && item.sds?.dgClass?.label && !filters.dgClass.includes(item.sds.dgClass.label)) {
          return false;
        }
        return true;
      }) || [];

      await exportProductsToExcel(filteredData);
      
      toast({
        title: "Export Successful",
        description: `Successfully exported ${filteredData.length} products to Excel`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the products",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
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
    // Clear the state from the URL
    window.history.replaceState({}, document.title);
  };

  const handleFormSave = () => {
    refetch();
    handleFormClose();
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
              isExporting={isExporting}
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
