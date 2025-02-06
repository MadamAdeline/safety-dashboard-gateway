
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import type { SDS } from "@/types/sds";
import { useSDSSelection } from "./SDSSelectionContext";
import { useSDSDelete } from "@/hooks/use-sds-delete";

interface SDSTableRowProps {
  item: SDS;
  onEdit: (sds: SDS) => void;
  onDelete?: (sds: SDS) => void;
}

export function SDSTableRow({ item, onEdit, onDelete }: SDSTableRowProps) {
  const { selectedItems, toggleSelectItem } = useSDSSelection();
  const { handleDelete } = useSDSDelete(onDelete);

  return (
    <TableRow className="hover:bg-[#F1F0FB] transition-colors">
      <TableCell>
        <Checkbox
          checked={selectedItems.includes(item.id)}
          onCheckedChange={() => toggleSelectItem(item.id)}
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
      <TableCell className="text-dgxprt-navy">{item.dgClass?.label || '-'}</TableCell>
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
            className="hover:bg-red-100 text-red-600"
            onClick={() => handleDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
