
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import type { Supplier, SupplierFilters } from "@/types/supplier";
import { useState } from "react";
import { useSupplierDelete } from "@/hooks/use-supplier-delete";
import { SupplierTableHeader } from "./table/SupplierTableHeader";
import { SupplierTableRow } from "./table/SupplierTableRow";
import { SupplierPagination } from "./table/SupplierPagination";

interface SupplierListProps {
  data: Supplier[];
  filters: SupplierFilters;
  onEdit: (supplier: Supplier) => void;
  isLoading?: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function SupplierList({ 
  data, 
  filters, 
  onEdit, 
  isLoading,
  currentPage,
  onPageChange
}: SupplierListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const itemsPerPage = 10;
  const { handleDelete } = useSupplierDelete();

  const filteredData = data.filter((item) => {
    if (filters.search && !item.supplier_name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(item.status)) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading suppliers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <SupplierTableHeader
            onToggleSelectAll={toggleSelectAll}
            isAllSelected={paginatedData.length > 0 && selectedItems.length === paginatedData.length}
            hasData={paginatedData.length > 0}
          />
          <TableBody>
            {paginatedData.map((item) => (
              <SupplierTableRow
                key={item.id}
                supplier={item}
                isSelected={selectedItems.includes(item.id)}
                onToggleSelect={toggleSelectItem}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <SupplierPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData.length}
        startIndex={startIndex}
        onPageChange={onPageChange}
      />
    </div>
  );
}
