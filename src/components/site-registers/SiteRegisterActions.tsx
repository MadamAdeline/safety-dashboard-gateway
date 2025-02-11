
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

interface SiteRegisterActionsProps {
  onExport: () => void;
  onRefresh: () => void;
}

export function SiteRegisterActions({ onExport, onRefresh }: SiteRegisterActionsProps) {
  return (
    <div className="flex items-center gap-2">
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
