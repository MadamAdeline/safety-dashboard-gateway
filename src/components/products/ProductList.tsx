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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ProductListProps {
  data: Product[];
  filters: ProductFilters;
  onEdit: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductList({ data, filters, onEdit }: ProductListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products from Supabase...');
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            uom:master_data!products_uom_id_fkey (
              id,
              label
            ),
            sds:products_sds_id_fkey (
              id,
              is_dg,
              dg_class:master_data!sds_dg_class_id_fkey (
                id,
                label
              ),
              supplier:suppliers!sds_supplier_id_fkey (
                id,
                supplier_name
              ),
              packing_group:master_data!sds_packing_group_id_fkey (
                id,
                label
              )
            )
          `);
        
        if (productsError) {
          console.error('Error fetching product details:', productsError);
          throw productsError;
        }

        console.log('Fetched products:', productsData);
        
        return productsData.map(item => ({
          id: item.id,
          name: item.product_name,
          code: item.product_code,
          brandName: item.brand_name,
          unit: item.unit,
          uomId: item.uom_id,
          uom: item.uom ? {
            id: item.uom.id,
            label: item.uom.label
          } : undefined,
          unitSize: item.unit_size,
          description: item.description,
          productSet: item.product_set,
          aerosol: item.aerosol,
          cryogenicFluid: item.cryogenic_fluid,
          otherNames: item.other_names,
          uses: item.uses,
          status: (item.product_status_id === 16 ? "ACTIVE" : "INACTIVE") as "ACTIVE" | "INACTIVE",
          approvalStatusId: item.approval_status_id,
          productStatusId: item.product_status_id,
          sdsId: item.sds_id,
          sds: item.sds ? {
            id: item.sds.id,
            isDG: item.sds.is_dg,
            dgClass: item.sds.dg_class ? {
              id: item.sds.dg_class.id,
              label: item.sds.dg_class.label
            } : undefined,
            supplier: item.sds.supplier ? {
              id: item.sds.supplier.id,
              supplier_name: item.sds.supplier_name
            } : undefined,
            packingGroup: item.sds.packing_group ? {
              id: item.sds.packing_group.id,
              label: item.sds.packing_group.label
            } : undefined
          } : undefined
        })) as Product[];
      } catch (err) {
        console.error('Failed to fetch products:', err);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
        throw err;
      }
    }
  });

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
        item.unit,
        item.description,
        item.otherNames,
        item.uses,
        item.sds?.supplier?.supplier_name,
        item.sds?.dgClass?.label,
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
              <TableHead className="text-dgxprt-navy font-semibold">Unit of Measure</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">DG</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">DG Class</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Supplier</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Packing Group</TableHead>
              <TableHead className="text-dgxprt-navy font-semibold">Status</TableHead>
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
                <TableCell>{item.uom?.label || "-"}</TableCell>
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
                  <Badge 
                    variant={item.status === "ACTIVE" ? "default" : "destructive"}
                    className={
                      item.status === "ACTIVE" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {item.status}
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
                      className="hover:bg-red-100 text-red-600"
                      onClick={() => handleDelete(item)}
                      disabled={isDeleting}
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
