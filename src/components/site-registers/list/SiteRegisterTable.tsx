
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

interface SiteRegisterTableProps {
  registers: any[];
  onEdit: (register: any) => void;
  onDelete: (id: string) => void;
}

export function SiteRegisterTable({ registers, onEdit, onDelete }: SiteRegisterTableProps) {
  const { data: userData } = useUserRole();
  const isAdmin = userData?.role?.toLowerCase() === 'administrator';
  const isPowerUser = userData?.role?.toLowerCase() === 'poweruser';
  const hasEditPermissions = isAdmin || isPowerUser;

  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F1F0FB] border-b border-gray-200">
            <TableHead className="text-dgxprt-navy font-semibold">Product Name</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold">Override Product Name</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold">Location</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold text-right"># of Units</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold text-right">Unit Size</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold text-right">Total Quantity</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold">Unit of Measure</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold">DG Class</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold">Status</TableHead>
            <TableHead className="text-dgxprt-navy font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registers.map((register) => (
            <TableRow key={register.id}>
              <TableCell>{register.products?.product_name}</TableCell>
              <TableCell>{register.override_product_name || '-'}</TableCell>
              <TableCell>{register.locations?.full_path}</TableCell>
              <TableCell className="text-right">{register.current_stock_level?.toLocaleString() || '-'}</TableCell>
              <TableCell className="text-right">{register.products?.unit_size?.toLocaleString() || '-'}</TableCell>
              <TableCell className="text-right">{register.total_qty?.toLocaleString() || '-'}</TableCell>
              <TableCell>{register.products?.uom?.label}</TableCell>
              <TableCell>{register.products?.sds?.dg_class?.label || '-'}</TableCell>
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
                {hasEditPermissions && (
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
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
