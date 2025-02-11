import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { LocationSearch } from "@/components/locations/LocationSearch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Location } from "@/types/location";
import { SiteRegisterActions } from "@/components/site-registers/SiteRegisterActions";
import { useUserRole } from "@/hooks/use-user-role";

interface SiteRegisterListProps {
  searchTerm: string;
  onEdit: (siteRegister: any) => void;
  setSearchTerm: (term: string) => void;
}

export function SiteRegisterList({ searchTerm, onEdit, setSearchTerm }: SiteRegisterListProps) {
  const { data: userData } = useUserRole();
  const isRestrictedRole = userData?.role && ["standard", "manager"].includes(userData.role.toLowerCase());
  const [selectedLocation, setSelectedLocation] = React.useState<Location | null>(
    userData?.location ? {
      id: userData.location.id,
      name: userData.location.full_path.split(' > ').pop() || '',
      full_path: userData.location.full_path,
    } as Location : null
  );

  // Query to fetch all child locations for the selected location
  const { data: locationHierarchy, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locationHierarchy', selectedLocation?.id],
    queryFn: async () => {
      if (!selectedLocation) return [];

      const { data, error } = await supabase.rpc('get_location_hierarchy', {
        selected_location_id: selectedLocation.id
      });

      if (error) {
        console.error("Error fetching child locations:", error);
        return [];
      }

      return data; // Function already returns an array of location IDs
    },
    enabled: !!selectedLocation
  });

  const { data: siteRegisters, isLoading: isLoadingRegisters, refetch } = useQuery({
    queryKey: ['site-registers', locationHierarchy],
    queryFn: async () => {
      const query = supabase
        .from('site_registers')
        .select(`
          id,
          location_id,
          product_id,
          override_product_name,
          current_stock_level,
          exact_location,
          storage_conditions,
          max_stock_level,
          uom_id,
          products (
            id,
            product_name,
            uom:master_data!products_uom_id_fkey (
              id,
              label
            )
          ),
          locations (
            id,
            name,
            full_path
          )
        `);

      // Use location hierarchy for both restricted and admin users
      if (locationHierarchy && locationHierarchy.length > 0) {
        // Extract just the IDs from the location hierarchy and include them in the query
        const locationIds = locationHierarchy.map(loc => loc.id);
        query.in('location_id', locationIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching site registers:', error);
        throw error;
      }

      console.log('Fetched site registers:', data);
      return data;
    },
    enabled: !isLoadingLocations
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('site_registers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Site register deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting site register:', error);
      toast({
        title: "Error",
        description: "Failed to delete site register",
        variant: "destructive",
      });
    }
  };

  const handleLocationSelect = (location: Location) => {
    console.log('Selected location:', location);
    setSelectedLocation(location);
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Export functionality to be implemented");
  };

  const handleRefresh = () => {
    refetch();
  };

  const filteredRegisters = siteRegisters?.filter(register => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (register.products?.product_name?.toLowerCase().includes(searchLower)) ||
      (register.override_product_name?.toLowerCase().includes(searchLower))
    );
  });

  if (isLoadingLocations || isLoadingRegisters) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <Label>Location</Label>
        <div className="flex items-center gap-4">
          <div className="w-1/2">
            {isRestrictedRole ? (
              <Input
                value={selectedLocation?.name || ''}
                readOnly
                className="bg-gray-100 text-gray-600"
              />
            ) : (
              <LocationSearch
                selectedLocationId={selectedLocation?.id || null}
                initialLocation={selectedLocation}
                onLocationSelect={handleLocationSelect}
                className="w-full"
              />
            )}
          </div>
          {selectedLocation?.full_path && (
            <Input
              value={selectedLocation.full_path}
              readOnly
              className="bg-gray-50 text-gray-600 flex-1"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search site registers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <SiteRegisterActions
          onExport={handleExport}
          onRefresh={handleRefresh}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Override Product Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Unit of Measure</TableHead>
              <TableHead>Current Stock Level</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegisters?.map((register) => (
              <TableRow key={register.id}>
                <TableCell>{register.products?.product_name}</TableCell>
                <TableCell>{register.override_product_name || '-'}</TableCell>
                <TableCell>{register.locations?.name}</TableCell>
                <TableCell>{register.products?.uom?.label}</TableCell>
                <TableCell>{register.current_stock_level}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(register)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(register.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
