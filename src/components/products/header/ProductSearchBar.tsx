
import { ProductListSearch } from "@/components/products/list/ProductListSearch";
import { ProductActions } from "@/components/products/ProductActions";
import type { ProductFilters } from "@/types/product";

interface ProductSearchBarProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onToggleFilters: () => void;
  onExport: () => void;
  onRefresh: () => void;
  isExporting: boolean;
}

export function ProductSearchBar({
  filters,
  onFiltersChange,
  onToggleFilters,
  onExport,
  onRefresh,
  isExporting
}: ProductSearchBarProps) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
      <ProductListSearch 
        value={filters.search}
        onChange={(value) => onFiltersChange({ ...filters, search: value })}
      />
      <ProductActions 
        onToggleFilters={onToggleFilters}
        onExport={onExport}
        onRefresh={onRefresh}
        isExporting={isExporting}
      />
    </div>
  );
}
