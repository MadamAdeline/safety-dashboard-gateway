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
import type { SDS, SDSFilters } from "@/types/sds";
import { useState } from "react";

interface SDSListProps {
  data: SDS[];
  filters: SDSFilters;
  onEdit: (sds: SDS) => void;
}

export function SDSList({ data, filters, onEdit }: SDSListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Apply filters to data
  const filteredData = data.filter((item) => {
    if (filters.search && !item.productName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    // Add more filter logic here
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
              <TableHead className="text-dgxprt-navy font-semibold">Product ID</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">DG</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Supplier</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Issue Date</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Expiry Date</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">DG Class</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Status</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Source</TableHead>
              <TableHead className="w-24 text-dgxprt-navy font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow 
                key={item.productId}
                className="hover:bg-[#F1F0FB] transition-colors"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.productId)}
                    onCheckedChange={() => toggleSelectItem(item.productId)}
                  />
                </TableCell>
                <TableCell className="font-medium text-dgxprt-navy">{item.productName}</TableCell>
                <TableCell className="text-dgxprt-navy">{item.productId}</TableCell>
                <TableCell>
                  <Badge 
                    variant={item.isDG ? "default" : "secondary"}
                    className={item.isDG ? "bg-dgxprt-purple text-white" : "bg-gray-100 text-gray-600"}
                  >
                    {item.isDG ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-dgxprt-navy">{item.supplier}</TableCell>
                <TableCell className="text-dgxprt-navy">{item.issueDate}</TableCell>
                <TableCell className="text-dgxprt-navy">{item.expiryDate}</TableCell>
                <TableCell className="text-dgxprt-navy">{item.dgClass}</TableCell>
                <TableCell>
                  <Badge 
                    variant={item.status === "ACTIVE" ? "default" : "destructive"}
                    className={
                      item.status === "ACTIVE" 
                        ? "bg-green-100 text-green-800" 
                        : item.status === "REQUESTED"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className={
                      item.sdsSource === "Global Library" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {item.sdsSource}
                  </Badge>
                </TableCell>
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
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
          {filteredData.length} results
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
                className={`${
                  currentPage === 1 
                    ? "pointer-events-none opacity-50" 
                    : "hover:bg-dgxprt-hover"
                }`}
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
                className={`${
                  currentPage === totalPages 
                    ? "pointer-events-none opacity-50" 
                    : "hover:bg-dgxprt-hover"
                }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}