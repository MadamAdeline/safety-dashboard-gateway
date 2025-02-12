
import { Table, TableBody } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import type { Product, ProductFilters } from "@/types/product";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductTableHeader } from "./table/ProductTableHeader";
import { ProductTableRow } from "./table/ProductTableRow";
import { ProductPagination } from "./table/ProductPagination";
import { useProducts } from "@/hooks/use-products";

interface ProductListProps {
  data: Product[];
  filters: ProductFilters;
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductList({ data, filters, onEdit, onView }: ProductListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  const { data: products, isLoading, error } = useProducts();

  const handleDelete = async (product: Product) => {
    if (!product.id) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      setSelectedItems(prev => prev.filter(id => id !== product.id));
      window.location.reload();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = data.filter((item) => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        item.name,
        item.code,
        item.brandName,
        item.sds?.supplier?.supplier_name,
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
  });

  const sortedData = [...filteredData].sort((a, b) => a.name.localeCompare(b.name));

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <ProductTableHeader
            onSelectAll={toggleSelectAll}
            isAllSelected={paginatedData.length > 0 && selectedItems.length === paginatedData.length}
            hasItems={paginatedData.length > 0}
          />
          <TableBody>
            {paginatedData.map((item) => (
              <ProductTableRow
                key={item.id}
                product={item}
                isSelected={selectedItems.includes(item.id)}
                onSelect={toggleSelectItem}
                onEdit={onEdit}
                onView={onView}
                onDelete={handleDelete}
                isDeleting={isDeleting}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={sortedData.length}
        startIndex={startIndex}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
