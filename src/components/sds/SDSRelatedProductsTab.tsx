
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useProducts } from "@/hooks/use-products";
import type { SDS } from "@/types/sds";

interface SDSRelatedProductsTabProps {
  sds: SDS;
}

export function SDSRelatedProductsTab({ sds }: SDSRelatedProductsTabProps) {
  const { data: products = [], isLoading } = useProducts();
  
  // Filter products related to this SDS
  const relatedProducts = products.filter(product => product.sdsId === sds.id);

  if (isLoading) {
    return <div>Loading related products...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Product Code</TableHead>
            <TableHead>Brand Name</TableHead>
            <TableHead>Unit Size</TableHead>
            <TableHead>UOM</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {relatedProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.code}</TableCell>
              <TableCell>{product.brandName}</TableCell>
              <TableCell>{product.unitSize}</TableCell>
              <TableCell>{product.uom?.label}</TableCell>
            </TableRow>
          ))}
          {relatedProducts.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No related products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
