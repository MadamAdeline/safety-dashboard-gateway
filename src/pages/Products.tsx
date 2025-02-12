
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductReadOnlyForm } from "@/components/products/ProductReadOnlyForm";
import type { Product, ProductFilters as ProductFiltersType } from "@/types/product";
import { exportProductsToExcel } from "@/utils/exportUtils";
import { useLocation } from "react-router-dom";
import { useProducts } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";
import { ProductHeader } from "@/components/products/header/ProductHeader";
import { ProductSearchBar } from "@/components/products/header/ProductSearchBar";
import { ProductListContainer } from "@/components/products/list/ProductListContainer";

export default function Products() {
  const location = useLocation();
  const showFormFromState = location.state?.showForm ?? false;
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<ProductFiltersType>({
    search: "",
    supplier: [],
    status: [],
    dgClass: [],
    isDG: null
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(showFormFromState);
  const [showViewForm, setShowViewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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
      const filteredData = products?.filter((item) => {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const searchableFields = [
            item.name,
            item.code,
            item.brandName || '',
            item.unit || '',
            item.description || '',
            item.otherNames || '',
            item.uses || '',
            item.sds?.supplier?.supplier_name || '',
            item.sds?.dgClass?.label || '',
          ];

          const matchesSearch = searchableFields.some(
            field => field.toLowerCase().includes(searchTerm)
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

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowViewForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setShowViewForm(false);
    setSelectedProduct(null);
    window.history.replaceState({}, document.title);
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

  if (showViewForm && selectedProduct) {
    return (
      <DashboardLayout>
        <ProductReadOnlyForm 
          onClose={handleFormClose}
          data={selectedProduct}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-full">
        <ProductHeader 
          onNewProduct={() => {
            setSelectedProduct(null);
            setShowForm(true);
          }}
        />
        
        <div className="space-y-4">
          <ProductSearchBar 
            filters={filters}
            onFiltersChange={setFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onExport={handleExport}
            onRefresh={handleRefresh}
            isExporting={isExporting}
          />
          
          <ProductListContainer 
            data={products}
            filters={filters}
            showFilters={showFilters}
            onEdit={handleEdit}
            onView={handleView}
            onFiltersChange={setFilters}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
