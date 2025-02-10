
import { Button } from "@/components/ui/button";
import { Plus, Download, RefreshCw } from "lucide-react";

interface UserActionsProps {
  onNewUser: () => void;
  onExport: () => void;
  onRefresh: () => void;
  isExporting?: boolean;
}

export function UserActions({ onNewUser, onExport, onRefresh, isExporting = false }: UserActionsProps) {
  return (
    <div className="flex items-center gap-2">
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
