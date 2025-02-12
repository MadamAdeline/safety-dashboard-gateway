import { Button } from "@/components/ui/button";
import { Filter, Download, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';
import { supabase } from "@/integrations/supabase/client";
import type { Supplier } from "@/types/supplier";
import * as XLSX from 'xlsx';

interface SupplierActionsProps {
  onToggleFilters: () => void;
  onExport: () => void;
  onRefresh: () => void;
  filteredData?: Supplier[];
}

export function SupplierActions({ onToggleFilters, onExport, onRefresh, filteredData }: SupplierActionsProps) {
  const { toast } = useToast();

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Parse CSV
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        console.log('Parsed CSV:', results.data);
        
        try {
          // Get status mappings
          const { data: statusLookup } = await supabase
            .from('status_lookup')
            .select('id, status_name')
            .eq('category', 'SUPPLIER');

          // Process each row
          for (const row of results.data as any[]) {
            if (!row.supplier_name) continue;

            // Find status ID
            const statusId = statusLookup?.find(
              s => s.status_name?.toLowerCase() === (row.status?.toLowerCase() || 'active')
            )?.id || 1; // Default to 1 (ACTIVE) if not found

            const supplierData = {
              supplier_name: row.supplier_name,
              contact_person: row.contact_person || '',
              email: row.email || '',
              phone_number: row.phone_number || '',
              address: row.address || '',
              status_id: statusId
            };

            // Check if supplier exists
            const { data: existingSupplier } = await supabase
              .from('suppliers')
              .select('id')
              .eq('supplier_name', row.supplier_name)
              .maybeSingle();

            if (existingSupplier) {
              // Update existing supplier
              await supabase
                .from('suppliers')
                .update(supplierData)
                .eq('id', existingSupplier.id);
            } else {
              // Insert new supplier
              await supabase
                .from('suppliers')
                .insert([supplierData]);
            }
          }

          toast({
            title: "Import Successful",
            description: "Suppliers have been imported/updated successfully"
          });
          onRefresh(); // Refresh the list
        } catch (error) {
          console.error('Import error:', error);
          toast({
            title: "Import Failed",
            description: "There was an error importing the suppliers",
            variant: "destructive"
          });
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast({
          title: "Import Failed",
          description: "Failed to parse the CSV file",
          variant: "destructive"
        });
      }
    });

    // Reset file input
    event.target.value = '';
  };

  const handleExport = () => {
    if (!filteredData || filteredData.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no suppliers matching your current filters",
        variant: "destructive"
      });
      return;
    }

    // Transform the data for export
    const exportData = filteredData.map(supplier => ({
      'Supplier Name': supplier.name,
      'Contact Person': supplier.contactPerson,
      'Email': supplier.email,
      'Phone Number': supplier.phone || '-',
      'Address': supplier.address || '-',
      'Status': supplier.status
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers");

    // Generate and download file
    XLSX.writeFile(wb, `suppliers_export_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Export Successful",
      description: "Your suppliers data has been exported to Excel"
    });
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
      <div className="relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Import CSV"
        />
        <Button
          variant="outline"
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
      </div>
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
