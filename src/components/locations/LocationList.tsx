import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Location, LocationFilters } from "@/types/location";
import { useState } from "react";
import { useLocations } from "@/hooks/use-locations";
import { useToast } from "@/hooks/use-toast";
import { LocationSearch } from "@/components/locations/LocationSearch";
import { LocationActions } from "@/components/locations/LocationActions";
import { LocationTableHeader } from "./table/LocationTableHeader";
import { LocationTableRow } from "./table/LocationTableRow";
import { LocationPagination } from "./table/LocationPagination";
import { LocationForm } from "./LocationForm";

interface LocationListProps {
  filters: LocationFilters;
  onEdit: (location: Location) => void;
  onFiltersChange: (filters: LocationFilters) => void;
}

export function LocationList({ filters, onEdit, onFiltersChange }: LocationListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  const { locations, isLoading, deleteLocation } = useLocations();
  const { toast } = useToast();

  const getLocationTypeLabel = (location: Location): string => {
    return location.master_data?.label || "Unknown";
  };

  const getLocationStatus = (location: Location): "ACTIVE" | "INACTIVE" => {
    return location.status_id === 1 ? "ACTIVE" : "INACTIVE";
  };

  const getParentLocationName = (location: Location): string => {
    if (!location.parent_location_id) return "-";
    const parentLocation = locations.find(loc => loc.id === location.parent_location_id);
    return parentLocation ? parentLocation.name : "-";
  };

  const searchInLocation = (location: Location, searchTerm: string): boolean => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fieldsToSearch = [
      location.name,
      getLocationTypeLabel(location),
      getParentLocationName(location),
      location.status_lookup?.status_name || getLocationStatus(location),
      location.coordinates ? JSON.stringify(location.coordinates) : '',
    ];

    return fieldsToSearch.some(field => 
      field.toLowerCase().includes(searchLower)
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLocation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    }
  };

  const filteredData = locations.map(item => ({
    ...item,
    coordinates: typeof item.coordinates === 'string' 
      ? JSON.parse(item.coordinates)
      : item.coordinates
  })).filter((item) => {
    if (!searchInLocation(item, filters.search)) {
      return false;
    }
    if (filters.type.length > 0 && !filters.type.includes(getLocationTypeLabel(item) as any)) {
      return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(getLocationStatus(item))) {
      return false;
    }
    if (filters.parentLocation && item.parent_location_id !== filters.parentLocation) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <LocationSearch 
          value={filters.search}
          onChange={(value) => onFiltersChange({ ...filters, search: value })}
        />
        <LocationActions 
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExport={() => {}} 
          onRefresh={() => {
            toast({
              title: "Refreshed",
              description: "Location list has been refreshed",
            });
          }}
          filteredData={filteredData}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <LocationTableHeader
            onToggleSelectAll={toggleSelectAll}
            isAllSelected={paginatedData.length > 0 && selectedItems.length === paginatedData.length}
            hasData={paginatedData.length > 0}
          />
          <TableBody>
            {paginatedData.map((item) => (
              <LocationTableRow
                key={item.id}
                location={item}
                isSelected={selectedItems.includes(item.id)}
                onToggleSelect={toggleSelectItem}
                onEdit={onEdit}
                onDelete={handleDelete}
                getLocationTypeLabel={getLocationTypeLabel}
                getParentLocationName={getParentLocationName}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} results
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const newLocation = {
                  id: '',
                  name: '',
                  type_id: '',
                  parent_location_id: null,
                  status_id: 1,
                  coordinates: { lat: -37.8136, lng: 144.9631 },
                  isNew: true
                } as Location;
                setEditingLocation(newLocation);
              }}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <LocationPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {editingLocation && (
        <LocationForm
          initialData={editingLocation}
          onClose={() => setEditingLocation(null)}
        />
      )}
    </div>
  );
}