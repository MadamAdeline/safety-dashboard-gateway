
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Location } from "@/types/location";

export const useLocations = () => {
  const queryClient = useQueryClient();

  const { data: locations = [], isLoading, refetch } = useQuery({
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
          full_path,
          is_storage_location,
          storage_type_id,
          master_data!type_id (id, label),
          storage_type:master_data!storage_type_id (id, label),
          status_lookup (id, status_name)
        `);

      if (error) {
        console.error('Error fetching locations:', error);
        toast({
          title: "Error",
          description: "Failed to load locations",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Locations fetched:', data);
      
      // Transform the data to match our Location type
      const transformedData: Location[] = (data || []).map(location => {
        // Handle coordinates parsing
        let parsedCoordinates = null;
        if (location.coordinates && typeof location.coordinates === 'object') {
          const coords = location.coordinates as { lat?: number | string, lng?: number | string };
          if (coords.lat !== undefined && coords.lng !== undefined) {
            parsedCoordinates = {
              lat: typeof coords.lat === 'string' ? parseFloat(coords.lat) : coords.lat,
              lng: typeof coords.lng === 'string' ? parseFloat(coords.lng) : coords.lng
            };
          }
        }

        return {
          ...location,
          coordinates: parsedCoordinates,
          parent_location_id: location.parent_location_id || null,
          full_path: location.full_path || null,
          is_storage_location: location.is_storage_location || false,
          storage_type_id: location.storage_type_id || null,
          master_data: location.master_data || undefined,
          storage_type: location.storage_type || undefined,
          status_lookup: location.status_lookup || undefined
        };
      });

      return transformedData;
    },
  });

  // Query to get the ACTIVE status ID
  const { data: activeStatusId } = useQuery({
    queryKey: ['locationActiveStatusId'],
    queryFn: async () => {
      console.log('Fetching active status ID for locations...');
      const { data, error } = await supabase
        .from('status_lookup')
        .select('id')
        .eq('category', 'LOCATION')
        .eq('status_name', 'ACTIVE')
        .single();

      if (error) {
        console.error('Error fetching active status ID:', error);
        throw error;
      }

      console.log('Active status ID fetched:', data.id);
      return data.id;
    },
  });

  const createLocation = useMutation({
    mutationFn: async (newLocation: Omit<Location, 'id'>) => {
      if (!activeStatusId) {
        throw new Error('Status ID not available');
      }

      const locationData = {
        ...newLocation,
        status_id: activeStatusId,
        coordinates: newLocation.coordinates ? {
          lat: newLocation.coordinates.lat,
          lng: newLocation.coordinates.lng
        } : null,
        is_storage_location: newLocation.is_storage_location || false,
        storage_type_id: newLocation.storage_type_id || null
      };

      console.log('Creating new location:', locationData);
      const { data, error } = await supabase
        .from('locations')
        .insert([locationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating location:', error);
        toast({
          title: "Error",
          description: "Failed to create location",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Location created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Success",
        description: "Location created successfully",
      });
    },
  });

  const updateLocation = useMutation({
    mutationFn: async (location: Location) => {
      const locationData = {
        ...location,
        coordinates: location.coordinates ? {
          lat: location.coordinates.lat,
          lng: location.coordinates.lng
        } : null
      };

      console.log('Updating location:', locationData);
      const { data, error } = await supabase
        .from('locations')
        .update(locationData)
        .eq('id', location.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating location:', error);
        toast({
          title: "Error",
          description: "Failed to update location",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Location updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
    },
  });

  const deleteLocation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting location:', id);
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting location:', error);
        toast({
          title: "Error",
          description: "Failed to delete location",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Location deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    },
  });

  return {
    locations,
    isLoading,
    createLocation,
    updateLocation,
    deleteLocation,
    refetch
  };
};
