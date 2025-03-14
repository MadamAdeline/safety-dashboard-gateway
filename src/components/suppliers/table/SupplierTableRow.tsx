
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2 } from "lucide-react";
import type { Supplier } from "@/types/supplier";
import { useUserRole } from "@/hooks/use-user-role";

interface SupplierTableRowProps {
  supplier: Supplier;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierTableRow({
  supplier,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: SupplierTableRowProps) {
  const { data: userData } = useUserRole();
  const isAdmin = userData?.role?.toLowerCase() === 'administrator';
  const isPowerUser = userData?.role?.toLowerCase() === 'poweruser';
  const hasEditPermissions = isAdmin || isPowerUser;

  return (
    <TableRow className="hover:bg-[#F1F0FB] transition-colors">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(supplier.id)}
        />
      </TableCell>
      <TableCell className="font-medium text-dgxprt-navy">{supplier.supplier_name}</TableCell>
      <TableCell>{supplier.contact_person}</TableCell>
      <TableCell>{supplier.email}</TableCell>
      <TableCell>{supplier.phone_number}</TableCell>
      <TableCell>{supplier.address}</TableCell>
      <TableCell>
        <Badge 
          variant={supplier.status === "ACTIVE" ? "default" : "destructive"}
          className={
            supplier.status === "ACTIVE" 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }
        >
          {supplier.status}
        </Badge>
      </TableCell>
      <TableCell>
        {hasEditPermissions && (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-dgxprt-hover text-dgxprt-navy"
              onClick={() => onEdit(supplier)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-dgxprt-hover text-dgxprt-navy"
              onClick={() => onDelete(supplier)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
