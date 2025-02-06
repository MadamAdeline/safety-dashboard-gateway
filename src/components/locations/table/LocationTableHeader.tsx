import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface LocationTableHeaderProps {
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  hasData: boolean;
}

export function LocationTableHeader({ onToggleSelectAll, isAllSelected, hasData }: LocationTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-[#F1F0FB] border-b border-gray-200">
        <TableHead className="w-12">
          <Checkbox
            checked={hasData && isAllSelected}
            onCheckedChange={onToggleSelectAll}
          />
        </TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Location Name</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Type</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Parent Location</TableHead>
        <TableHead className="text-dgxprt-navy font-semibold">Status</TableHead>
        <TableHead className="w-24 text-dgxprt-navy font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}