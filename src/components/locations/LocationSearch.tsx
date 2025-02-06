
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Location } from "@/types/location";

interface LocationSearchProps {
  selectedLocationId?: string | null;
  initialLocation?: Location | null;
  onLocationSelect: (location: Location) => void;
  className?: string;
}

export function LocationSearch({ 
  selectedLocationId, 
  initialLocation, 
  onLocationSelect, 
  className 
}: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      console.log('Fetching locations from Supabase...');
      const { data, error } = await supabase
        .from('locations')
        .select(`
          id,
          name,
          type_id,
          parent_location_id,
          status_id,
          coordinates,
          master_data (id, label),
          status_lookup (id, status_name)
        `)
        .eq('status_id', 1); // Only fetch active locations
      
      if (error) {
        console.error('Error fetching locations:', error);
        throw error;
      }

      console.log('Fetched locations:', data);
      return (data || []).map(location => ({
        ...location,
        coordinates: location.coordinates || null,
        parent_location_id: location.parent_location_id || null,
      })) as Location[];
    },
    staleTime: 5000 // Cache for 5 seconds
  });

  useEffect(() => {
    if (initialLocation) {
      console.log('Setting initial search term from location:', initialLocation.name);
      setSearchTerm(initialLocation.name);
    }
  }, [initialLocation]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsDropdownOpen(true);
    console.log("Searching for:", value);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const getParentLocationName = (location: Location): string => {
    if (!location.parent_location_id) return "-";
    const parentLocation = locations?.find(loc => loc.id === location.parent_location_id);
    console.log('Finding parent for location:', location.name, 'Parent:', parentLocation?.name);
    return parentLocation ? parentLocation.name : "-";
  };

  const filteredLocations = locations?.filter(location => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = location.name.toLowerCase().includes(searchLower);
    const parentMatch = getParentLocationName(location).toLowerCase().includes(searchLower);
    
    console.log('Filtering location:', location.name, 'Name match:', nameMatch, 'Parent match:', parentMatch);
    return nameMatch || parentMatch;
  });

  console.log('Rendered LocationSearch with:', {
    searchTerm,
    locationsCount: locations?.length,
    filteredCount: filteredLocations?.length,
    selectedLocationId
  });

  return (
    <div className={className}>
      <div className="relative">
        <Input
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleInputFocus}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        
        {isDropdownOpen && locations && (
          <div className="absolute w-full bg-white mt-1 border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredLocations?.map(location => (
              <div
                key={location.id}
                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                  selectedLocationId === location.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => {
                  console.log('Selected location:', location);
                  onLocationSelect(location);
                  setIsDropdownOpen(false);
                  setSearchTerm(location.name);
                }}
              >
                <div className="font-medium">{location.name || 'Unnamed Location'}</div>
                <div className="text-sm text-gray-500">
                  Parent: {getParentLocationName(location)}
                </div>
              </div>
            ))}
            {(!filteredLocations || filteredLocations.length === 0) && (
              <div className="p-2 text-gray-500 text-center">
                No locations found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
