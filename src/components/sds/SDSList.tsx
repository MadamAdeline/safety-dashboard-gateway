import {
  Table,
  TableBody,
} from "@/components/ui/table";
import type { SDS, SDSFilters } from "@/types/sds";
import { useState } from "react";
import { SDSTableHeader } from "./table/SDSTableHeader";
import { SDSTableRow } from "./table/SDSTableRow";
import { SDSPagination } from "./table/SDSPagination";
import * as XLSX from 'xlsx';
import { useQueryClient } from "@tanstack/react-query";

interface SDSListProps {
  data: SDS[];
  filters: SDSFilters;
  onEdit: (sds: SDS) => void;
}

export function SDSList({ data, filters, onEdit }: SDSListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  const filteredData = data.filter((item) => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        item.productName.toLowerCase().includes(searchTerm) ||
        item.productId.toLowerCase().includes(searchTerm) ||
        item.supplier.toLowerCase().includes(searchTerm) ||
        item.status.toLowerCase().includes(searchTerm)
      );
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
      setSelectedItems(paginatedData.map((item) => item.productId));
    }
  };

  const toggleSelectItem = (productId: string) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDelete = () => {
    queryClient.invalidateQueries({ queryKey: ['sds'] });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <SDSTableHeader
            onSelectAll={toggleSelectAll}
            isAllSelected={paginatedData.length > 0 && selectedItems.length === paginatedData.length}
            hasData={paginatedData.length > 0}
          />
          <TableBody>
            {paginatedData.map((item) => (
              <SDSTableRow
                key={item.productId}
                item={item}
                isSelected={selectedItems.includes(item.productId)}
                onToggleSelect={toggleSelectItem}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <SDSPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={startIndex + itemsPerPage}
        totalItems={filteredData.length}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}