
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface SupplierTableHeaderProps {
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  hasData: boolean;
}

export function SupplierTableHeader({ 
  onToggleSelectAll, 
  isAllSelected,
  hasData 
}: SupplierTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-[#F1F0FB] border-b border-gray-200">
        <TableHead className="w-12">
          <Checkbox
            checked={hasData && isAllSelected}
            onCheckedChange={onToggleSelectAll}
          />
        </TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Supplier Name</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Contact Person</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Email Address</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Phone Number</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Address</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Status</TableHead>
        <TableHead className="w-24 text-dgxprt-navy font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
