import { Button } from "@/components/ui/button";
import { Filter, Download, RefreshCw } from "lucide-react";

interface ProductActionsProps {
  onToggleFilters: () => void;
  onExport: () => void;
  onRefresh: () => void;
  isExporting?: boolean;
}

export function ProductActions({ onToggleFilters, onExport, onRefresh, isExporting = false }: ProductActionsProps) {
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
        disabled={isExporting}
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Export"}
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