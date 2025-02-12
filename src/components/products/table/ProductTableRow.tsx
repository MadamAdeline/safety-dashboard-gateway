
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2, Eye } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductTableRowProps {
  product: Product;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void;
  isDeleting: boolean;
}

export function ProductTableRow({
  product,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
  isDeleting
}: ProductTableRowProps) {
  return (
    <TableRow className="hover:bg-[#F1F0FB] transition-colors">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(product.id)}
        />
      </TableCell>
      <TableCell className="font-medium text-dgxprt-navy">{product.name}</TableCell>
      <TableCell>{product.code}</TableCell>
      <TableCell>{product.brandName || "-"}</TableCell>
      <TableCell>{product.unitSize || "-"}</TableCell>
      <TableCell>{product.uom?.label || "-"}</TableCell>
      <TableCell>
        <Badge 
          variant={product.sds?.isDG ? "default" : "secondary"}
          className={product.sds?.isDG ? "bg-dgxprt-purple text-white" : "bg-gray-100 text-gray-600"}
        >
          {product.sds?.isDG ? "Yes" : "No"}
        </Badge>
      </TableCell>
      <TableCell>{product.sds?.dgClass?.label || "-"}</TableCell>
      <TableCell>{product.sds?.supplier?.supplier_name || "-"}</TableCell>
      <TableCell>{product.sds?.packingGroup?.label || "-"}</TableCell>
      <TableCell>
        <Badge 
          variant={product.status === "ACTIVE" ? "default" : "destructive"}
          className={
            product.status === "ACTIVE" 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }
        >
          {product.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-dgxprt-hover text-dgxprt-navy"
            onClick={() => onView(product)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-dgxprt-hover text-dgxprt-navy"
            onClick={() => onEdit(product)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-red-100 text-red-600"
            onClick={() => onDelete(product)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
