
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductTableHeaderProps {
  onSelectAll: () => void;
  isAllSelected: boolean;
  hasItems: boolean;
}

export function ProductTableHeader({ onSelectAll, isAllSelected, hasItems }: ProductTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-[#F1F0FB] border-b border-gray-200">
        <TableHead className="w-12">
          <Checkbox
            checked={hasItems && isAllSelected}
            onCheckedChange={onSelectAll}
          />
        </TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Product Name</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Product Code</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Brand Name</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Unit Size</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Unit of Measure</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Supplier</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold w-full">Status</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">DG</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">DG Class</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Packing Group</TableHead>
        <TableHead className="w-24 text-dgxprt-navy font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
