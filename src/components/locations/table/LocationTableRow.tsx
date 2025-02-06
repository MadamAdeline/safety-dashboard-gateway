import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2 } from "lucide-react";
import type { Location } from "@/types/location";

interface LocationTableRowProps {
  location: Location;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
  getLocationTypeLabel: (location: Location) => string;
  getParentLocationName: (location: Location) => string;
}

export function LocationTableRow({
  location,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  getLocationTypeLabel,
  getParentLocationName,
}: LocationTableRowProps) {
  return (
    <TableRow className="hover:bg-[#F1F0FB] transition-colors">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(location.id)}
        />
      </TableCell>
      <TableCell className="font-medium text-dgxprt-navy">{location.name}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          {getLocationTypeLabel(location)}
        </Badge>
      </TableCell>
      <TableCell className="text-dgxprt-navy">{getParentLocationName(location)}</TableCell>
      <TableCell>
        <Badge
          variant={location.status_id === 1 ? "default" : "destructive"}
          className={
            location.status_id === 1
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }
        >
          {location.status_lookup?.status_name || (location.status_id === 1 ? "Active" : "Inactive")}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-dgxprt-hover text-dgxprt-navy"
            onClick={() => onEdit(location)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-dgxprt-hover text-dgxprt-navy"
            onClick={() => onDelete(location.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}