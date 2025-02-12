
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProductList } from "@/components/products/ProductList";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductActions } from "@/components/products/ProductActions";
import { ProductForm } from "@/components/products/ProductForm";
import type { Product, ProductFilters as ProductFiltersType } from "@/types/product";
import { exportProductsToExcel } from "@/utils/exportUtils";
import { useLocation } from "react-router-dom";
import { ProductListSearch } from "@/components/products/list/ProductListSearch";
import { useProducts } from "@/hooks/use-products";

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

  const { data: products = [], isLoading, error, refetch } = useProducts();

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
    // Refresh the products list
    refetch();
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
            <ProductListSearch 
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
