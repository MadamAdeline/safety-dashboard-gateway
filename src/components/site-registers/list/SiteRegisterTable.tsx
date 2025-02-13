
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

interface SiteRegisterTableProps {
  registers: any[];
  onEdit: (register: any) => void;
  onDelete: (id: string) => void;
}

export function SiteRegisterTable({ registers, onEdit, onDelete }: SiteRegisterTableProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Override Product Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead># of Units</TableHead>
            <TableHead>Total Quantity</TableHead>
            <TableHead>Unit of Measure</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registers.map((register) => (
            <TableRow key={register.id}>
              <TableCell>{register.products?.product_name}</TableCell>
              <TableCell>{register.override_product_name || '-'}</TableCell>
              <TableCell>{register.locations?.full_path}</TableCell>
              <TableCell>{register.current_stock_level?.toLocaleString() || '-'}</TableCell>
              <TableCell>{register.total_qty?.toLocaleString() || '-'}</TableCell>
              <TableCell>{register.products?.uom?.label}</TableCell>
              <TableCell>
                <Badge 
                  variant={register.status?.status_name === 'ACTIVE' ? "default" : "destructive"}
                  className={
                    register.status?.status_name === 'ACTIVE'
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }
                >
                  {register.status?.status_name || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(register)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(register.id)}
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
  );
}
