
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import type { SDS, SDSFilters } from "@/types/sds";
import { useState } from "react";
import { SDSTableHeader } from "./table/SDSTableHeader";
import { SDSTableRow } from "./table/SDSTableRow";
import { SDSPagination } from "./table/SDSPagination";
import { SDSSelectionProvider } from "./table/SDSSelectionContext";
import { useQueryClient } from "@tanstack/react-query";

interface SDSListProps {
  data: SDS[];
  filters: SDSFilters;
  onView: (sds: SDS) => void;
  onEdit: (sds: SDS) => void;
  allowDelete?: boolean;
  showViewButton: boolean;
  showEditButton: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function SDSList({ 
  data, 
  filters, 
  onView, 
  onEdit, 
  allowDelete = false,
  showViewButton,
  showEditButton,
  currentPage,
  onPageChange
}: SDSListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  // First sort the data by product name
  const sortedData = [...data].sort((a, b) => 
    a.productName.toLowerCase().localeCompare(b.productName.toLowerCase())
  );

  // Then apply filters to the sorted data
  const filteredData = sortedData.filter((item) => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        item.productName.toLowerCase().includes(searchTerm) ||
        item.productId.toLowerCase().includes(searchTerm) ||
        item.supplier.toLowerCase().includes(searchTerm) ||
        item.status.toLowerCase().includes(searchTerm) ||
        (item.source?.toLowerCase().includes(searchTerm) || false)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = () => {
    queryClient.invalidateQueries({ queryKey: ['sds'] });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SDSSelectionProvider
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
        >
          <Table>
            <SDSTableHeader
              paginatedData={paginatedData}
              hasData={paginatedData.length > 0}
            />
            <TableBody>
              {paginatedData.map((item) => (
                <SDSTableRow
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onView={onView}
                  onDelete={handleDelete}
                  allowDelete={allowDelete}
                  showViewButton={showViewButton}
                  showEditButton={showEditButton}
                />
              ))}
            </TableBody>
          </Table>
        </SDSSelectionProvider>
      </div>

      <SDSPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={startIndex + itemsPerPage}
        totalItems={filteredData.length}
        onPageChange={onPageChange}
      />
    </div>
  );
}
