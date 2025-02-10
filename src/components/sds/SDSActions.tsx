
import { Button } from "@/components/ui/button";
import { Filter, Download, RefreshCw } from "lucide-react";
import * as XLSX from 'xlsx';
import type { SDS } from "@/types/sds";

interface SDSActionsProps {
  onToggleFilters: () => void;
  onExport: () => void;
  onRefresh: () => void;
  data: SDS[];
  allowDelete?: boolean;
}

export function SDSActions({ onToggleFilters, onExport, onRefresh, data, allowDelete = true }: SDSActionsProps) {
  const handleExport = () => {
    const exportData = data.map(item => ({
      'Product Name': item.productName,
      'Product ID': item.productId,
      'Supplier': item.supplier,
      'Is DG': item.isDG ? 'Yes' : 'No',
      'Issue Date': item.issueDate,
      'Expiry Date': item.expiryDate,
      'Status': item.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SDS List");
    XLSX.writeFile(wb, "sds_list.xlsx");
  };

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
        onClick={handleExport}
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
