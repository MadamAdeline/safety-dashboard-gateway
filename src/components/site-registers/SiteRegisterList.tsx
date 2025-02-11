
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { useUserRole } from "@/hooks/use-user-role";

interface SiteRegisterListProps {
  searchTerm: string;
  onEdit: (siteRegister: any) => void;
}

export function SiteRegisterList({ searchTerm, onEdit }: SiteRegisterListProps) {
  const [selectedLocation, setSelectedLocation] = React.useState<Location | null>(null);
  const { data: userRole } = useUserRole();
  
  // Fetch user's location if they are a Manager or Standard user
  const { data: userLocation } = useQuery({
    queryKey: ['userLocation'],
    queryFn: async () => {
      if (!['manager', 'standard'].includes(userRole?.toLowerCase() || '')) {
        return null;
      }

      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return null;

      const { data, error } = await supabase
        .from('users')
        .select(`
          locations (
            id,
            name,
            full_path,
            type_id,
            parent_location_id,
            status_id,
            coordinates,
            master_data (
              id,
              label
            ),
            status_lookup (
              id,
              status_name
            )
          )
        `)
        .eq('email', userEmail)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user location:', error);
        return null;
      }

      if (data?.locations) {
        const locationData = data.locations;
        let coordinates = null;
        
        if (locationData.coordinates && 
            typeof locationData.coordinates === 'object' && 
            'lat' in locationData.coordinates && 
            'lng' in locationData.coordinates) {
          coordinates = {
            lat: Number(locationData.coordinates.lat) || 0,
            lng: Number(locationData.coordinates.lng) || 0
          };
        }

        return {
          ...locationData,
          coordinates,
          parent_location_id: locationData.parent_location_id || null,
          full_path: locationData.full_path || null,
          master_data: locationData.master_data || undefined,
          status_lookup: locationData.status_lookup || undefined
        } as Location;
      }

      return null;
    },
    enabled: ['manager', 'standard'].includes(userRole?.toLowerCase() || '')
  });

  // Set the user's location when it's loaded
  React.useEffect(() => {
    if (userLocation) {
      setSelectedLocation(userLocation);
    }
  }, [userLocation]);

  const { data: siteRegisters, isLoading, refetch } = useQuery({
    queryKey: ['site-registers', selectedLocation?.id],
    queryFn: async () => {
      const query = supabase
        .from('site_registers')
        .select(`
          *,
          products (
            id,
            product_name,
            uom:master_data!products_uom_id_fkey (
              id,
              label
            )
          ),
          locations:location_id (
            id,
            name,
            full_path
          )
        `);

      if (selectedLocation?.id) {
        query.eq('location_id', selectedLocation.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching site registers:', error);
        throw error;
      }

      console.log('Site registers data:', data);
      return data;
    },
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

  const filteredRegisters = siteRegisters?.filter(register => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      register.products?.product_name.toLowerCase().includes(searchLower) ||
      register.override_product_name?.toLowerCase().includes(searchLower)
    );
  });

  const isLocationReadOnly = true; // Always readonly for both Manager and Standard users

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Label>Location</Label>
          <div className="flex items-center gap-4">
            <div className="w-[300px]">
              <LocationSearch
                selectedLocationId={selectedLocation?.id || null}
                initialLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
                className="w-full"
                disabled={isLocationReadOnly}
              />
            </div>
            {selectedLocation?.full_path && (
              <Input
                value={selectedLocation.full_path}
                readOnly
                className="bg-gray-50 text-gray-600"
              />
            )}
          </div>
        </div>
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
            {filteredRegisters?.map((register) => {
              // Debug log for location path
              console.log('Register location full path:', register.locations?.full_path);
              
              return (
                <TableRow key={register.id}>
                  <TableCell>{register.products?.product_name || '-'}</TableCell>
                  <TableCell>{register.override_product_name || '-'}</TableCell>
                  <TableCell>{String(register.locations?.full_path || '-')}</TableCell>
                  <TableCell>{register.products?.uom?.label || '-'}</TableCell>
                  <TableCell>{String(register.current_stock_level || '0')}</TableCell>
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
