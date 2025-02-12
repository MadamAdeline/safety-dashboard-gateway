
import { ProductList } from "@/components/products/ProductList";
import { ProductFilters } from "@/components/products/ProductFilters";
import type { Product, ProductFilters as ProductFiltersType } from "@/types/product";

interface ProductListContainerProps {
  data: Product[];
  filters: ProductFiltersType;
  showFilters: boolean;
  onEdit: (product: Product) => void;
  onFiltersChange: (filters: ProductFiltersType) => void;
}

export function ProductListContainer({
  data,
  filters,
  showFilters,
  onEdit,
  onFiltersChange
}: ProductListContainerProps) {
  return (
    <div className="space-y-4">
      {showFilters && (
        <ProductFilters filters={filters} onFiltersChange={onFiltersChange} />
      )}
      <ProductList 
        data={data} 
        filters={filters} 
        onEdit={onEdit}
      />
    </div>
  );
}
