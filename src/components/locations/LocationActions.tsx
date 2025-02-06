import { Button } from "@/components/ui/button";
import { Filter, Download, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';
import type { Location, LocationType } from "@/types/location";
import * as XLSX from 'xlsx';

interface LocationActionsProps {
  onToggleFilters: () => void;
  onExport: () => void;
  onRefresh: () => void;
  filteredData?: Location[];
}

export function LocationActions({ onToggleFilters, onExport, onRefresh, filteredData }: LocationActionsProps) {
  const { toast } = useToast();

  const handleExport = () => {
    if (!filteredData || filteredData.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no locations matching your current filters",
        variant: "destructive"
      });
      return;
    }

    // Transform the data for export
    const exportData = filteredData.map(location => ({
      'Location Name': location.name,
      'Type': location.master_data?.label || 'Unknown',
      'Parent Location': location.parent_location_id || '-',
      'Status': location.status_lookup?.status_name || (location.status_id === 1 ? 'Active' : 'Inactive'),
      'Coordinates': location.coordinates ? JSON.stringify(location.coordinates) : '-'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Locations");

    // Generate and download file
    XLSX.writeFile(wb, `locations_export_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Export Successful",
      description: "Your locations data has been exported to Excel"
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Parse CSV
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        console.log('Parsed CSV:', results.data);
        
        try {
          // Get location types and status mappings
          const { data: locationTypes } = await supabase
            .from('master_data')
            .select('id, label')
            .eq('category', 'LOCATION_TYPE');

          const { data: statusLookup } = await supabase
            .from('status_lookup')
            .select('id, status_name')
            .eq('category', 'LOCATION');

          // Process each row
          for (const row of results.data as any[]) {
            if (!row.Location_Name) continue;

            // Find type ID
            const typeId = locationTypes?.find(
              t => t.label.toLowerCase() === row.Type?.toLowerCase()
            )?.id;

            if (!typeId) {
              console.error(`Type not found: ${row.Type}`);
              continue;
            }

            // Find status ID
            const statusId = statusLookup?.find(
              s => s.status_name.toLowerCase() === row.Status?.toLowerCase()
            )?.id;

            if (!statusId) {
              console.error(`Status not found: ${row.Status}`);
              continue;
            }

            // Find parent location if specified
            let parentLocationId = null;
            if (row.Parent_Location) {
              const { data: parentLocation } = await supabase
                .from('locations')
                .select('id')
                .eq('name', row.Parent_Location)
                .maybeSingle();
              
              parentLocationId = parentLocation?.id;
            }

            // Check if location exists
            const { data: existingLocation } = await supabase
              .from('locations')
              .select('id')
              .eq('name', row.Location_Name)
              .maybeSingle();

            const locationData = {
              name: row.Location_Name,
              type_id: typeId,
              parent_location_id: parentLocationId,
              status_id: statusId,
              coordinates: null // Default to null for imported locations
            };

            if (existingLocation) {
              // Update existing location
              await supabase
                .from('locations')
                .update(locationData)
                .eq('id', existingLocation.id);
            } else {
              // Insert new location
              await supabase
                .from('locations')
                .insert([locationData]);
            }
          }

          toast({
            title: "Import Successful",
            description: "Locations have been imported/updated successfully"
          });
          onRefresh(); // Refresh the list
        } catch (error) {
          console.error('Import error:', error);
          toast({
            title: "Import Failed",
            description: "There was an error importing the locations",
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
        onClick={() => {
          onRefresh();
          toast({
            title: "Refreshed",
            description: "Location list has been refreshed",
          });
        }}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
}
