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

const sampleData: Product[] = [
  {
    id: "1",
    name: "Acetone",
    code: "ACE20L",
    status: "ACTIVE",
    sds: {
      id: "sds1",
      isDG: true,
      dgClass: {
        id: "class3",
        label: "Class 3"
      },
      supplier: {
        id: "sup1",
        supplier_name: "AUSTRALIAN CHEMICAL REAGENTS"
      },
      packingGroup: {
        id: "pg2",
        label: "II"
      }
    }
  },
  {
    id: "2",
    name: "Methanol",
    code: "MET10L",
    status: "ACTIVE",
    sds: {
      id: "sds2",
      isDG: true,
      dgClass: {
        id: "class3",
        label: "Class 3"
      },
      supplier: {
        id: "sup2",
        supplier_name: "SIGMA ALDRICH"
      },
      packingGroup: {
        id: "pg2",
        label: "II"
      }
    }
  }
];

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
              data={sampleData} 
              filters={filters} 
              onEdit={handleEdit}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}