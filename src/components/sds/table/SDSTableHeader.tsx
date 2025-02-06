import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface SDSTableHeaderProps {
  onSelectAll: () => void;
  isAllSelected: boolean;
  hasData: boolean;
}

export function SDSTableHeader({ onSelectAll, isAllSelected, hasData }: SDSTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-[#F1F0FB] border-b border-gray-200">
        <TableHead className="w-12">
          <Checkbox
            checked={hasData && isAllSelected}
            onCheckedChange={onSelectAll}
          />
        </TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">SDS Product Name</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">SDS Product Code</TableHead>
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
  );
}