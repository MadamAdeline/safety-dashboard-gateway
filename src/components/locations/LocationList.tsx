import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";
import type { Location, LocationFilters } from "@/types/location";
import { useState, useEffect } from "react";
import { useLocations } from "@/hooks/use-locations";
import { useToast } from "@/hooks/use-toast";
import { LocationActions } from "@/components/locations/LocationActions";
import { LocationTableHeader } from "./table/LocationTableHeader";
import { LocationTableRow } from "./table/LocationTableRow";
import { LocationPagination } from "./table/LocationPagination";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";

interface LocationListProps {
  filters: LocationFilters;
  onEdit: (location: Location) => void;
  onFiltersChange: (filters: LocationFilters) => void;
}

export function LocationList({ filters, onEdit, onFiltersChange }: LocationListProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [newLocation, setNewLocation] = useState<Partial<Location> | null>(null);
  const [locationTypes, setLocationTypes] = useState<Array<{ id: string; label: string }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const { locations, isLoading, createLocation, deleteLocation, refetch } = useLocations();
  const { toast } = useToast();

  // Fetch location types from master_data
  useEffect(() => {
    const fetchLocationTypes = async () => {
      console.log('Fetching location types from master_data...');
      const { data, error } = await supabase
        .from('master_data')
        .select('id, label')
        .eq('category', 'LOCATION_TYPE')
        .eq('status', 'ACTIVE');

      if (error) {
        console.error('Error fetching location types:', error);
        return;
      }

      console.log('Location types fetched:', data);
      setLocationTypes(data || []);
    };

    fetchLocationTypes();
  }, []);

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
      location.name || '',
      getLocationTypeLabel(location),
      getParentLocationName(location),
      location.status_lookup?.status_name || getLocationStatus(location),
      location.coordinates ? JSON.stringify(location.coordinates) : '',
      location.full_path || ''
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

  const handleSaveNewLocation = async () => {
    if (!newLocation?.name || !newLocation.type_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createLocation.mutateAsync({
        name: newLocation.name,
        type_id: newLocation.type_id,
        parent_location_id: newLocation.parent_location_id || null,
        status_id: 1, // Default to ACTIVE
        coordinates: newLocation.coordinates || { lat: -37.8136, lng: 144.9631 },
        full_path: null, // This will be computed by the trigger
      });

      toast({
        title: "Success",
        description: "Location created successfully",
      });
      setNewLocation(null);
    } catch (error) {
      console.error('Error creating location:', error);
      toast({
        title: "Error",
        description: "Failed to create location",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      // Reset filters
      onFiltersChange({
        search: "",
        status: [],
        type: [],
        parentLocation: null
      });
      setSearchTerm("");
      
      // Reset pagination
      setCurrentPage(1);
      
      // Clear selection
      setSelectedItems([]);
      
      // Refetch data
      await refetch();
      
      toast({
        title: "Refreshed",
        description: "Location list has been refreshed and filters cleared",
      });
    } catch (error) {
      console.error('Error refreshing locations:', error);
      toast({
        title: "Error",
        description: "Failed to refresh locations",
        variant: "destructive",
      });
    }
  };

  const sortLocations = (locations: Location[]) => {
    return [...locations].sort((a, b) => {
      const nameComparison = a.name.localeCompare(b.name);
      if (nameComparison !== 0) return nameComparison;

      const parentA = getParentLocationName(a);
      const parentB = getParentLocationName(b);
      const parentComparison = parentA.localeCompare(parentB);
      if (parentComparison !== 0) return parentComparison;

      const typeA = getLocationTypeLabel(a);
      const typeB = getLocationTypeLabel(b);
      return typeA.localeCompare(typeB);
    });
  };

  const filteredData = sortLocations(
    locations.map(item => ({
      ...item,
      full_path: item.full_path || null
    })).filter((item) => {
      let matchesFilter = true;

      // Apply text search if there's a search term
      if (searchTerm) {
        matchesFilter = searchInLocation(item, searchTerm);
      }

      // Apply type filter if types are selected
      if (filters.type.length > 0) {
        matchesFilter = matchesFilter && filters.type.includes(getLocationTypeLabel(item) as any);
      }

      // Apply status filter if statuses are selected
      if (filters.status.length > 0) {
        matchesFilter = matchesFilter && filters.status.includes(getLocationStatus(item));
      }

      // Apply parent filter if parent is selected
      if (filters.parentLocation) {
        matchesFilter = matchesFilter && item.parent_location_id === filters.parentLocation;
      }

      return matchesFilter;
    })
  );

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
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <LocationActions 
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExport={() => {}} 
          onRefresh={handleRefresh}
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
            {newLocation && (
              <tr className="border-b hover:bg-[#F1F0FB] transition-colors">
                <td className="p-4"></td>
                <td className="p-4">
                  <Input
                    value={newLocation.name || ''}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter location name"
                    className="w-full"
                  />
                </td>
                <td className="p-4">
                  <Select
                    value={newLocation.type_id || ''}
                    onValueChange={(value) => setNewLocation(prev => ({ ...prev, type_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4">
                  <Select
                    value={newLocation.parent_location_id || ''}
                    onValueChange={(value) => setNewLocation(prev => ({ ...prev, parent_location_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveNewLocation}
                      className="hover:bg-green-100 text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setNewLocation(null)}
                      className="hover:bg-red-100 text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}
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
              onClick={() => setNewLocation({})}
              className="bg-dgxprt-purple hover:bg-dgxprt-purple/90"
              disabled={!!newLocation}
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
    </div>
  );
}
