import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import type { Product, ProductFilters } from "@/types/product";
import { useState } from "react";

interface ProductListProps {
  data: Product[];
  filters: ProductFilters;
  onEdit: (product: Product) => void;
}

export function ProductList({ data, filters, onEdit }: ProductListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = data.filter((item) => {
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
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

  // Sort by product name in ascending order
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
          <TableHeader>
            <TableRow className="bg-[#F1F0FB] border-b border-gray-200">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginatedData.length > 0 &&
                    selectedItems.length === paginatedData.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Product Name</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Product Code</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Brand Name</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Unit Size</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Unit</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">DG</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">DG Class</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Supplier</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Packing Group</TableHead>
              <TableHead className="w-24 text-dgxprt-navy font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow 
                key={item.id}
                className="hover:bg-[#F1F0FB] transition-colors"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleSelectItem(item.id)}
                  />
                </TableCell>
                <TableCell className="font-medium text-dgxprt-navy">{item.name}</TableCell>
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.brandName || "-"}</TableCell>
                <TableCell>{item.unitSize || "-"}</TableCell>
                <TableCell>{item.unit || "-"}</TableCell>
                <TableCell>
                  <Badge 
                    variant={item.sds?.isDG ? "default" : "secondary"}
                    className={item.sds?.isDG ? "bg-dgxprt-purple text-white" : "bg-gray-100 text-gray-600"}
                  >
                    {item.sds?.isDG ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>{item.sds?.dgClass?.label || "-"}</TableCell>
                <TableCell>{item.sds?.supplier?.supplier_name || "-"}</TableCell>
                <TableCell>{item.sds?.packingGroup?.label || "-"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-dgxprt-hover text-dgxprt-navy"
                      onClick={() => onEdit(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-dgxprt-hover text-dgxprt-navy"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of{" "}
          {sortedData.length} results
        </p>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                  isActive={currentPage === page}
                  className={
                    currentPage === page 
                      ? "bg-dgxprt-selected text-white hover:bg-dgxprt-selected/90" 
                      : "hover:bg-dgxprt-hover"
                  }
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                }}
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}