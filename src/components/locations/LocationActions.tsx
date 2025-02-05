
import { Button } from "@/components/ui/button";
import { Filter, RotateCw, FileDown } from "lucide-react";

interface LocationActionsProps {
  onToggleFilters: () => void;
  onExport: () => void;
  onRefresh: () => void;
}

export function LocationActions({ onToggleFilters, onExport, onRefresh }: LocationActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleFilters}
        className="h-9 w-9"
      >
        <Filter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onExport}
        className="h-9 w-9"
      >
        <FileDown className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        className="h-9 w-9"
      >
        <RotateCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
