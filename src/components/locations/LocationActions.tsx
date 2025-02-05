
import { Button } from "@/components/ui/button";
import { Filter, Download, RefreshCw } from "lucide-react";

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
        onClick={onToggleFilters}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        Filters
      </Button>
      <Button
        variant="outline"
        onClick={onExport}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
      <Button
        variant="outline"
        onClick={onRefresh}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
}
