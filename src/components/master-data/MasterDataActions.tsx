import { Button } from "@/components/ui/button";
import {
  Filter,
  RefreshCcw,
  FileDown,
} from "lucide-react";

interface MasterDataActionsProps {
  onToggleFilters: () => void;
  onExport: () => void;
  onRefresh: () => void;
}

export function MasterDataActions({
  onToggleFilters,
  onExport,
  onRefresh,
}: MasterDataActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleFilters}
        className="hover:bg-dgxprt-hover"
      >
        <Filter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onExport}
        className="hover:bg-dgxprt-hover"
      >
        <FileDown className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        className="hover:bg-dgxprt-hover"
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}